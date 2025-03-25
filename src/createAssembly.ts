const name = process.argv[2]
const f = (j: string) =>
  `https://hgdownload.soe.ucsc.edu/goldenPath/${name}/bigZips/${j}`

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
          refNameAliases: {
            adapter: {
              type: 'RefNameAliasAdapter',
              uri: f(`${name}.chromAlias.txt`),
            },
          },
        },
      ],
      tracks: [],
    },
    null,
    2,
  ),
)
