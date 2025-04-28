import { readConfig } from './util.ts'

const config = readConfig(process.argv[2]!)

const cytobands = config.tracks.find(f => f.trackId === 'cytoBandIdeo')

console.log(
  JSON.stringify(
    {
      ...config,
      ...(cytobands
        ? {
            assemblies: [
              {
                ...config.assemblies[0],
                cytobands: {
                  adapter: {
                    type: 'CytobandAdapter',
                    // @ts-expect-error
                    uri: cytobands.adapter.bedGzLocation?.uri,
                  },
                },
              },
            ],
          }
        : {}),
    },
    null,
    2,
  ),
)
