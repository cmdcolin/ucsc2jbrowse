import fs from 'node:fs'

export function readJSON(f: string) {
  return JSON.parse(fs.readFileSync(f, 'utf8')) as unknown
}

export function writeJSON(f: string, d: unknown) {
  fs.writeFileSync(f, JSON.stringify(d, undefined, 2))
}
