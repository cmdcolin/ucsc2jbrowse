#!/bin/bash

node src/addMetadata.ts $OUTDIR/config.json $OUTDIR/tracks.json > tmp.json
mv tmp.json $OUTDIR/config.json
