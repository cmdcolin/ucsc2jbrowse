#!/bin/bash

# Use the first argument as the directory, or default to current directory if not provided
DIR="${1:-.}"

# Run find on the specified directory
find "$DIR" -type f | parallel md5sum | sort -k2,2 >md5sum.txt
