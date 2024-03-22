import fs from 'fs'
import readline from 'readline'
import pkg from 'node-sql-parser'
const { Parser } = pkg

const parser = new Parser()
if (!process.argv[2]) {
  throw new Error('usage: node parser.js <sql file>')
}
const txt = fs.readFileSync(process.argv[2], 'utf8')

function getColNames(file: string) {
  const ast = parser.astify(file) // mysql sql grammer parsed by default

  // @ts-expect-error
  const ret = ast.find(f => f.type === 'create')
  const name = ret.table[0].table
  const cols = ret.create_definitions.filter(
    (r: any) => r.resource === 'column',
  ) as {
    column: { column: string }
  }[]
  return {
    tableName: name,
    colNames: cols.map(c => c.column.column),
  }
}

function parseTableTxt(line: string, cols: string[]) {
  return Object.fromEntries(line.split('\t').map((c, i) => [cols[i], c]))
}

const cols = getColNames(txt)

const rl = readline.createInterface({
  input: process.stdin,
})

for await (const line of rl) {
  console.log(parseTableTxt(line, cols.colNames))
}

export {}
