import fs from 'fs'

import { readConfig, readJSON } from './util.ts'

interface BigDataTrack {
  tableName: string
  settings: { bigDataUrl?: string }
}

type BigDataTracksJson = Record<string, BigDataTrack>

const bigDataEntries = readJSON(process.argv[2]!) as BigDataTracksJson
const config = readConfig(process.argv[3]!)
const currTrackIds = new Set(config.tracks.map(t => t.trackId))
const base = 'https://hgdownload.soe.ucsc.edu'
const asm0 = config.assemblies[0]!
fs.writeFileSync(
  process.argv[3]!,
  JSON.stringify(
    {
      ...config,
      tracks: [
        ...config.tracks,
        ...Object.values(bigDataEntries)
          .map(val => {
            const { settings, tableName } = val
            const { bigDataUrl } = settings
            if (bigDataUrl && !bigDataUrl.includes('fantom')) {
              const uri = bigDataUrl.startsWith(base)
                ? bigDataUrl
                : `${base}${bigDataUrl}`

              if (currTrackIds.has(tableName)) {
                throw new Error(`${tableName} already exists`)
              }

              if (
                bigDataUrl.endsWith('.bb') ||
                bigDataUrl.endsWith('.bigBed')
              ) {
                return {
                  trackId: tableName,
                  name: tableName,
                  type: 'FeatureTrack',
                  assemblyNames: [asm0.name],
                  adapter: {
                    type: 'BigBedAdapter',
                    uri,
                  },
                }
              } else if (bigDataUrl.endsWith('.bam')) {
                return {
                  trackId: tableName,
                  name: tableName,
                  type: 'AlignmentsTrack',
                  assemblyNames: [asm0.name],
                  adapter: {
                    type: 'BamAdapter',
                    uri,
                    // @ts-expect-error
                    sequenceAdapter: asm0.sequence.adapter,
                  },
                }
              } else {
                return {
                  trackId: tableName,
                  name: tableName,
                  type: 'QuantitativeTrack',
                  assemblyNames: [asm0.name],
                  adapter: {
                    type: 'BigWigAdapter',
                    uri,
                  },
                }
              }
            } else {
              return undefined
            }
          })
          .filter(f => !!f),
      ],
    },
    null,
    2,
  ),
)
