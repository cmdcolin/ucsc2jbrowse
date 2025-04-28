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
  local DB=$INDIR/database
  echo "Creating assembly" $ASM
  mkdir -p $OUTDIR
  node src/createAssembly.ts $ASM >$OUTDIR/config.json
}

export -f process_assembly
export OUT

# Use GNU parallel to process assemblies in parallel
parallel process_assembly ::: "$@"
