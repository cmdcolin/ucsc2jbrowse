import fs from 'fs'
import readline from 'readline'
import zlib from 'zlib'
import { getColNames } from './utils/getColNames.ts'
import { parseTableLine } from './utils/parseTableLine.ts'

export async function genBed12(
  sql: string,
  txtGz: string,
  linkFile: string,
  linkSqlFile: string,
) {
  const cols = getColNames(fs.readFileSync(sql, 'utf8'))
  const rl = readline.createInterface({
    input: fs.createReadStream(txtGz).pipe(zlib.createGunzip()),
  })

  const linkCols = getColNames(fs.readFileSync(linkSqlFile, 'utf8'))
  const data = Object.fromEntries(
    zlib
      .gunzipSync(fs.readFileSync(linkFile))
      .toString('utf8')
      .split('\n')
      .map(r => {
        const ret = r.split('\t')
        return [
          ret[0],
          Object.fromEntries(
            ret.map((col, idx) => [linkCols.colNames[idx]!, col]),
          ),
        ]
      }),
  )
  for await (const line of rl) {
    const {
      chrom,
      txStart,
      score,
      name,
      name2,
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
        name2,
      ].join('\t') + '\n',
    )
  }
}

genBed12(process.argv[2], process.argv[3], process.argv[4], process.argv[5])
