import { readConfig, readJSON, replaceLink, splitOnFirst } from './util.ts'

import type { TrackDbEntry } from './types.ts'

const config = readConfig(process.argv[2])
const tracksDb = readJSON(process.argv[3]) as Record<string, TrackDbEntry>

const cytobands = config.tracks.find(f => f.trackId === 'cytoBandIdeo')

console.log(
  JSON.stringify(
    {
      ...config,
      ...(cytobands
        ? {
            assemblies: [
              {
                ...config.assemblies[0],
                cytobands: {
                  adapter: {
                    type: 'CytobandAdapter',
                    uri: cytobands.adapter.bedGzLocation?.uri,
                  },
                },
              },
            ],
          }
        : {}),
      tracks: config.tracks.map(t => {
        const r = tracksDb[t.trackId]
        if (r) {
          const { settings, html, longLabel, shortLabel, grp, ...rest } =
            tracksDb[t.trackId]
          const s2 = Object.fromEntries(
            settings
              .split('\n')
              .map(r => splitOnFirst(r, ' '))
              .filter(([key]) => !!key),
          )
          return {
            ...t,
            metadata: {
              ...rest,
              ...s2,
              html: replaceLink(html),
            },
            name: shortLabel,
            description: longLabel,
            category: [
              grp,
              s2.parent.replace(' on', '').replace(' off', ''),
            ].filter(f => !!f),
          }
        } else {
          console.error('track not found in trackDb', t.trackId)
          return t
        }
      }),
    },
    null,
    2,
  ),
)
