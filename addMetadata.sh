#!/bin/bash

node dist/addMetadata.js ~/ucscResults2/config.json ~/ucscResults2/tracks.json > config2.json
mv config2.json ~/ucscResults2
