import fs from 'fs'
const r = fs.readFileSync(process.argv[2]!, 'utf8')
fs.writeFileSync(
  process.argv[2]!,
  r
    .split('\n')
    .map(r => {
      const [r0, r1] = r.split('\t')
      // xenoRefGene has missing gene names
      if (!r0) {
        return `${r1}-gene\t${r1}`
      }

      // genscan has missing gene names too...but different
      else if (!r1) {
        return `${r0}-gene\t${r0}`
      }

      // normal
      else {
        return r
      }
    })
    .join('\n'),
)
