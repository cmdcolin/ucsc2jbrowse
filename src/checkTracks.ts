import { readConfig, readJSON } from './util.ts'

const tracks = readJSON(process.argv[2]!) as Record<
  string,
  { tableName: string; url?: string; html?: string }
>
const config = readConfig(process.argv[3]!)

const a = new Set(
  Object.values(tracks)
    .filter(f => !f.url?.includes('fantom'))
    .map(t => t.tableName),
)
const b = new Set(config.tracks.map(t => t.trackId))

console.log(
  JSON.stringify(
    [...new Set([...a].filter(x => !b.has(x)))].sort().map(t => {
      const { html, ...rest } = tracks[t]!
      return rest
    }),
    null,
    2,
  ),
)
