# ucsc2jbrowse

used for parsing sql and txt.gz database dumps from ucsc and making jbrowse 2
instances

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
rsync -cavzP rsync://hgdownload.cse.ucsc.edu/goldenPath/hg19/database/ hg19
rsync -cavzP rsync://hgdownload.cse.ucsc.edu/goldenPath/hg38/database/ hg38
rsync -cavzP rsync://hgdownload.cse.ucsc.edu/goldenPath/mm39/database/ mm39
./createConfigs.sh
```

Loading synteny tracks is a somewhat manual process

## Live instance

http://s3.amazonaws.com/jbrowse.org/code/jb2/main/index.html?config=%2Fjbrowse.org%2Fdemos%2Fucsc%2Fconfig.json
