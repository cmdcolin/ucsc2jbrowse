#!/bin/bash

for i in $OUTDIR/*.bed.gz; do 
	echo $i;
	jbrowse add-track `basename $i` --load inPlace --trackId `basename $i .bed.gz` --out $OUTDIR --force; 
done;


