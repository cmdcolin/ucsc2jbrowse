#!/bin/bash
export LC_ALL=C
export NODE_OPTIONS="--no-warnings=ExperimentalWarning"

# Set default value for OUT if not already set
: ${OUT:=~/ucscResults}

# Function to process a single gene
process_gene() {
  local INDIR=$1
  local ASM=$(basename $INDIR)
  local OUTDIR=$OUT/$ASM
  local DB=$INDIR/$ASM/database

  echo "Processing $OUTDIR"
  mkdir -p $OUTDIR

  # make repeatmasker tracks
  node src/parseGeneTracks.ts $OUTDIR/tracks.json $DB $OUTDIR
}

export -f process_gene
export OUT

# Run the process_gene function in parallel for each input directory
parallel --will-cite process_gene ::: "$@"
