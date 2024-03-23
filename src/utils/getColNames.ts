import pkg from 'node-sql-parser'
const { Parser } = pkg

export function getColNames(file: string) {
  const parser = new Parser()
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
