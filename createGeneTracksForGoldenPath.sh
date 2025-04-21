#!/bin/bash
export LC_ALL=C
export NODE_OPTIONS="--no-warnings=ExperimentalWarning"

# Set default value for OUT if not already set
: ${OUT:=~/ucscResults}

# Function to process gene tracks
process_gene_tracks() {
  TRACKS_JSON="$1"
  DBDIR="$2"
  OUTDIR="$3"
  # Use jq to extract gene prediction tracks
  jq -r 'to_entries | .[] | select(.value.type | startswith("genePred")) | .key' "$TRACKS_JSON" | while read -r key; do
    # Skip wgEncode tracks
    if [[ "$key" == wgEncode* ]]; then
      continue
    fi

    infile="$DBDIR/$key"
    outfile="$OUTDIR/$key"

    if [ -f "${infile}.sql" ]; then
      mkdir -p "$(dirname "$outfile")"
      node src/geneLike.ts "${infile}.sql" "${infile}.txt.gz" | sort -k1,1 -k2,2n >"${outfile}.bed"
      hck -f 13,4 "${outfile}.bed" >${outfile}.isoforms.txt
      node src/fixupIsoforms.ts ${outfile}.isoforms.txt
      ~/bed2gff -t2 --bed ${outfile}.bed --output ${outfile}.gff --isoforms ${outfile}.isoforms.txt
      if [ -f "${infile}Link.sql" ]; then
        echo node src/enhanceGffWithLinkTable.ts ${outfile}.gff "${infile}Link.txt.gz" "${infile}Link.sql" >${outfile}.enhanced.gff
        node src/enhanceGffWithLinkTable.ts ${outfile}.gff "${infile}Link.txt.gz" "${infile}Link.sql" >${outfile}.enhanced.gff
        jbrowse sort-gff ${outfile}.enhanced.gff | bgzip >${outfile}.sorted.gff.gz
      else
        jbrowse sort-gff ${outfile}.gff | bgzip >${outfile}.sorted.gff.gz
      fi
      rm -f "${outfile}.bed" &&
        rm -f "${outfile}.isoforms.txt" &&
        rm -f "${outfile}.enhanced.gff" &&
        rm -f "${outfile}.gff"
    fi
  done
}

# Function to process a single gene
process_gene() {
  local INDIR=$1
  local ASM=$(basename $INDIR)
  local OUTDIR=$OUT/$ASM
  local DB=$INDIR/$ASM/database

  mkdir -p $OUTDIR
  process_gene_tracks $OUTDIR/tracks.json $DB $OUTDIR
}

export -f process_gene
export -f process_gene_tracks
export OUT

parallel -j 12 --bar --will-cite process_gene ::: "$@"
