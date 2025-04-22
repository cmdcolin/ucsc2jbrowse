import pkg, { RaStanza, TrackDbFile } from '@gmod/ucsc-hub'
import fs from 'fs'
const { SingleFileHub } = pkg

type Adapter = Record<string, unknown>

const hub = new SingleFileHub(fs.readFileSync(process.argv[2], 'utf8'))
const asm = 'hs1'
const s = (s: string) => 'https://hgdownload.soe.ucsc.edu/' + s

const sequenceAdapter = {
  type: 'TwoBitAdapter',
  uri: s(hub.genome.data.twoBit),
  chromSizes: s(hub.genome.data.chromSizes),
}
fs.writeFileSync(
  process.argv[3],
  JSON.stringify(
    {
      assemblies: [
        {
          name: asm,
          sequence: {
            type: 'ReferenceSequenceTrack',
            trackId: `${asm}-referenceSequenceTrack`,
            adapter: sequenceAdapter,
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
        .map(val =>
          makeTrackConfig({
            track: val,
            trackDbUrl: s(asm),
            trackDb: hub.tracks,
            sequenceAdapter,
            assemblyName: asm,
          }),
        )
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

  return {
    trackId: `${assemblyName}-${data.track}`,
    description: data.longLabel,
    assemblyNames: [assemblyName],
    name,
    ...makeTrackConfigSub({ track, trackDbUrl, trackDb, sequenceAdapter }),
  }
}
function makeTrackConfigSub({
  track,
  trackDbUrl,
  trackDb,
  sequenceAdapter,
}: {
  track: RaStanza
  trackDbUrl: string
  trackDb: TrackDbFile
  sequenceAdapter: Adapter
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
        return generateUnknownTrackConf(name, baseTrackType)
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
