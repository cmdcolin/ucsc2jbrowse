import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
const e = promisify(exec)
if (!process.argv[2]) {
  throw new Error('usage: node parseGeneTracks.js <tracks.json>')
}
type Track = Record<string, string>

const tracks = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) as Record<
  string,
  Track
>

function splitOnce(s: string, s2: string) {
  const i = s.indexOf(s2)
  return [s.slice(0, i), s.slice(i + 1)]
}

let s = new Set()
let tracks2 = {} as Record<string, unknown>
for (const [key, val] of Object.entries(tracks).filter(([key, val]) =>
  val.type.startsWith('big'),
)) {
  s.add(val.type)
  const settings = Object.fromEntries(
    val.settings
      .split('\\')
      .map(s => splitOnce(s, ' '))
      .filter(f => !!f[0]),
  )
  tracks2[key] = { ...val, settings }
}
console.log(JSON.stringify(tracks2, null, 2))
