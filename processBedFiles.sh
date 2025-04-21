#!/bin/bash
set -e

# This script processes bed.gz files and adds them to a JBrowse config
# Usage: processBedFiles.sh <config_dir>

if [ $# -lt 1 ]; then
  echo "Usage: $0 <config_dir>"
  echo "  config_dir: Directory containing config.json and bed.gz files"
  exit 1
fi

OUTDIR="$1"
CONFIG="$OUTDIR/config.json"

# Check if config file exists
if [ ! -f "$CONFIG" ]; then
  echo "Error: Config file $CONFIG not found"
  exit 1
fi

# Process all bed.gz files in the directory
for i in "$OUTDIR"/*.bed.gz; do
  if [ -f "$i" ]; then
    echo "Processing $i"
    node src/addBedTabixTrackToConfig.ts "$CONFIG" "$i"
  fi
done

echo "Bed file processing complete"
