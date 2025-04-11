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

// const types = ['bed', 'narrowPeak', 'broadPeak', 'pgSnp', 'peptideMapping']
// many narrow/broad peak tracks
const types = ['bed', 'pgSnp', 'peptideMapping'] //less tracks

for (const [key, val] of Object.entries(tracks).filter(([_key, val]) =>
  types.some(t => val.type.startsWith(t)),
)) {
  const infile = path.join(process.argv[3], key)
  const outfile = path.join(process.argv[4], key)

  // these are large (snp) and numerous (wgEncode)
  if (key.startsWith('snp') || key.startsWith('wgEncode')) {
    continue
  }
  if (fs.existsSync(`${infile}.sql`)) {
    if (fs.existsSync(`${outfile}.bed.gz.csi`)) {
      console.log(`echo "already processed ${outfile}"`)
    } else {
      console.log(`echo " ${process.argv[1]} processing ${key} ${val.type}"`)
      const { stdout, stderr } = await pexec(
        `node src/bedLike.ts ${infile}.sql`,
      )
      if (stderr.trim() === 'no_bin') {
        console.log(
          `(echo "${stdout.trim()}" && pigz -dc ${infile}.txt.gz)   |sort -k1,1 -k2,2n|bgzip  > ${outfile}.bed.gz`,
        )
      } else {
        console.log(
          `(echo "${stdout.trim()}" && pigz -dc ${infile}.txt.gz | hck -Ld$'\\t' -f2- )   |sort -k1,1 -k2,2n|bgzip  > ${outfile}.bed.gz`,
        )
      }
    }
  } else {
    console.error('no sql file for ' + key)
  }
}
