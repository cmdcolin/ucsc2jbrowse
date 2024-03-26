import fs from 'fs'

const tracks = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) as Record<
  string,
  { tableName: string; url?: string; html?: string }
>
const config = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) as {
  tracks: { trackId: string }[]
}

const a = new Set(
  Object.values(tracks)
    .filter(f => !f.url?.includes('fantom'))
    .map(t => t.tableName),
)
const b = new Set(config.tracks.map((t: any) => t.trackId))

console.log(
  JSON.stringify(
    [...new Set([...a].filter(x => !b.has(x)))].sort().map(t => {
      const { html, ...rest } = tracks[t]
      return rest
    }),
    null,
    2,
  ),
)
