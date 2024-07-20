# ucsc2jbrowse

used for parsing sql and txt.gz database dumps from ucsc and making jbrowse 2
instances

## Pre-requisites

- hck
- node.js
- yarn

## Usage

Usage is a little particular for my computer but approximately should be like
this

```
git clone git@github.com:cmdcolin/ucsc2jbrowse
cd ucsc2jbrowse
yarn
mkdir ~/ucscResults/
mkdir ~/ucscResults/hg19
mkdir ~/ucscResults/hg38
mkdir ~/ucscResults/mm39
rsync -cavzP rsync://hgdownload.cse.ucsc.edu/goldenPath/hg19/ ucsc/hg19
rsync -cavzP rsync://hgdownload.cse.ucsc.edu/goldenPath/hg38/ ucsc/hg38
rsync -cavzP rsync://hgdownload.cse.ucsc.edu/goldenPath/mm39/ ucsc/mm39
OUT=~/ucscResults ./createConfigs.sh ucsc/*
```

Loading synteny tracks is a somewhat manual process

## Live instance

http://s3.amazonaws.com/jbrowse.org/code/jb2/main/index.html?config=%2Fjbrowse.org%2Fdemos%2Fucsc%2Fconfig.json
