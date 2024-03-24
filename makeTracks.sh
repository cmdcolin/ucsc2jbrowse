#!/bin/bash

for i in *.bed.gz; do 
	jbrowse add-track $i --load inPlace --trackId `basename $i .bed.gz`; 
done;


