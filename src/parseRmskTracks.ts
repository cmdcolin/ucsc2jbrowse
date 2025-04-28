import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import { readJSON } from './util.ts'

const pexec = promisify(exec)

if (process.argv.length < 5) {
  throw new Error(
    `usage: ${process.argv[0]} ${process.argv[1]} <tracks.json> <dbdir> <outdir>`,
  )
}
type Track = Record<string, string>

const tracks = readJSON(process.argv[2]) as Record<string, Track>

for (const [key, _val] of Object.entries(tracks).filter(([_key, val]) =>
  val.type.startsWith('rmsk'),
)) {
  const infile = path.join(process.argv[3], key)
  const outfile = path.join(process.argv[4], key)
  try {
    if (fs.existsSync(`${infile}.sql`)) {
      await pexec(
        `node src/rmskLike.ts ${infile}.sql ${infile}.txt.gz | sort -k1,1 -k2,2n| bgzip > ${outfile}.bed.gz`,
      )
    } else {
      console.error('no sql file for ' + key)
    }
  } catch (e) {
    console.error(e)
    await pexec(`echo ${key} >> ${outfile}.errors`)
  }
}
