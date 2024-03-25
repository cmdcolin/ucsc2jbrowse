#!/bin/bash

node dist/addMetadata.js ~/ucscResults2/config.json ~/ucscResults2/tracks.json > tmp.json
mv tmp.json $OUTDIR/config.json
