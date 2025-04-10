#!/bin/bash
./createCoreTracksForGoldenPath.sh
./createRmskTracksForGoldenPath.sh
./createGeneTracksForGoldenPath.sh
./createCoreTracksForHs1.sh
./createTabixIndexes.sh
