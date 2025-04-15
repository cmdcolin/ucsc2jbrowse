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

  jbrowse text-index --out $OUTDIR --force
}

export -f process_assembly
export OUT

# Run the process_assembly function in parallel for each input directory
parallel -j4 --will-cite process_assembly ::: "$@"
