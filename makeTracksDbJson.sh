#!/bin/bash

node dist/tracksDbLike.js $INDIR/trackDb.sql $INDIR/trackDb.txt.gz > $OUTDIR/tracks.json
