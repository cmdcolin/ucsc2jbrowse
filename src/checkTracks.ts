import fs from 'fs'

const tracks = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const config = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))

const a = new Set(Object.values(tracks).map((t: any) => t.tableName))
const b = new Set(config.tracks.map((t: any) => t.trackId))

console.log(
  JSON.stringify([...new Set([...a].filter(x => !b.has(x)))], null, 2),
)
