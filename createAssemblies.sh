#!/bin/bash
export LC_ALL=C

for INDIR in $@; do
  ASM=`basename $INDIR`
	OUTDIR=$OUT/$ASM
  DB=$INDIR/database



	## copy template to config.json
	yarn --silent tsx src/createAssembly.ts $ASM > $OUTDIR/config.json
  cp $INDIR/bigZips/$ASM.2bit $OUTDIR/
  cp $INDIR/bigZips/$ASM.chrom.sizes $OUTDIR/
done;




