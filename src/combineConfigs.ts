import { readConfig } from './util.ts'

const configs = process.argv.slice(2).map(s => readConfig(s))

function updateURL(config: Record<string, unknown>, add: string) {
  if (typeof config === 'object') {
    for (const key of Object.keys(config)) {
      if (typeof config[key] === 'object') {
        updateURL(config[key] as Record<string, unknown>, add)
      } else if (key === 'uri') {
        // @ts-expect-error
        config.uri = config.uri.startsWith('http')
          ? config.uri
          : `${add}/${config.uri}`
      }
    }
  }
}

const asms2 = configs.map(config => config.assemblies[0] as { name: string })

console.log(
  JSON.stringify(
    {
      assemblies: asms2.map(assembly => {
        updateURL(assembly, assembly.name)
        return { ...assembly }
      }),
      tracks: configs.flatMap(
        (config, idx) =>
          config.tracks?.map(track => {
            const asm = asms2[idx].name
            updateURL(track, asm)
            return {
              ...track,
              trackId: `${track.trackId}_${asm}`,
            }
          }) || [],
      ),

      aggregateTextSearchAdapters: configs
        .map(config => config.aggregateTextSearchAdapters || [])
        .flat(),
    },
    null,
    2,
  ),
)
