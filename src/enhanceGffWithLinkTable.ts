import fs from 'fs'
import readline from 'readline'
import zlib from 'zlib'
import { getColNames } from './utils/getColNames.ts'

export function decodeURIComponentNoThrow(uri: string) {
  try {
    return decodeURIComponent(uri)
  } catch (e) {
    // avoid throwing exception on a failure to decode URI component
    return uri
  }
}

export async function enanceGffWithLinkTable(
  gffFile: string,
  linkFile: string,
  linkSqlFile: string,
) {
  const rl = readline.createInterface({
    input: fs.createReadStream(gffFile),
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
            ret.map((col, idx) => [linkCols.colNames[idx]!, col] as const),
          ),
        ] as const
      }),
  )

  for await (const line of rl) {
    if (line.startsWith('#')) {
      process.stdout.write(line + '\n')
    } else {
      const [chr, source, type, start, end, score, strand, phase, col9] =
        line.split('\t')

      const col9attrs = Object.fromEntries(
        col9!
          .split(';')
          .map(f => f.trim())
          .filter(f => !!f)
          .map(f => f.split('='))
          .map(([key, val]) => [key!.trim(), val] as const),
      )
      const ID = col9attrs.ID || ''
      const newCol9 = `${col9};${Object.entries(data[ID] || {})
        .filter(([_key, val]) => !!val)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join(';')}`

      process.stdout.write(
        [chr, source, type, start, end, score, strand, phase, newCol9].join(
          '\t',
        ) + '\n',
      )
    }
  }
}

enanceGffWithLinkTable(process.argv[2], process.argv[3], process.argv[4])
