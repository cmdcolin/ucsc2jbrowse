#!/bin/bash
export INDIR=~/Downloads/hg38/
export OUTDIR=~/ucscResults/hg38
export TEMPLATE=hg38.json
export LC_ALL=C
./makeJBrowse.sh
./makeTracksDbJson.sh
./makeBeds.sh
./makeBigBedTracks.sh
./makeGeneTracks.sh
./loadBigBeds.sh
./makeTracks.sh
./addMetadata.sh
./removeEverythingButLatest.sh

