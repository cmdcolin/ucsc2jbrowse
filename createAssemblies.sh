#!/bin/bash
export LC_ALL=C

# Set default value for OUT if not already set
: ${OUT:=~/ucscResults}

for INDIR in $@; do
  ASM=$(basename $INDIR)
  OUTDIR=$OUT/$ASM
  DB=$INDIR/database
  echo $ASM
  mkdir -p $OUTDIR
  node src/createAssembly.ts $ASM >$OUTDIR/config.json
done
