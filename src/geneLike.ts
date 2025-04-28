import fs from 'fs'
import zlib from 'zlib'

import { getColNames } from './utils/getColNames.ts'
import { parseTableLine } from './utils/parseTableLine.ts'

export function parseLineByLine(
  buffer: Uint8Array,
  cb: (line: string) => void,
) {
  let blockStart = 0
  const decoder = new TextDecoder('utf8')

  while (blockStart < buffer.length) {
    const n = buffer.indexOf(10, blockStart)
    const b = n === -1 ? buffer.slice(blockStart) : buffer.slice(blockStart, n)
    blockStart = n + 1

    const line = decoder.decode(b).trim()

    // a literal \n in the gene name like Dmel\nt2 was
    // converted to a newline probably, join with next
    // line. be mindful also of the carriage return case.
    // this is a particular oddity with ucsc database dumps
    if (line.endsWith('\\')) {
      const n = buffer.indexOf(10, blockStart)
      const b =
        n === -1 ? buffer.slice(blockStart) : buffer.slice(blockStart, n)

      const line2 = decoder.decode(b).trim()
      blockStart = n + 1
      cb((line + 'n' + line2).replace(/\r/g, '\\r'))
    } else if (line) {
      cb(line.replace(/\r/g, '\\r'))
    }
  }
}

export function genBed12(sql: string, txtGz: string) {
  const cols = getColNames(fs.readFileSync(sql, 'utf8'))
  const ret = zlib.gunzipSync(fs.readFileSync(txtGz))

  parseLineByLine(ret, line => {
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
    let s: any
    try {
      s = exonStarts!
        .split(',')
        .filter(f => !!f)
        .map(r => +r - +txStart!)
    } catch (e) {
      console.error({ line, exonStarts, p: process.argv })
      throw e
    }
    const e = exonEnds!
      .split(',')
      .filter(f => !!f)
      .map(r => +r - +txStart!)
    for (let i = 0; i < s.length; i++) {
      sizes.push(e[i]! - s[i]!)
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
  })
}

genBed12(process.argv[2]!, process.argv[3]!)
