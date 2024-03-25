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
console.log('export LC_ALL=C')

for (const [key, val] of Object.entries(tracks).filter(([key, val]) =>
  val.type.startsWith('bed'),
)) {
  const infile = path.join(process.argv[3], key)
  const outfile = path.join(process.argv[4], key)
  console.log(`echo "processing ${key} ${val.type}"`)
  if (key.startsWith('snp')) {
    continue
  }
  if (fs.existsSync(`${infile}.sql`)) {
    const { stdout, stderr } = await pexec(`node dist/bedLike.js ${infile}.sql`)
    if (stderr.trim() === 'no_bin') {
      console.log(
        [
          `(echo "${stdout.trim()}" && pigz -dc ${infile}.txt.gz)  |sort -k1,1 -k2,2n |bgzip -@8  > ${outfile}.bed.gz`,
          `tabix -f ${outfile}.bed.gz;`,
        ].join('\n'),
      )
    } else {
      console.log(
        [
          `(echo "${stdout.trim()}" && pigz -dc ${infile}.txt.gz | hck -Ld$'\\t' -f2- )  |sort -k1,1 -k2,2n |bgzip -@8  > ${outfile}.bed.gz`,
          `tabix -f ${outfile}.bed.gz;`,
        ].join('\n'),
      )
    }
  } else {
    console.error('no sql file for ' + key)
  }
}
