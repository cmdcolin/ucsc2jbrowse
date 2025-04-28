#!/bin/bash
export LC_ALL=C
export NODE_OPTIONS="--no-warnings=ExperimentalWarning"

# Set default value for OUT if not already set
: ${OUT:=~/ucscResults}

# Function to process a single assembly
process_assembly() {
  local INDIR=$1
  local ASM=$(basename $INDIR)
  local OUTDIR=$OUT/$ASM
  local DB=$INDIR/$ASM/database

  # add metadata from the tracksDb.sql to the config.json
  node src/addMetadata.ts $OUTDIR/config.json $OUTDIR/tracks.json >$OUTDIR/tmp.json && mv $OUTDIR/tmp.json $OUTDIR/config.json
}

export -f process_assembly
export OUT

# Run the process_assembly function in parallel for each input directory
parallel --will-cite process_assembly ::: "$@"
