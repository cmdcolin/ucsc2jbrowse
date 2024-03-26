#!/bin/bash
export LC_ALL=C

for i in hg19 mm39 hg38; do
	export INDIR=~/Downloads/$i
	export OUTDIR=~/ucscResults/$i
	export TEMPLATE=$i.json
	mkdir -p $OUTDIR



	## copy template to config.json
	cp $i.json $OUTDIR/config.json

	## make tracks.json file
	node dist/tracksDbLike.js $INDIR/trackDb.sql $INDIR/trackDb.txt.gz > $OUTDIR/tracks.json


	# find bigbed files in the tracks.json, these do not have sql db files
	node dist/parseBigFileTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR > $OUTDIR/bigTracks.json
	node dist/addBigDataTracks.js $OUTDIR/bigTracks.json $OUTDIR/config.json 

	# make bed.gz files from "genePred" type sql db tracks
	# node dist/parseGeneTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR

	# make bed.gz files from "regular bed" sql db tracks
	# node dist/parseBedTracks.js $OUTDIR/tracks.json $INDIR $OUTDIR > bed.sh
	# chmod +x bed.sh
	# ./bed.sh

	for i in $OUTDIR/*.bed.gz; do 
		echo $i;
		jbrowse add-track `basename $i` --load inPlace --trackId `basename $i .bed.gz` --out $OUTDIR --force; 
	done;

	# add metadata from the tracksDb.sql to the config.json
	node dist/addMetadata.js $OUTDIR/config.json $OUTDIR/tracks.json > tmp.json
	mv tmp.json $OUTDIR/config.json

	# optional
	# remove older copies of tracks, e.g. older dbSnp, older GENCODE, etc.
	# node dist/removeEverythingButLatest.js $OUTDIR/config.json > tmp.json
	# mv tmp.json $OUTDIR/config.json
done;

node dist/combineConfigs.js ~/ucscResults/hg19/config.json ~/ucscResults/hg38/config.json ~/ucscResults/mm39/config.json >! ~/ucscResults/config.json
