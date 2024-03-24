import fs from 'fs'
import { getColNames } from './utils/getColNames.js'

export async function genBed(sql: string) {
  const txt = fs.readFileSync(sql, 'utf8')
  const cols = getColNames(txt)

  if (!cols.colNames.join(',').startsWith('bin,chrom,chromStart,chromEnd')) {
    throw new Error('unexpected db structure')
  }

  // slice off bin
  console.log('#' + cols.colNames.slice(1).join('\t'))
}

genBed(process.argv[2])
