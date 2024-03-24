import fs from 'fs'
import path from 'path'

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
console.log('set -v')
console.log('export LC_ALL=C')

for (const [key, val] of Object.entries(tracks).filter(([key, val]) =>
  val.type.startsWith('bed'),
)) {
  const infile = path.join(process.argv[3], key)
  const outfile = path.join(process.argv[4], key)
  console.log(`echo "processing ${key}"`)
  console.log(
    [
      `(node dist/bedLike.js ${infile}.sql && pigz -dc ${infile}.txt.gz | hck -Ld$'\\t' -f2- )  |bgzip -@8  > ${outfile}.bed.gz`,
      `tabix -f ${outfile}.bed.gz;`,
    ].join('\n'),
  )
}
