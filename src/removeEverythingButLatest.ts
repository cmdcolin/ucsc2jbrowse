import fs from 'fs'

interface Track {
  trackId: string
}
const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) as {
  tracks: Track[]
}

let items = [
  'wgEncodeGencodePolyaV',
  'wgEncodeGencodePseudoGeneV',
  'wgEncodeGencodeCompV',
  'wgEncodeGencodeBasicV',
  'wgEncodeGencode2wayConsPseudoV',
  'cloneEndABC',
]
for (const i of items) {
  const ret = config.tracks
    .filter(f => f.trackId.startsWith(i))
    .sort((a, b) => a.trackId.localeCompare(b.trackId))
  const s = new Set()
  for (let i = 0; i < ret.length - 1; i++) {
    s.add(ret[i].trackId)
  }
  config.tracks = config.tracks.filter(f => !s.has(f.trackId))
}

console.log(JSON.stringify(config, null, 2))
