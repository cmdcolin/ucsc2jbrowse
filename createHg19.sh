#!/bin/bash
export INDIR=~/Downloads/hg19/
export OUTDIR=~/ucscResults/hg19/
export TEMPLATE=hg19.json
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

