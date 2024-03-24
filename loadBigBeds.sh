#!/bin/bash
node dist/addBigDataTracks.js ~/ucscResults2/bigTracks.json ~/ucscResults2 |grep -v fantom  > bigbed.sh
chmod +x bigbed.sh
./bigbed.sh
