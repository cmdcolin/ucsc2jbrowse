#!/bin/bash
set -v
export LC_ALL=C
export BASE=~/ucscResults/

for i in hg19 hg38 mm39; do
	export INDIR=~/Downloads/$i
	export OUTDIR=$BASE/$i
	mkdir -p $OUTDIR


	## copy template to config.json
	cp $i.json $OUTDIR/config.json

	## make tracks.json file
	node dist/tracksDbLike.js $INDIR/trackDb.sql $INDIR/trackDb.txt.gz > $OUTDIR/tracks.json


	# find bigbed files in the tracks.json, these do not have sql db files
	node dist/parseBigFileTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR > $OUTDIR/bigTracks.json
	node dist/addBigDataTracks.js $OUTDIR/bigTracks.json $OUTDIR/config.json 

	# make bed.gz files from "genePred" type sql db tracks
	node dist/parseGeneTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR
	# make repeatmasker tracks
	node dist/parseRmskTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR

	## future todo: split up rmsk track
	# zcat rmsk.bed.gz|awk -F$'\t' '{print > ("rmsk_" $6 ".bed")}'
	# zcat rmsk.bed.gz|head -n1 > $OUTDIR/rmsk.header
	# for i in $OUTDIR/rmsk_*; do
	# 	cat $OUTDIR/rmsk.header $i |bgzip -@8 > $i.gz;
	# 	rm $i;
	# done;

	# make bed.gz files from "regular bed" sql db tracks
	node dist/parseBedTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR > bed.sh
	chmod +x bed.sh
	./bed.sh

	for i in $OUTDIR/*.bed.gz; do 
		echo $i;
		node dist/addBedTabixTrackToConfig.js $OUTDIR/config.json $i
	done;

	# add metadata from the tracksDb.sql to the config.json
	node dist/addMetadata.js $OUTDIR/config.json $OUTDIR/tracks.json > tmp.json
	mv tmp.json $OUTDIR/config.json

	# optional
	# remove older copies of tracks, e.g. older dbSnp, older GENCODE, etc.
	node dist/removeEverythingButLatest.js $OUTDIR/config.json > tmp.json
	mv tmp.json $OUTDIR/config.json

	parallel tabix -f {} ::: $OUTDIR/*.bed.gz
done;

## hs1 is just bigfiles
export BASE=~/ucscResults/
for i in hs1; do
	export INDIR=~/Downloads/$i
	export OUTDIR=$BASE/$i
	mkdir -p $OUTDIR
	cp $i.json $OUTDIR/config.json
	node dist/parseTrackHub.js $INDIR/trackDb.txt $OUTDIR/config.json;
done;

# compute missing tracks
for i in hg19 hg38 mm39; do
	export OUTDIR=$BASE/$i
	mkdir -p $BASE/missing
	node dist/checkTracks.js $OUTDIR/tracks.json $OUTDIR/config.json > $BASE/missing/$i.json
done;

./syntenyTracks.sh

node dist/combineConfigs.js $BASE/hg19/config.json $BASE/hg38/config.json $BASE/mm39/config.json $BASE/hs1/config.json > $BASE/config.json
npx prettier --write $BASE/config.json

