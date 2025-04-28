import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'
const pexec = promisify(exec)

const args = process.argv.slice(2)
const base = args.map(a => path.basename(a))

for (const a1 of base) {
  for (const a2 of base) {
    const [f, ...rest] = a2
    const file = `${a1}/liftOver/${a1}To${f.toUpperCase()}${rest.join('')}.chain.gz`
    const res = await pexec(
      `jbrowse add-track ${file} -a ${a1},${a2} --out ${process.env.OUT} --load copy --force`,
    )
    if (res.stderr) {
      console.error(res.stderr)
    }
  }
}
