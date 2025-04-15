curl https://api.genome.ucsc.edu/list/ucscGenomes | jq -r '.ucscGenomes | keys[]' | while
  read p
do
  if [ "$p" = "cb1" ]; then
    echo "Skipping $p genome"
    continue
  fi
  echo $1/$p
  mkdir -p $1/$p/$p
  rsync --max-size=2G -qavzP rsync://hgdownload.cse.ucsc.edu/goldenPath/$p/database $1/$p/$p/
done
