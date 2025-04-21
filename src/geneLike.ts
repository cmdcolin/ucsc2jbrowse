import fs from 'fs'
import zlib from 'zlib'
import { getColNames } from './utils/getColNames.ts'
import { parseTableLine } from './utils/parseTableLine.ts'

export function parseLineByLine<T>(
  buffer: Uint8Array,
  cb: (line: string) => T | undefined,
): T[] {
  let blockStart = 0
  const entries: T[] = []
  const decoder = new TextDecoder('utf8')

  while (blockStart < buffer.length) {
    const n = buffer.indexOf(10, blockStart)
    if (n === -1) {
      break
    }
    const b = buffer.slice(blockStart, n)
    const line = decoder.decode(b).trim().replace(/\r/g, '\\r')
    if (line) {
      const entry = cb(line)
      if (entry) {
        entries.push(entry)
      }
    }

    blockStart = n + 1
  }
  return entries
}

export async function genBed12(sql: string, txtGz: string) {
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
  })
}

try {
  await genBed12(process.argv[2], process.argv[3])
} catch (e) {
  console.error(e, process.argv)
}
