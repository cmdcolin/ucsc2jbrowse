import fs from 'fs'

interface TrackDbEntry {
  settings: string
  html: string
  longLabel: string
  grp: string
  shortLabel: string
}

interface JBrowseConfig {
  tracks: { trackId: string; adapter: { bedGzLocation?: { uri: string } } }[]
  assemblies: { name: string }[]
}

const config = JSON.parse(
  fs.readFileSync(process.argv[2], 'utf8'),
) as JBrowseConfig

const tracksDb = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) as Record<
  string,
  TrackDbEntry
>

function splitOnFirst(str: string, sep: string) {
  const index = str.indexOf(sep)
  return index < 0
    ? ([str, ''] as const)
    : ([str.slice(0, index), str.slice(index + sep.length)] as const)
}

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
                    uri: cytobands.adapter.bedGzLocation?.uri,
                  },
                },
              },
            ],
          }
        : {}),
      tracks: config.tracks.map(t => {
        const r = tracksDb[t.trackId]
        if (r) {
          const { settings, html, longLabel, shortLabel, grp, ...rest } =
            tracksDb[t.trackId]
          const settings2 = Object.fromEntries(
            settings
              .split('\n')
              .map(r => splitOnFirst(r, ' '))
              .filter(([key]) => !!key),
          )
          return {
            ...t,
            metadata: {
              ...rest,
              ...settings2,
              html: html
                .replaceAll('\\', ' ')
                .replaceAll('../../', 'https://genome.ucsc.edu/')
                .replaceAll('../', 'https://genome.ucsc.edu/')
                .replaceAll('"/cgi-bin', '"https://genome.ucsc.edu/cgi-bin'),
            },
            name: shortLabel,
            description: longLabel,
            category: [
              grp,
              settings2.parent?.replace(' on', '')?.replace(' off', ''),
            ].filter(f => !!f),
          }
        } else {
          console.error('track not found in trackDb', t.trackId)
          return t
        }
      }),
    },
    null,
    2,
  ),
)
