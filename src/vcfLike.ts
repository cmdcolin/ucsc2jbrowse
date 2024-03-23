import fs from 'fs'
import zlib from 'zlib'
import readline from 'readline'
import { getColNames } from './utils/getColNames.js'
import { parseTableLine } from './utils/parseTableLine.js'

if (!process.argv[2]) {
  throw new Error('usage: node parser.js <sql file>')
}
const txt = fs.readFileSync(process.argv[2], 'utf8')

const cols = getColNames(txt)

const rl = readline.createInterface({
  input: fs.createReadStream(process.argv[3]).pipe(zlib.createGunzip()),
})

for await (const line of rl) {
  const {
    chrom,
    txStart,
    score,
    name,
    strand,
    txEnd,
    exonStarts,
    cdsStart,
    cdsEnd,
    exonEnds,
  } = parseTableLine(line, cols.colNames)
  const sizes = [] as number[]
  const s = exonStarts
    .split(',')
    .filter(f => !!f)
    .map(r => +r - +txStart)
  const e = exonEnds
    .split(',')
    .filter(f => !!f)
    .map(r => +r - +txStart)
  for (let i = 0; i < s.length; i++) {
    sizes.push(e[i] - s[i])
  }
  console.log(
    [
      chrom,
      txStart,
      txEnd,
      name,
      score,
      strand,
      cdsStart,
      cdsEnd,
      '0,0,0',
      s.length,
      sizes.join(','),
      s.join(','),
    ].join('\t'),
  )
}

export {}
