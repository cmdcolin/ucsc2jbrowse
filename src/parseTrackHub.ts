import pkg from '@gmod/ucsc-hub'
import fs from 'fs'

import type { RaStanza, TrackDbFile } from '@gmod/ucsc-hub'
import { notEmpty } from './notEmpty.ts'
const { SingleFileHub } = pkg

type Adapter = Record<string, unknown>

const hubFileText = fs.readFileSync(process.argv[2], 'utf8')

fs.writeFileSync(
  process.argv[3],
  JSON.stringify(
    generateJBrowseConfigForAssemblyHub({
      hubFileText,
      trackDbUrl:
        'https://hgdownload.soe.ucsc.edu/gbdb/hs1/hubs/public/hub.txt',
    }),
    null,
    2,
  ),
)

export function resolve(uri: string, baseUri: string | URL) {
  return new URL(uri, baseUri).href
}

export function generateJBrowseConfigForAssemblyHub({
  hubFileText,
  trackDbUrl,
}: {
  hubFileText: string
  trackDbUrl: string
}) {
  if (hubFileText.includes('useOneFile on')) {
    const hub = new SingleFileHub(hubFileText)
    const { genome, tracks } = hub
    const { data } = genome
    const { twoBitPath, chromSizes, htmlPath, chromAliasBb } = data
    const genomeName = genome.name!
    const shortLabel = data.description

    const sequenceAdapter = {
      type: 'TwoBitAdapter',
      uri: resolve(twoBitPath, trackDbUrl),
      chromSizes: resolve(chromSizes, trackDbUrl),
    }
    const asm = {
      name: genomeName,
      displayName: shortLabel,
      sequence: {
        type: 'ReferenceSequenceTrack',
        metadata: {
          ...data,
          ...(htmlPath
            ? {
                htmlPath: `<a href="${resolve(htmlPath, trackDbUrl)}">${htmlPath}</a>`,
              }
            : {}),
        },
        trackId: `${genomeName}-ReferenceSequenceTrack`,
        adapter: sequenceAdapter,
      },
      ...(chromAliasBb
        ? {
            refNameAliases: {
              adapter: {
                type: 'RefNameAliasAdapter',
                refNameColumnHeaderName: 'ucsc',
                uri: resolve(chromAliasBb.replace('.bb', '.txt'), trackDbUrl),
              },
            },
          }
        : {}),
    }

    return {
      assemblies: [asm],
      tracks: generateHubTracks({
        trackDb: tracks,
        trackDbUrl,
        assemblyName: genomeName,
        sequenceAdapter,
      }),
    }
  }
  throw new Error('not a single file hub')
}
export function generateHubTracks({
  trackDb,
  trackDbUrl,
  assemblyName,
  sequenceAdapter,
}: {
  trackDb: TrackDbFile
  trackDbUrl: string
  assemblyName: string
  sequenceAdapter: Adapter
}) {
  const parentTrackKeys = new Set([
    'superTrack',
    'compositeTrack',
    'container',
    'view',
  ])
  return Object.entries(trackDb.data)
    .map(([trackName, track]) => {
      const { data } = track
      if (Object.keys(data).some(key => parentTrackKeys.has(key))) {
        return undefined
      } else {
        const parentTracks = []
        let currentTrackName = trackName
        do {
          currentTrackName = trackDb.data[currentTrackName].data.parent || ''
          if (currentTrackName) {
            currentTrackName = currentTrackName.split(' ')[0]!
            parentTracks.push(trackDb.data[currentTrackName])
          }
        } while (currentTrackName)
        parentTracks.reverse()
        const trackConfig = makeTrackConfig({
          track,
          trackDbUrl,
          trackDb,
          sequenceAdapter,
          assemblyName,
        })
        return trackConfig
          ? {
              metadata: {
                ...track.data,
                ...(track.data.html
                  ? {
                      html: `<a href="${resolve(track.data.html, trackDbUrl)}">${track.data.html}</a>`,
                    }
                  : {}),
              },
              category: [
                track.data.group,
                ...parentTracks
                  .map(p => p.name)
                  .filter((f): f is string => !!f),
              ].filter(f => !!f),
              ...trackConfig,
            }
          : undefined
      }
    })
    .filter(f => notEmpty(f))
}

