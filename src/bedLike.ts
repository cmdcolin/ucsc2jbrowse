import fs from 'fs'
import { getColNames } from './utils/getColNames.js'

export async function genBed(sql: string) {
  const txt = fs.readFileSync(sql, 'utf8')
  const cols = getColNames(txt)

  if (cols.colNames.join(',').startsWith('bin,chrom,chromStart,chromEnd')) {
    console.log('#' + cols.colNames.slice(1).join('\t'))
  } else if (cols.colNames.join(',').startsWith('chrom,chromStart,chromEnd')) {
    console.error('no_bin')
    console.log('#' + cols.colNames.join('\t'))
  } else {
    throw new Error('unexpected db structure: ' + cols.colNames)
  }
}

genBed(process.argv[2])
