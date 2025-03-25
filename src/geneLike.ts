import fs from 'fs'
import readline from 'readline'
import zlib from 'zlib'
import { getColNames } from './utils/getColNames.ts'
import { parseTableLine } from './utils/parseTableLine.ts'

export async function genBed12(sql: string, txtGz: string) {
  const txt = fs.readFileSync(sql, 'utf8')
  const cols = getColNames(txt)
  const rl = readline.createInterface({
    input: fs.createReadStream(txtGz).pipe(zlib.createGunzip()),
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
    const sizes = []
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
    process.stdout.write(
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
      ].join('\t') + '\n',
    )
  }
}

genBed12(process.argv[2], process.argv[3])
