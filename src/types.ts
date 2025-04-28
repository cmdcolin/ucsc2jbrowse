export interface TrackDbEntry {
  settings: string
  html: string
  longLabel: string
  grp: string
  shortLabel: string
}

export interface JBrowseConfig {
  tracks: { trackId: string; adapter: { bedGzLocation?: { uri: string } } }[]
  assemblies: { name: string }[]
  plugins: unknown[]
  aggregateTextSearchAdapters: Record<string, unknown>[]
}
