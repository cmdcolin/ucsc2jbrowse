#!/bin/bash
export LC_ALL=C
export OUTDIR=~/ucscResults
export INDIR=~/Downloads/hg38
node dist/parseBigFileTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR > $OUTDIR/bigTracks.json
