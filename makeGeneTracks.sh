#!/bin/bash
export LC_ALL=C
export OUTDIR=~/ucscResults
export INDIR=~/Downloads/hg38
node dist/parseGeneTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR
