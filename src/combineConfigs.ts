const fs = require('fs')

interface Track {
  [key: string]: unknown
}
interface Config {
  tracks: Track[]
  assemblies: Record<string, unknown>[]
  aggregateTextSearchAdapters: Record<string, unknown>[]
}
const hg19 = JSON.parse(fs.readFileSync('hg19/config.json', 'utf8')) as Config
const hg38 = JSON.parse(fs.readFileSync('hg38/config.json', 'utf8')) as Config

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

console.log(
  JSON.stringify(
    {
      assemblies: [...hg19.assemblies, ...hg38.assemblies],
      tracks: [
        hg19.tracks.map(track => {
          updateURL(track, 'hg19')
          return track
        }),
        hg38.tracks.map(track => {
          updateURL(track, 'hg38')
          return track
        }),
      ],
      aggregateTextSearchAdapters: [
        ...hg19.aggregateTextSearchAdapters,
        ...hg38.aggregateTextSearchAdapters,
      ],
    },
    null,
    2,
  ),
)
