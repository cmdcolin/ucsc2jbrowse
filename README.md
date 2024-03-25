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
yarn build
mkdir ~/ucscResults/
mkdir ~/ucscResults/hg19
mkdir ~/ucscResults/hg38
rsync -cavzP rsync://hgdownload.cse.ucsc.edu/goldenPath/hg19/database/ hg19
rsync -cavzP rsync://hgdownload.cse.ucsc.edu/goldenPath/hg38/database/ hg38
./createHg38.sh
./createHg19.sh
```
