import pkg from '@gmod/ucsc-hub'
import fs from 'fs'
const { TrackDbFile } = pkg

function findCategory(obj: any, tracks: any) {
  while (obj.parent) {
    obj = tracks[obj.parent.split(' ')[0]]?.data
  }
  return obj.group
}

const hub = fs.readFileSync(process.argv[2], 'utf8')
const config = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))
const tracks = new TrackDbFile(hub)
const asm = config.assemblies[0].name

fs.writeFileSync(
  process.argv[3],
  JSON.stringify(
    {
      ...config,
      tracks: Object.entries(tracks.data)
        .map(([key, val]) => {
          const { track, bigDataUrl, longLabel } = val!.data
          const grp = findCategory(val!.data, tracks.data)
          if (bigDataUrl) {
            const uri = 'https://hgdownload.soe.ucsc.edu/' + bigDataUrl
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
