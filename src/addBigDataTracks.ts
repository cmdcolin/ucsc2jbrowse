import fs from 'fs'

const bigDataEntries = JSON.parse(
  fs.readFileSync(process.argv[2], 'utf8'),
) as Record<string, { tableName: string; settings: { bigDataUrl?: string } }>

const config = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) as {
  assemblies: { name: string }[]
  tracks?: { trackId: string; [key: string]: unknown }[]
}

const s = new Set(config.tracks?.map(t => t.trackId) || [])

Object.entries(bigDataEntries).map(([key, val]) => {
  const {
    settings: { bigDataUrl },
    tableName,
  } = val
  if (bigDataUrl && !bigDataUrl.includes('fantom')) {
    const uri = bigDataUrl.startsWith('https://hgdownload.soe.ucsc.edu')
      ? bigDataUrl
      : `https://hgdownload.soe.ucsc.edu${bigDataUrl}`

    const bb = bigDataUrl.endsWith('.bb') || bigDataUrl.endsWith('.bigBed')
    if (s.has(tableName)) {
      throw new Error(`${tableName} already exists`)
    }

    console.log(`adding ${tableName}`)
    config.tracks.push({
      trackId: tableName,
      name: tableName,
      type: bb ? 'FeatureTrack' : 'QuantitativeTrack',
      assemblyNames: [config.assemblies[0].name],
      adapter:
        bigDataUrl.endsWith('.bb') || bigDataUrl.endsWith('.bigBed')
          ? { type: 'BigBedAdapter', bigBedLocation: { uri } }
          : { type: 'BigWigAdapter', bigWigLocation: { uri } },
    })
  } else {
  }
})

fs.writeFileSync(process.argv[3], JSON.stringify(config, null, 2))
