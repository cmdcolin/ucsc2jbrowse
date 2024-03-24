#!/bin/bash
export LC_ALL=C
export OUTDIR=~/ucscResults
export INDIR=~/Downloads/hg38
node dist/tracksDbLike.js $INDIR/trackDb.sql $INDIR/trackDb.txt.gz > $OUTDIR/tracks.json
