import path from 'path'

const args = process.argv.slice(2)
const base = args.map(a => path.basename(a))
const r = path.dirname(args[0])
const ret = []

console.log(
  '#!/bin/bash\n' +
    'function pif() {\n' +
    '	pigz -dc $1 > `basename $1 .gz`\n' +
    '	chain2paf --input `basename $1 .gz` > `basename $1 .chain.gz`.paf\n' +
    '	jbrowse make-pif --csi `basename $1 .chain.gz`.paf  # generates pif.gz and pif.gz.csi\n' +
    '}\n',
)
const ret2 = []
for (const a1 of base) {
  for (const a2 of base) {
    if (a1 !== a2) {
      const [f, ...rest] = a2
      const file = `${r}/${a1}/liftOver/${a1}To${f.toUpperCase()}${rest.join('')}.over.chain.gz`
      ret.push(`pif ${file}`)
      ret2.push(
        `jbrowse add-track ${path.basename(file, '.chain.gz')}.pif.gz -a ${a2},${a1} --out ${process.env.OUT} --load inPlace --force --category Synteny`,
      )
    }
  }
}
console.log([...ret, '', ...ret2].join('\n'))
