#!/bin/bash
export LC_ALL=C

for i in hg19 hg38 mm39; do
	export INDIR=~/Downloads/$i
	export OUTDIR=~/ucscResults/$i
	export TEMPLATE=$i.json
	mkdir -p $OUTDIR
	./makeJBrowse.sh
	./makeTracksDbJson.sh
	./makeBeds.sh
	./makeBigBedTracks.sh
	./makeGeneTracks.sh
	./loadBigBeds.sh
	./makeTracks.sh
	./addMetadata.sh
	./removeEverythingButLatest.sh
done;
