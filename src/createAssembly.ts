const name = process.argv[2]
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
              twoBitLocation: {
                uri: `${name}.2bit`,
              },
              chromSizesLocation: {
                uri: `${name}.chrom.sizes`,
              },
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
