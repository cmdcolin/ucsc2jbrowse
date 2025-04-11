#!/bin/bash
# Index all bed.gz files
fd ".bed.gz$" $1 | parallel "echo {}; tabix -C -f {}"
fd ".gff.gz$" $1 | parallel "echo {}; tabix -C -f {}"
