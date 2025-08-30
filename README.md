# Corplus: A concordancer for corpora with language corrections

## About

Corplus is a specialised concordancer developed for exploring corpora that contain annotated language corrections. Unlike typical concordancers, Corplus enables the retrieval and comparison of both erroneous and corrected forms within a text. This makes it particularly useful for research in first and second language acquisition, learner corpus analysis, and language teaching.

The tool has already been used with two Slovene corpora: the KOST learner corpus (https://viri.cjvt.si/kost/en/) and the Šolar developmental corpus (https://viri.cjvt.si/solar/en/). Its flexible design allows it to be adapted for different languages and corpus types.

In this repository, Corplus interface is similar to the one used for the Kost learner corpus. You can adapt it to your corpus and design, however make sure to include proper acknowledgment and cite the Corplus tool.

## Deployment

1. Copy `docker-compose-prod.yml` and `cli/import-prod.sh` to your server
2. Run `docker-compose up -d`
3. Create `import` directory and place files in it (see below)
4. Run `import-prod.sh` (any existing data will be deleted)

## Importing data

Before importing make sure the `CORPLUS_DATABASE_URL` environment variable is set and databse is running.

Place files in the `import` directory (sample files of the KOST corpus are provided there).
The following files are required:
- `corplus-corr.xml`
- `corplus-errs.xml`
- `corplus-orig.xml`

If you are developing locally, you can use `pnpm import` script to import the data.

```bash
pnpm import-data
```

If you are running a docker container, you can use the `import-prod.sh` script to import the data.

```bash
sh import-prod.sh
```
## How to cite

Kosem, I., Arhar Holdt, Š., Stritar Kučuk, M. & Urbanc, R. (2025). Corpus: a concordancer for corpora with language corrections. Ljubljana: Ljubljana University Press.

## Acknowledgements

Corpus was developed under the umbrella of two projects:
- The initial version was prepared with financial aid from the Ministry of Culture in a project "KOST/KUUS"(https://www.cjvt.si/korpus-kost/en/projects/).
- The finalisation of the tool and its adaptation to the Šolar corpus was financed by the Slovenian Research and Innovation Agency in a project "Empirical foundations for digitally-supported development of writing skills (J7-3159)"(https://www.cjvt.si/prop/en/).
- The UI was designed by Gašper Uršič (https://www.gasperursic.com/) and developed by RSLabs agency (https://rs-labs.si/).
