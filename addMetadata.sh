#!/bin/bash

node dist/addMetadata.js $OUTDIR/config.json $OUTDIR/tracks.json > tmp.json
mv tmp.json $OUTDIR/config.json
