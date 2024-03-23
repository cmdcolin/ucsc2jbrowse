import fs from 'fs'
import readline from 'readline'
import { getColNames } from './utils/getColNames.js'
import { parseTableLine } from './utils/parseTableLine.js'

if (!process.argv[2]) {
  throw new Error('usage: node parser.js <sql file>')
}
const txt = fs.readFileSync(process.argv[2], 'utf8')

const cols = getColNames(txt)
console.log({ cols })

const rl = readline.createInterface({
  input: process.stdin,
})

for await (const line of rl) {
  console.log(parseTableLine(line, cols.colNames))
}

export {}
