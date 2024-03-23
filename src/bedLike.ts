import fs from 'fs'
import readline from 'readline'
import zlib from 'zlib'
import { getColNames } from './utils/getColNames.js'
import { parseTableLine } from './utils/parseTableLine.js'

export async function genBed12(sql: string, txtGz: string) {
  const txt = fs.readFileSync(sql, 'utf8')
  const cols = getColNames(txt)
  const rl = readline.createInterface({
    input: fs.createReadStream(txtGz).pipe(zlib.createGunzip()),
  })
  if (!cols.colNames.join(',').startsWith('bin,chrom,chromStart,chromEnd')) {
    throw new Error('unexpected db structure')
  }

  // slice off bin
  process.stdout.write('#' + cols.colNames.slice(1).join('\t'))
  for await (const line of rl) {
    process.stdout.write(line.slice(line.indexOf('\t') + 1))
  }
}

genBed12(process.argv[2], process.argv[3])
