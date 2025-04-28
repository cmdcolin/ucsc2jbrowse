export interface TrackDbEntry {
  settings: string
  html: string
  longLabel: string
  grp: string
  shortLabel: string
  type: string
}

export interface JBrowseConfig {
  tracks: { trackId: string; adapter: Record<string, unknown> }[]
  assemblies: { name: string }[]
  plugins: unknown[]
  aggregateTextSearchAdapters?: Record<string, unknown>[]
}
