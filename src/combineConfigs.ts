import fs from 'fs'

interface Track {
  [key: string]: unknown
}
interface Config {
  tracks: Track[]
  assemblies: Record<string, unknown>[]
  aggregateTextSearchAdapters: Record<string, unknown>[]
}

const configs = process.argv
  .slice(2)
  .map(s => JSON.parse(fs.readFileSync(s, 'utf8')) as Config)

function updateURL(config: Record<string, unknown>, add: string) {
  if (typeof config === 'object') {
    for (const key of Object.keys(config)) {
      if (typeof config[key] === 'object') {
        updateURL(config[key] as Record<string, unknown>, add)
      } else if (key === 'uri') {
        config.uri = add + '/' + config.uri
      }
    }
  }
}

const asms = configs.map(c => c.assemblies[0].name as string)
console.log(
  JSON.stringify(
    {
      assemblies: configs.map(c => c.assemblies).flat(),
      tracks: configs
        .map((c, idx) =>
          c.tracks.map(track => {
            const asm = asms[idx]
            updateURL(track, asm)
            return { ...track, trackId: `${track.trackId}_${asm}` }
          }),
        )
        .flat(),

      aggregateTextSearchAdapters: configs
        .map(c => c.aggregateTextSearchAdapters)
        .flat(),
    },
    null,
    2,
  ),
)
