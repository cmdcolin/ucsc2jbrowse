import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const pexec = promisify(exec)

if (process.argv.length < 5) {
  throw new Error(
    `usage: ${process.argv[0]} ${process.argv[1]} <tracks.json> <dbdir> <outdir>`,
  )
}
type Track = Record<string, string>

const tracks = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) as Record<
  string,
  Track
>

for (const [key, val] of Object.entries(tracks).filter(([key, val]) =>
  val.type.startsWith('rmsk'),
)) {
  const infile = path.join(process.argv[3], key)
  const outfile = path.join(process.argv[4], key)
  try {
    if (fs.existsSync(`${infile}.sql`)) {
      console.log(process.argv[1], 'processing', key)
      await pexec(
        `tsx src/rmskLike.ts ${infile}.sql ${infile}.txt.gz | bgzip -@8 > ${outfile}.bed.gz`,
      )
    } else {
      console.error('no sql file for ' + key)
    }
  } catch (e) {
    console.error(e)
    await pexec(`echo ${key} >> ${outfile}.errors`)
  }
}
