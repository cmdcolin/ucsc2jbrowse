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

let ret = {} as Record<string, unknown>
let l = ''
for await (const line of rl) {
  if (line.endsWith('\\')) {
    l += line
  } else if (l) {
    const r = parseTableLine(l, cols.colNames)
    ret[r.tableName] = r
    l = ''
  }
}
console.log(JSON.stringify(ret, null, 2))

export {}
