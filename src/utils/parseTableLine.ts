export function parseTableLine(line: string, cols: string[]) {
  return Object.fromEntries(
    line
      .replaceAll('\\\t', ' ')
      .split('\t')
      .map((c, i) => [cols[i], c]),
  )
}
