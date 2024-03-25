import fs from 'fs'

const bigDataEntries = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))

Object.entries(bigDataEntries).map(([key, val]) => {
  const {
    settings: { bigDataUrl },
    tableName,
  } = val as any
  if (bigDataUrl) {
    console.log(
      `jbrowse add-track --out ${process.argv[3]} -a ${process.argv[4]} --trackId ${tableName}  ${
        bigDataUrl.startsWith('https://hgdownload.soe.ucsc.edu')
          ? bigDataUrl
          : `https://hgdownload.soe.ucsc.edu${bigDataUrl}`
      }`,
    )
  }
})
