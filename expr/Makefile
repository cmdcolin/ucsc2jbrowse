# UCSC to JBrowse conversion Makefile
# Default output directory
OUT ?= $(HOME)/ucscResults
# Set locale
export LC_ALL=C
export NODE_OPTIONS=--no-warnings=ExperimentalWarning

# Default number of parallel jobs
JOBS ?= 12

# List of assemblies (to be provided as arguments)
ASSEMBLIES ?= $(wildcard ~/ucsc/*)

# Pattern rule for tracks.json files
$(OUT)/%/tracks.json: ~/ucsc/%/%/database/trackDb.sql ~/ucsc/%/%/database/trackDb.txt.gz
	@mkdir -p $(dir $@)
	node src/tracksDbLike.ts $< $(word 2,$^) > $@

# Pattern rule for gene tracks processing
.PHONY: gene_tracks
gene_tracks: $(foreach asm,$(notdir $(ASSEMBLIES)),$(OUT)/$(asm)/gene_tracks.done)

# Pattern rule for gene tracks processing for each assembly
$(OUT)/%/gene_tracks.done: $(OUT)/%/tracks.json
	@mkdir -p $(dir $@)
	$(MAKE) -j $(JOBS) process_gene_tracks TRACKS_JSON=$< DBDIR=~/ucsc/$*/$$*/database OUTDIR=$(dir $@)
	touch $@

# Process gene tracks from tracks.json
.PHONY: process_gene_tracks
process_gene_tracks:
	@jq -r 'to_entries | .[] | select(.value.type | startswith("genePred")) | .key' $(TRACKS_JSON) | \
	grep -v "^wgEncode" | \
	while read key; do \
		infile="$(DBDIR)/$$key"; \
		outfile="$(OUTDIR)/$$key"; \
		if [ -f "$$infile.sql" ]; then \
			mkdir -p "$$(dirname "$$outfile")"; \
			node src/geneLike.ts "$$infile.sql" "$$infile.txt.gz" | sort -k1,1 -k2,2n > "$$outfile.bed"; \
			hck -f 13,4 "$$outfile.bed" > "$$outfile.isoforms.txt"; \
			node src/fixupIsoforms.ts "$$outfile.isoforms.txt"; \
			~/bed2gff -t2 --bed "$$outfile.bed" --output "$$outfile.gff" --isoforms "$$outfile.isoforms.txt"; \
			if [ -f "$$infile"Link.sql ]; then \
				node src/enhanceGffWithLinkTable.ts "$$outfile.gff" "$$infile"Link.txt.gz "$$infile"Link.sql > "$$outfile.enhanced.gff"; \
				jbrowse sort-gff "$$outfile.enhanced.gff" | bgzip > "$$outfile.sorted.gff.gz"; \
			else \
				jbrowse sort-gff "$$outfile.gff" | bgzip > "$$outfile.sorted.gff.gz"; \
			fi; \
			rm -f "$$outfile.bed" "$$outfile.isoforms.txt" "$$outfile.enhanced.gff" "$$outfile.gff"; \
		fi; \
	done

# Pattern rule for bigTracks.json files
$(OUT)/%/bigTracks.json: $(OUT)/%/tracks.json
	node src/parseBigFileTracks.ts $< ~/ucsc/$*/$*/database $(dir $@) > $@

# Pattern rule for adding big data tracks to config.json
$(OUT)/%/config.json: $(OUT)/%/bigTracks.json
	node src/addBigDataTracks.ts $< $@

# Main target to process all assemblies
.PHONY: all
all: $(foreach asm,$(notdir $(ASSEMBLIES)),$(OUT)/$(asm)/gene_tracks.done)

# Clean target
.PHONY: clean
clean:
	rm -rf $(OUT)

# Help target
.PHONY: help
help:
	@echo "UCSC to JBrowse conversion Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make [target] [ASSEMBLIES=path/to/assemblies] [OUT=output/dir] [JOBS=12]"
	@echo ""
	@echo "Targets:"
	@echo "  all             Process all gene tracks for all assemblies (default)"
	@echo "  gene_tracks     Process gene tracks for all assemblies"
	@echo "  clean           Remove all generated files"
	@echo "  help            Display this help message"
	@echo ""
	@echo "Variables:"
	@echo "  ASSEMBLIES      List of assembly directories (default: ~/ucsc/*)"
	@echo "  OUT             Output directory (default: ~/ucscResults)"
	@echo "  JOBS            Number of parallel jobs (default: 12)"

