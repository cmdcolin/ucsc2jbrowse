#!/bin/bash
export LC_ALL=C

for INDIR in $@; do
  export ASM=$(basename $INDIR)
  export OUTDIR=$OUT/$ASM
  export DB=$INDIR/$ASM/database

  echo $OUTDIR
  mkdir -p $OUTDIR
  node src/createAssembly.ts $ASM >$OUTDIR/config.json

  ## make tracks.json file
  node src/tracksDbLike.ts $DB/trackDb.sql $DB/trackDb.txt.gz >$OUTDIR/tracks.json

  # find bigbed files in the tracks.json, these do not have sql db files
  node src/parseBigFileTracks.ts $OUTDIR/tracks.json $DB $OUTDIR >$OUTDIR/bigTracks.json
  node src/addBigDataTracks.ts $OUTDIR/bigTracks.json $OUTDIR/config.json

  # make bed.gz files from "genePred" type sql db tracks
  node src/parseGeneTracks.ts $OUTDIR/tracks.json $DB $OUTDIR
  # make repeatmasker tracks
  node src/parseRmskTracks.ts $OUTDIR/tracks.json $DB $OUTDIR

  ## future todo: split up rmsk track
  # zcat rmsk.bed.gz|awk -F$'\t' '{print > ("rmsk_" $6 ".bed")}'
  # zcat rmsk.bed.gz|head -n1 > $OUTDIR/rmsk.header
  # for i in $OUTDIR/rmsk_*; do
  # 	cat $OUTDIR/rmsk.header $i |bgzip -@8 > $i.gz;
  # 	rm $i;
  # done;

  # make bed.gz files from "regular bed" sql db tracks
  node src/parseBedTracks.ts $OUTDIR/tracks.json $DB $OUTDIR >bed.sh
  chmod +x bed.sh
  ./bed.sh

  for i in $OUTDIR/*.bed.gz; do
    echo $i
    node src/addBedTabixTrackToConfig.ts $OUTDIR/config.json $i
  done

  # add metadata from the tracksDb.sql to the config.json
  node src/addMetadata.ts $OUTDIR/config.json $OUTDIR/tracks.json >tmp.json
  mv tmp.json $OUTDIR/config.json

  # optional
  # remove older copies of tracks, e.g. older dbSnp, older GENCODE, etc.
  node src/removeEverythingButLatest.ts $OUTDIR/config.json >tmp.json
  mv tmp.json $OUTDIR/config.json

  parallel tabix -f {} ::: $OUTDIR/*.bed.gz
done

## hs1 is just bigfiles
# for i in hs1; do
# 	export INDIR=$INOUT/$i
# 	export OUTDIR=$OUT/$i
# 	mkdir -p $OUTDIR
# 	cp $i.json $OUTDIR/config.json
# 	node src/parseTrackHub.ts $INDIR/trackDb.txt $OUTDIR/config.json;
# done;

# compute missing tracks
# for i in $@; do
# 	export OUTDIR=$OUT/$i
# 	mkdir -p $OUT/missing
# 	node src/checkTracks.ts $OUTDIR/tracks.json $OUTDIR/config.json > $OUT/missing/$i.json
# done;
#
#
