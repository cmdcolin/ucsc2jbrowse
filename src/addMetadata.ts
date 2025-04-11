import fs from 'fs'

const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const tracksDb = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))

console.log(
  JSON.stringify(
    {
      ...config,
      tracks: config.tracks.map((t: Record<string, string>) => {
        const r = tracksDb[t.trackId]
        if (r) {
          const { settings, html, longLabel, grp, ...rest } =
            tracksDb[t.trackId]
          return {
            ...t,
            metadata: {
              ...rest,
              html: html
                .replaceAll('\\', ' ')
                .replaceAll('../../', 'https://genome.ucsc.edu/')
                .replaceAll('../', 'https://genome.ucsc.edu/')
                .replaceAll('"/cgi-bin', '"https://genome.ucsc.edu/cgi-bin'),
            },
            name: longLabel,
            category: [grp],
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
