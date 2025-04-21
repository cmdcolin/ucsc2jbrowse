import fs from 'fs'

interface TrackDbEntry {
  settings: string
  html: string
  longLabel: string
  grp: string
  shortLabel: string
}
const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const tracksDb = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) as Record<
  string,
  TrackDbEntry
>

function splitOnFirst(str: string, sep: string) {
  const index = str.indexOf(sep)
  return index < 0
    ? [str, '']
    : [str.slice(0, index), str.slice(index + sep.length)]
}

console.log(
  JSON.stringify(
    {
      ...config,
      tracks: config.tracks.map((t: Record<string, string>) => {
        const r = tracksDb[t.trackId]
        if (r) {
          const { settings, html, longLabel, shortLabel, grp, ...rest } =
            tracksDb[t.trackId]
          const settings2 = Object.fromEntries(
            settings.split('\n').map(r => splitOnFirst(r, ' ')),
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
            category: [grp, settings2.parent].filter(f => !!f),
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
