const name = process.argv[2]
const f = (j: string) =>
  `https://hgdownload.soe.ucsc.edu/goldenPath/${name}/bigZips/${j}`

let hasAliases = false
try {
  const res = await fetch(f(`${name}.chromAlias.txt`))
  if (!res.ok) {
    throw new Error('wow')
  }
  hasAliases = true
} catch (e) {}
console.log(
  JSON.stringify(
    {
      assemblies: [
        {
          name,
          sequence: {
            type: 'ReferenceSequenceTrack',
            trackId: `${name}-refseq`,
            adapter: {
              type: 'TwoBitAdapter',
              uri: f(`${name}.2bit`),
              chromSizes: f(`${name}.chrom.sizes`),
            },
          },
          ...(hasAliases
            ? {
                refNameAliases: {
                  adapter: {
                    type: 'RefNameAliasAdapter',
                    uri: f(`${name}.chromAlias.txt`),
                  },
                },
              }
            : {}),
        },
      ],
      tracks: [],
    },
    null,
    2,
  ),
)
