import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const e = promisify(exec)

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
  val.type.startsWith('bed'),
)) {
  const l = path.join(process.argv[3], key)
  const j = path.join(process.argv[4], key)
  try {
    console.log('processing', key)
    const { stdout, stderr } = await e(
      `node dist/bedLike.js ${l}.sql ${l}.txt.gz | sort -k1,1 -k2,2n | bgzip > ${j}.bed.gz; tabix ${j}.bed.gz; touch ${j}.complete`,
    )
    if (stderr) {
      console.error(stderr)
    }
    if (stdout) {
      console.log(stdout)
    }
  } catch (e) {
    console.error(e)
  }
}
