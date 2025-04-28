import { categoryMap } from './const.ts'
import { readConfig, readJSON, splitOnFirst } from './util.ts'

import type { TrackDbEntry } from './types.ts'

const config = readConfig(process.argv[2])
const tracksDb = readJSON(process.argv[3]) as Record<string, TrackDbEntry>

console.log(
  JSON.stringify(
    {
      ...config,
      tracks: config.tracks.map(t => {
        const r = tracksDb[t.trackId]
        if (r) {
          const { settings, html, longLabel, shortLabel, grp, ...rest } =
            tracksDb[t.trackId]
          return {
            ...t,
            metadata: {
              ...rest,
              ...Object.fromEntries(
                settings
                  .split('\n')
                  .map(r => splitOnFirst(r, ' '))
                  .filter(([key]) => !!key),
              ),
              html: html
                .replaceAll('\\', ' ')
                .replaceAll('../../', 'https://genome.ucsc.edu/')
                .replaceAll('../', 'https://genome.ucsc.edu/')
                .replaceAll('"/cgi-bin', '"https://genome.ucsc.edu/cgi-bin'),
            },
            name: shortLabel,
            description: longLabel,
            category: [
              grp,
              Object.fromEntries(
                settings
                  .split('\n')
                  .map(r => splitOnFirst(r, ' '))
                  .filter(([key]) => !!key),
              )
                .parent.replace(' on', '')
                .replace(' off', ''),
            ]
              .filter(f => !!f)
              .map(r => categoryMap[r as keyof typeof categoryMap] ?? r),
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
