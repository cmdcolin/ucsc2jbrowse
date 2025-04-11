#!/bin/bash
export LC_ALL=C
export NODE_OPTIONS="--no-warnings=ExperimentalWarning"

# Set default value for OUT if not already set
: ${OUT:=~/ucscResults}
: ${IN:=~/ucscAlt}

# hs1 is just bigfiles
for i in hs1; do
  export INDIR=$IN/$i
  export OUTDIR=$OUT/$i
  mkdir -p $OUTDIR
  # cp $i.json $OUTDIR/config.json
  echo $OUTDIR
  node src/parseTrackHub.ts $INDIR/hubs/public/hub.txt $OUTDIR/config.json
done

# compute missing tracks
# for i in $@; do
#   export OUTDIR=$OUT/$i
#   mkdir -p $OUT/missing
#   node src/checkTracks.ts $OUTDIR/tracks.json $OUTDIR/config.json >$OUT/missing/$i.json
# done
