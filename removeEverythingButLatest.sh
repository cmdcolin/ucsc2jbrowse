#!/bin/bash
#
node dist/removeEverythingButLatest.js $OUTDIR/config.json > tmp.json
mv tmp.json $OUTDIR/config.json
