#!/bin/bash
export LC_ALL=C
export OUTDIR=~/ucscResults
export INDIR=~/Downloads/hg38
node dist/parseBedTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR > bed.sh
chmod +x bed.sh
./bed.sh
