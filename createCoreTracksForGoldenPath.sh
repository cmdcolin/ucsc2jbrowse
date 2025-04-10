#!/bin/bash
set -v
export LC_ALL=C
export NODE_OPTIONS="--no-warnings=ExperimentalWarning"

# Set default value for OUT if not already set
: ${OUT:=~/ucscResults}

# Function to process a single assembly
process_assembly() {
  local INDIR=$1
  local ASM=$(basename $INDIR)
  local OUTDIR=$OUT/$ASM
  local DB=$INDIR/$ASM/database

  echo "Processing $OUTDIR"
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
  # 	cat $OUTDIR/rmsk.header $i |bgzip > $i.gz;
  # 	rm $i;
  # done;

  # make bed.gz files from "regular bed" sql db tracks
  node src/parseBedTracks.ts $OUTDIR/tracks.json $DB $OUTDIR >$OUTDIR/bed.sh
  chmod +x $OUTDIR/bed.sh
  $OUTDIR/bed.sh

  for i in $OUTDIR/*.bed.gz; do
    echo $i
    node src/addBedTabixTrackToConfig.ts $OUTDIR/config.json $i
  done

  # add metadata from the tracksDb.sql to the config.json
  node src/addMetadata.ts $OUTDIR/config.json $OUTDIR/tracks.json >$OUTDIR/tmp.json
  mv $OUTDIR/tmp.json $OUTDIR/config.json

  # optional
  # remove older copies of tracks, e.g. older dbSnp, older GENCODE, etc.
  node src/removeEverythingButLatest.ts $OUTDIR/config.json >$OUTDIR/tmp.json
  mv $OUTDIR/tmp.json $OUTDIR/config.json

  # Index all bed.gz files
  find $OUTDIR -name "*.bed.gz" | parallel "echo {}; tabix -C -f {}"
}

export -f process_assembly
export OUT

# Run the process_assembly function in parallel for each input directory
parallel --will-cite process_assembly ::: "$@"
