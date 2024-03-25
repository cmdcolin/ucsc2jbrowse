#!/bin/bash
node dist/addBigDataTracks.js $OUTDIR/bigTracks.json $OUTDIR |grep -v fantom  > bigbed.sh
chmod +x bigbed.sh
./bigbed.sh
