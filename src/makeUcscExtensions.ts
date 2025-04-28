import fs from 'node:fs'
import path from 'node:path'

import { dedupe } from './dedupe.ts'
import { readConfig } from './util.ts'

const base = 'ucscExtensions'
const ret = fs.readdirSync(base)
const target = process.argv[2]

for (const item of ret) {
  const accession = item.replace('.json', '')
  const f = `${target}/${accession}/config.json`

  // Create directory structure if it doesn't exist
  const dir = path.dirname(f)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    })
  }

  const existingConfig = readConfig(f)
  const extensionConfig = readConfig(path.join(base, item))

  fs.writeFileSync(
    f,
    JSON.stringify(
      {
        ...existingConfig,
        ...extensionConfig,
        tracks: dedupe(
          [...extensionConfig.tracks, ...existingConfig.tracks],
          t => t.trackId,
        ),
      },
      undefined,
      2,
    ),
  )
  console.log(`Updated config file: ${f}`)
}
