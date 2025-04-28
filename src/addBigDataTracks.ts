import fs from 'fs'
import { readJSON } from './util.ts'

interface JBrowseConfig {
  assemblies: { name: string }[]
  tracks: { trackId: string; [key: string]: unknown }[]
}

interface BigDataTrack {
  tableName: string
  settings: { bigDataUrl?: string }
}

type BigDataTracksJson = Record<string, BigDataTrack>

const bigDataEntries = readJSON(process.argv[2]) as BigDataTracksJson
const config = readJSON(process.argv[3]) as JBrowseConfig
const currTrackIds = new Set(config.tracks?.map(t => t.trackId) || [])
const base = 'https://hgdownload.soe.ucsc.edu'

fs.writeFileSync(
  process.argv[3],
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
                  assemblyNames: [config.assemblies[0].name],
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
                  assemblyNames: [config.assemblies[0].name],
                  adapter: {
                    type: 'BamAdapter',
                    uri,
                    // @ts-expect-error
                    sequenceAdapter: config.assemblies[0].sequence.adapter,
                  },
                }
              } else {
                return {
                  trackId: tableName,
                  name: tableName,
                  type: 'QuantitativeTrack',
                  assemblyNames: [config.assemblies[0].name],
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
