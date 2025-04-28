import { readConfig } from './util.ts'

const config = readConfig(process.argv[2]!)

console.log(
  JSON.stringify(
    {
      ...config,
      plugins: [
        ...config.plugins,
        {
          name: 'MsaView',
          umdLoc: {
            uri: 'jbrowse-plugin-msaview.umd.production.min.js',
          },
        },
        {
          name: 'Protein3d',
          umdLoc: {
            uri: 'jbrowse-plugin-protein3d.umd.production.min.js',
          },
        },
      ],
      tracks: [
        ...config.tracks.map(f => {
          if (f.trackId.startsWith('jaspar')) {
            return {
              ...f,
              displays: [
                {
                  type: 'LinearBasicDisplay',
                  displayId: `${f.trackId}-LinearBasicDisplay`,
                  jexlFilters: ["get(feature,'score')>400"],
                  renderer: {
                    type: 'SvgFeatureRenderer',
                    labels: {
                      name: "jexl:get(feature,'TFName')",
                    },
                  },
                },
              ],
            }
          }
          return f
        }),
        {
          type: 'FeatureTrack',
          trackId: 'ncbi_refseq_109_hg38_latest',
          name: 'NCBI RefSeq (GFF3Tabix)',
          assemblyNames: ['hg38'],
          category: ['Annotation'],
          adapter: {
            type: 'Gff3TabixAdapter',
            gffGzLocation: {
              uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/ncbi_refseq/GRCh38_latest_genomic.sort.gff.gz',
              locationType: 'UriLocation',
            },
            index: {
              location: {
                uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/ncbi_refseq/GRCh38_latest_genomic.sort.gff.gz.tbi',
                locationType: 'UriLocation',
              },
            },
          },
        },
        {
          type: 'FeatureTrack',
          trackId: 'ncbi_gff_hg19',
          name: 'NCBI RefSeq w/ subfeature details',
          formatDetails: {
            subfeatures:
              "jexl:{name:'<a href=https://google.com/?q='+feature.name+'>'+feature.name+'</a>'}",
          },
          assemblyNames: ['hg19'],
          category: ['Annotation'],
          metadata: {
            source: 'https://www.ncbi.nlm.nih.gov/genome/guide/human/',
            dateaccessed: '12/03/2020',
          },
          adapter: {
            type: 'Gff3TabixAdapter',
            gffGzLocation: {
              uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/hg19/ncbi_refseq/GRCh37_latest_genomic.sort.gff.gz',
            },
            index: {
              location: {
                uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/hg19/ncbi_refseq/GRCh37_latest_genomic.sort.gff.gz.tbi',
              },
            },
          },
        },
      ],

      aggregateTextSearchAdapters: [
        {
          type: 'TrixTextSearchAdapter',
          textSearchAdapterId: 'hg19-index',
          ixFilePath: {
            uri: 'https://jbrowse.org/genomes/hg19/trix/hg19.ix',
            locationType: 'UriLocation',
          },
          ixxFilePath: {
            uri: 'https://jbrowse.org/genomes/hg19/trix/hg19.ixx',
            locationType: 'UriLocation',
          },
          metaFilePath: {
            uri: 'https://jbrowse.org/genomes/hg19/trix/meta.json',
            locationType: 'UriLocation',
          },
          assemblyNames: ['hg19'],
        },
        {
          type: 'TrixTextSearchAdapter',
          textSearchAdapterId: 'hg38-index',
          ixFilePath: {
            uri: 'https://jbrowse.org/genomes/GRCh38/trix/hg38.ix',
            locationType: 'UriLocation',
          },
          ixxFilePath: {
            uri: 'https://jbrowse.org/genomes/GRCh38/trix/hg38.ixx',
            locationType: 'UriLocation',
          },
          metaFilePath: {
            uri: 'https://jbrowse.org/genomes/GRCh38/trix/meta.json',
            locationType: 'UriLocation',
          },
          assemblyNames: ['hg38'],
        },
      ],
    },
    null,
    2,
  ),
)
