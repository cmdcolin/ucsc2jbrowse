#!/bin/bash
# Index all bed.gz files
find $1 -name "*.bed.gz" | parallel "echo {}; tabix -C -f {}"
