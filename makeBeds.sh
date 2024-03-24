#!/bin/bash
node dist/parseBedTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR > bed.sh
chmod +x bed.sh
./bed.sh
