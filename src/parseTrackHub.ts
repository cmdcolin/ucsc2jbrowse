import pkg from '@gmod/ucsc-hub'
import fs from 'fs'
const { SingleFileHub } = pkg

import type { RaStanza, TrackDbFile } from '@gmod/ucsc-hub'

function findCategory(obj: any, tracks: any) {
  while (obj.parent) {
    obj = tracks[obj.parent.split(' ')[0]]?.data
  }
  return obj.group
}

const hub = new SingleFileHub(fs.readFileSync(process.argv[2], 'utf8'))
const asm = 'hs1'
const s = (s: string) => 'https://hgdownload.soe.ucsc.edu/' + s

fs.writeFileSync(
  process.argv[3],
  JSON.stringify(
    {
      assemblies: [
        {
          name: asm,
          sequence: {
            type: 'ReferenceSequenceTrack',
            trackId: 'hs1-referenceSequenceTrack',
            adapter: {
              type: 'TwoBitAdapter',
              uri: s(hub.genome.data.twoBit),
              chromSizes: s(hub.genome.data.chromSizes),
            },
            refNameAliases: {
              adapter: {
                type: 'RefNameAliasAdapter',
                uri: s(hub.genome.data.chromAliasBb.replace('.bb', '.txt')),
              },
            },
          },
        },
      ],
      tracks: Object.values(hub.tracks.data)
        .map(val => {
          const { track, bigDataUrl, shortLabel } = val!.data
          const grp = findCategory(val!.data, hub.tracks.data)
          if (bigDataUrl) {
            const uri = s(bigDataUrl)
            if (bigDataUrl.endsWith('.bb') || bigDataUrl.endsWith('.bigBed')) {
              return {
                type: 'FeatureTrack',
                assemblyNames: [asm],
                name: shortLabel,
                category: grp ? [grp] : undefined,
                trackId: track,
                adapter: {
                  type: 'BigBedAdapter',
                  uri,
                },
              }
            } else if (bigDataUrl.endsWith('.vcf.gz')) {
              return {
                type: 'VariantTrack',
                assemblyNames: [asm],
                name: shortLabel,
                category: grp ? [grp] : undefined,
                trackId: track,
                adapter: {
                  type: 'VcfTabixAdapter',
                  uri,
                },
              }
            } else {
              return {
                type: 'QuantitativeTrack',
                name: shortLabel,
                assemblyNames: [asm],
                category: grp ? [grp] : undefined,
                trackId: track,
                adapter: {
                  type: 'BigWigAdapter',
                  uri,
                },
              }
            }
          }
          return undefined
        })
        .filter(f => !!f),
    },
    null,
    2,
  ),
)

function makeTrackConfig({
  track,
  trackDbUrl,
  trackDb,
  sequenceAdapter,
}: {
  track: RaStanza
  trackDbUrl: string
  trackDb: TrackDbFile
  sequenceAdapter: any
}) {
  const { data } = track

  const parent = data.parent || ''
  const bigDataUrlPre = data.bigDataUrl || ''
  const bigDataIdx = data.bigDataIndex || ''
  if (bigDataIdx) {
    throw new Error("Don't yet support bigDataIdx")
  }
  const trackType = data.type || trackDb.data[parent].data.type || ''
  const name =
    (data.shortLabel || '') + (bigDataUrlPre.includes('xeno') ? ' (xeno)' : '')

  let baseTrackType = trackType.split(' ')[0] || ''
  if (baseTrackType === 'bam' && bigDataUrlPre.toLowerCase().endsWith('cram')) {
    baseTrackType = 'cram'
  }
  const bigDataUrl = new URL(bigDataUrlPre, trackDbUrl)

  switch (baseTrackType) {
    case 'bam': {
      return {
        type: 'AlignmentsTrack',
        name,
        description: data.longLabel,
        adapter: {
          type: 'BamAdapter',
          uri: bigDataUrl,
        },
      }
    }
    case 'cram': {
      return {
        type: 'AlignmentsTrack',
        name,
        description: data.longLabel,
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
        name,
        description: data.longLabel,
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
          name,
          description: data.longLabel,
          adapter: {
            type: 'BigBedAdapter',
            uri: bigDataUrl,
          },
        }
      } else if (baseTrackType === 'vcfTabix') {
        return {
          type: 'VariantTrack',
          name,
          description: data.longLabel,
          adapter: {
            type: 'VcfTabixAdapter',
            uri: bigDataUrl,
          },
        }
      } else if (baseTrackType === 'hic') {
        return {
          type: 'HicTrack',
          name,
          description: data.longLabel,
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
        return generateUnknownTrackConf(name, baseTrackType)
      }
    }
  }
}

function generateUnknownTrackConf(
  trackName: string,
  trackUrl: string,
  categories?: string[],
) {
  const conf = {
    type: 'FeatureTrack',
    name: `${trackName} (Unknown)`,
    description: `Could not determine track type for "${trackUrl}"`,
    category: categories,
    trackId: '',
  }
  conf.trackId = `track-${Math.random()}`
  return conf
}
