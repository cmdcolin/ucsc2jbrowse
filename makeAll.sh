#!/bin/bash
./downloadGoldenpath.sh ~/ucsc
./createAssemblies.sh ~/ucsc/*
./createTracksJsonForGoldenPath.sh ~/ucsc/*
./createBedTracksForGoldenPath.sh ~/ucsc/*
./createRmskTracksForGoldenPath.sh ~/ucsc/*
./createGeneTracksForGoldenPath.sh ~/ucsc/*
./createCoreTracksForHs1.sh ~/ucsc/*
./createConfigsForGoldenPath.sh ~/ucsc/*
./createTabixIndexes.sh ~/ucscResults/
./textIndexGoldenPath.sh ~/ucscResults/
node src/makeUcscExtensions.ts ~/ucscResults/
./getFileListing.sh ~/ucscResults/
