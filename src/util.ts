import fs from 'node:fs'

import type { JBrowseConfig } from './types.ts'

export function readJSON(f: string) {
  return JSON.parse(fs.readFileSync(f, 'utf8')) as unknown
}

export function writeJSON(f: string, d: unknown) {
  fs.writeFileSync(f, JSON.stringify(d, undefined, 2))
}

export function splitOnFirst(str: string, sep: string) {
  const index = str.indexOf(sep)
  return index < 0
    ? ([str, ''] as const)
    : ([str.slice(0, index), str.slice(index + sep.length)] as const)
}

export function replaceLink(s: string) {
  return s
    .replaceAll('\\', ' ')
    .replaceAll('../../', 'https://genome.ucsc.edu/')
    .replaceAll('../', 'https://genome.ucsc.edu/')
    .replaceAll('"/cgi-bin', '"https://genome.ucsc.edu/cgi-bin')
}

export function readConfig(s: string) {
  return readJSON(s) as JBrowseConfig
}
