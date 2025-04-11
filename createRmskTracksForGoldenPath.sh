#!/bin/bash
export LC_ALL=C
export NODE_OPTIONS="--no-warnings=ExperimentalWarning"

# Set default value for OUT if not already set
: ${OUT:=~/ucscResults}

# Function to process a single rmsk
process_rmsk() {
  local INDIR=$1
  local ASM=$(basename $INDIR)
  local OUTDIR=$OUT/$ASM
  local DB=$INDIR/$ASM/database

  mkdir -p $OUTDIR

  # make repeatmasker tracks
  echo node src/parseRmskTracks.ts $OUTDIR/tracks.json $DB $OUTDIR
  node src/parseRmskTracks.ts $OUTDIR/tracks.json $DB $OUTDIR
}

export -f process_rmsk
export OUT

# Run the process_rmsk function in parallel for each input directory
parallel --will-cite process_rmsk ::: "$@"
