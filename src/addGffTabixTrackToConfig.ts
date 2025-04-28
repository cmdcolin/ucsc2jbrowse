import fs from 'fs'
import path from 'path'
import { readConfig } from './util.ts'

if (process.argv.length < 3) {
  throw new Error(
    `usage: ${process.argv[0]} ${process.argv[1]} <config.json> <file.gff.gz>`,
  )
}

const config = readConfig(process.argv[2])
const arg = path.basename(process.argv[3])
const base = path.basename(arg, '.sorted.gff.gz')

// Create the new track configuration
const newTrack = {
  type: 'FeatureTrack',
  trackId: base,
  name: base,
  assemblyNames: [config.assemblies[0].name],
  adapter: {
    type: 'Gff3TabixAdapter',
    gffGzLocation: { uri: arg },
    index: {
      indexType: 'CSI',
      location: { uri: arg + '.csi' },
    },
  },
}

// Check if track already exists
const existingTrackIndex = config.tracks.findIndex(f => f.trackId === base)

// Create updated tracks array - either replace existing or add new
let updatedTracks
if (existingTrackIndex >= 0) {
  // Replace existing track
  console.log(`Replacing existing track with ID "${base}"`)
  updatedTracks = [...config.tracks]
  updatedTracks[existingTrackIndex] = newTrack
} else {
  // Add new track
  console.log(`Adding new track with ID "${base}"`)
  updatedTracks = [...config.tracks, newTrack]
}

// Write updated config
fs.writeFileSync(
  process.argv[2],
  JSON.stringify(
    {
      ...config,
      tracks: updatedTracks,
    },
    null,
    2,
  ),
)
