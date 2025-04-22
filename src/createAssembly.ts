const name = process.argv[2]

const f = (j: string) =>
  `https://hgdownload.soe.ucsc.edu/goldenPath/${name}/bigZips/${j}`

const g = () =>
  `https://hgdownload.soe.ucsc.edu/goldenPath/${name}/database/cytoBandIdeo.txt.gz`

let hasAliases = false
try {
  const res = await fetch(f(`${name}.chromAlias.txt`))
  if (!res.ok) {
    throw new Error('Error fetching chromAlias')
  }
  hasAliases = true
} catch (e) {}

let hasCyto = false
try {
  const res = await fetch(g())
  if (!res.ok) {
    throw new Error('Error fetching cytobands')
  }
  hasCyto = true
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
          ...(hasCyto
            ? {
                cytobands: {
                  adapter: {
                    type: 'CytobandAdapter',
                    uri: g(),
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
