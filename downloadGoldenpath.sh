curl https://api.genome.ucsc.edu/list/ucscGenomes | jq -r '.ucscGenomes | keys[]' | while
  read p
do
  echo $1/$p
  mkdir -p $1/$p/$p
  rsync --max-size=2G -avzP rsync://hgdownload.cse.ucsc.edu/goldenPath/$p/database $1/$p/$p/
done
