import type { TrackDbEntry } from './types.ts'
import { readJSON } from './util.ts'

if (!process.argv[2]) {
  throw new Error(`usage: ${process.argv[0]} ${process.argv[1]} <tracks.json>`)
}

const tracks = readJSON(process.argv[2]) as Record<string, TrackDbEntry>

function splitOnce(s: string, s2: string) {
  const i = s.indexOf(s2)
  return [s.slice(0, i), s.slice(i + 1)]
}

const tracks2 = {} as Record<string, unknown>
for (const [key, val] of Object.entries(tracks).filter(
  ([_key, val]) => val.type.startsWith('big') || val.type.startsWith('bam'),
)) {
  tracks2[key] = {
    ...val,
    settings: Object.fromEntries(
      val
        .settings!.split('\n')
        .map(s => splitOnce(s, ' '))
        .filter(f => !!f[0]),
    ),
  }
}
console.log(JSON.stringify(tracks2, null, 2))
