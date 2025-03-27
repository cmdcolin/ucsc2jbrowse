curl https://api.genome.ucsc.edu/list/ucscGenomes | jq -r '.ucscGenomes | keys[]' | while
  read p
do
  echo $p
  mkdir -p $p/$p
  rsync --max-size=2G -avzP rsync://hgdownload.cse.ucsc.edu/goldenPath/$p/database $p/$p/
done
