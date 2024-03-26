#!/bin/bash
# install chain2paf
# git clone https://github.com/AndreaGuarracino/chain2paf
# cd chain2paf
# cargo install --force --path .
#
#
function pif() {
	wget -nc $1
	pigz -dc `basename $1` > `basename $1 .gz`
	chain2paf --input `basename $1 .gz` > `basename $1 .chain.gz`.paf
	jbrowse make-pif `basename $1 .chain.gz`.paf  # generates pif.gz and pif.gz.tbi
}


pif https://hgdownload.cse.ucsc.edu/goldenpath/hg19/liftOver/hg19ToHg38.over.chain.gz
pif https://hgdownload.soe.ucsc.edu/goldenPath/hg38/liftOver/hg38ToHg19.over.chain.gz
pif https://hgdownload.soe.ucsc.edu/goldenPath/hg38/liftOver/hg38ToMm39.over.chain.gz
pif https://hgdownload.soe.ucsc.edu/goldenPath/mm39/liftOver/mm39ToHg38.over.chain.gz

# jbrowse add-track hg19ToHg38.over.pif.gz -a hg38,hg19 --out ~/ucscResults/hg19/
# jbrowse add-track hg38ToHg19.over.pif.gz -a hg19,hg38 --out ~/ucscResults/hg38/
# jbrowse add-track hg38ToMm39.over.pif.gz -a mm39,hg38 --out ~/ucscResults/hg38/
# jbrowse add-track mm39ToHg38.over.pif.gz -a hg38,mm39 --out ~/ucscResults/mm39