function makeTrackConfig({
  track,
  trackDbUrl,
  trackDb,
  sequenceAdapter,
  assemblyName,
}: {
  track: RaStanza
  trackDbUrl: string
  trackDb: TrackDbFile
  sequenceAdapter: Adapter
  assemblyName: string
}) {
  const { data } = track
  const bigDataUrlPre = data.bigDataUrl || ''
  const name =
    (data.shortLabel || '') + (bigDataUrlPre.includes('xeno') ? ' (xeno)' : '')
  const sub = makeTrackConfigSub({
    track,
    trackDbUrl,
    trackDb,
    sequenceAdapter,
    name,
  })
  return sub
    ? {
        trackId: `${assemblyName}-${data.track}`,
        description: data.longLabel,
        assemblyNames: [assemblyName],
        name,
        ...sub,
      }
    : undefined
}
function makeTrackConfigSub({
  track,
  trackDbUrl,
  trackDb,
  sequenceAdapter,
  name,
}: {
  track: RaStanza
  trackDbUrl: string
  trackDb: TrackDbFile
  sequenceAdapter: Adapter
  name: string
}) {
  const { data } = track
  const parent = data.parent || ''
  const bigDataUrlPre = data.bigDataUrl || ''
  const bigDataIdx = data.bigDataIndex || ''
  if (bigDataIdx) {
    throw new Error("Don't yet support bigDataIdx")
  }
  const trackType = data.type || trackDb.data[parent].data.type || ''
  let baseTrackType = trackType.split(' ')[0] || ''
  if (baseTrackType === 'bam' && bigDataUrlPre.toLowerCase().endsWith('cram')) {
    baseTrackType = 'cram'
  }
  const bigDataUrl = new URL(bigDataUrlPre, trackDbUrl)

  switch (baseTrackType) {
    case 'bam': {
      return {
        type: 'AlignmentsTrack',
        adapter: {
          type: 'BamAdapter',
          uri: bigDataUrl,
        },
      }
    }
    case 'cram': {
      return {
        type: 'AlignmentsTrack',
        adapter: {
          type: 'CramAdapter',
          uri: bigDataUrl,
          sequenceAdapter,
        },
      }
    }
    case 'bigWig': {
      return {
        type: 'QuantitativeTrack',
        adapter: {
          type: 'BigWigAdapter',
          uri: bigDataUrl,
        },
      }
    }
    default: {
      if (baseTrackType.startsWith('big')) {
        return {
          type: 'FeatureTrack',
          adapter: {
            type: 'BigBedAdapter',
            uri: bigDataUrl,
            scoreColumn: name.endsWith('wssd CN') ? 'ID' : undefined,
          },
        }
      } else if (baseTrackType === 'vcfTabix') {
        return {
          type: 'VariantTrack',
          adapter: {
            type: 'VcfTabixAdapter',
            uri: bigDataUrl,
          },
        }
      } else if (baseTrackType === 'hic') {
        return {
          type: 'HicTrack',
          adapter: {
            type: 'HicAdapter',
            uri: bigDataUrl,
          },
        }
      } else {
        // unsupported types
        //     case 'peptideMapping':
        //     case 'gvf':
        //     case 'ld2':
        //     case 'narrowPeak':
        //     case 'wig':
        //     case 'wigMaf':
        //     case 'halSnake':
        //     case 'bed':
        //     case 'bed5FloatScore':
        //     case 'bedGraph':
        //     case 'bedRnaElements':
        //     case 'broadPeak':
        //     case 'coloredExon':
        console.error('Unknown track type: ', track.data)
        return undefined
      }
    }
  }
}
export function generateUnknownTrackConf(
  trackName: string,
  trackUrl: string,
  categories?: string[],
) {
  return {
    type: 'FeatureTrack',
    name: `${trackName} (Unknown)`,
    description: `Could not determine track type for "${trackUrl}"`,
    category: categories,
  }
}
