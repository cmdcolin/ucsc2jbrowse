import pkg from '@gmod/ucsc-hub'
import fs from 'fs'
const { SingleFileHub } = pkg

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
          const { track, bigDataUrl, longLabel } = val!.data
          const grp = findCategory(val!.data, hub.tracks.data)
          if (bigDataUrl) {
            const uri = s(bigDataUrl)
            if (bigDataUrl.endsWith('.bb') || bigDataUrl.endsWith('.bigBed')) {
              return {
                type: 'FeatureTrack',
                assemblyNames: [asm],
                name: longLabel,
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
                name: longLabel,
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
                name: longLabel,
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
