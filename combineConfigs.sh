#!/bin/bash
yarn --silent tsx src/combineConfigs.ts \
  $OUT/hg19/config.json \
  $OUT/hg38/config.json \
  $OUT/mm39/config.json \
  $OUT/mm10/config.json \
  $OUT/panTro6/config.json \
  $OUT/rheMac10/config.json \
  > $OUT/config.json
npx prettier --write $OUT/config.json
