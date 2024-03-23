#!/bin/bash
export OUTDIR=~/ucscResults
export INDIR=~/Downloads/hg38
node dist/tracksDbLike.js $INDIR/trackDb.sql $INDIR/trackDb.txt.gz > $OUTDIR/tracks.json
node dist/geneLike.js $INDIR/augustusGene.sql $INDIR/augustusGene.txt.gz |bgzip > $OUTDIR/augustusGene.bed.gz
