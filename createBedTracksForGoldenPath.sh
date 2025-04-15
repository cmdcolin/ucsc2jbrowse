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

  echo "Creating BED tracks for $OUTDIR"

  # make bed.gz files from "regular bed" sql db tracks
  node src/parseBedTracks.ts $OUTDIR/tracks.json $DB $OUTDIR >$OUTDIR/bed.sh
  chmod +x $OUTDIR/bed.sh
  $OUTDIR/bed.sh && rm $OUTDIR/bed.sh
}

export -f process_assembly
export OUT

# Run the process_assembly function in parallel for each input directory
parallel --will-cite process_assembly ::: "$@"
