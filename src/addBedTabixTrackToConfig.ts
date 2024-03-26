import fs from 'fs'
import path from 'path'

if (process.argv.length < 3) {
  throw new Error(
    `usage: ${process.argv[0]} ${process.argv[1]} <config.json> <file.bed.gz>`,
  )
}

const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) as {
  tracks: { trackId: string }[]
  assemblies: { name: string }[]
}

const arg = process.argv[3]
const base = path.basename(arg, '.bed.gz')
if (config.tracks.find(f => f.trackId === base)) {
  throw new Error('already there')
}
fs.writeFileSync(
  process.argv[2],
  JSON.stringify(
    {
      ...config,
      tracks: [
        ...config.tracks,
        {
          type: 'FeatureTrack',
          trackId: base,
          name: base,
          assemblyNames: [config.assemblies[0].name],
          adapter: {
            type: 'BedTabixAdapter',
            bedGzLocation: { uri: arg },
            index: { location: { uri: arg + '.tbi' } },
          },
        },
      ],
    },
    null,
    2,
  ),
)
