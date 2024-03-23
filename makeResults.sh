#!/bin/bash
export OUTDIR=~/ucscResults
export INDIR=~/Downloads/hg38
node dist/tracksDbLike.js $INDIR/trackDb.sql $INDIR/trackDb.txt.gz > $OUTDIR/tracks.json
node dist/parseBigFileTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR > $OUTDIR/bigTracks.json
node dist/parseGeneTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR
node dist/parseBedTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR
