# Corplus: A concordancer for corpora with language corrections

## About

Corplus is a specialised concordancer developed for exploring corpora that contain annotated language corrections. Unlike typical concordancers, Corplus enables the retrieval and comparison of both erroneous and corrected forms within a text. This makes it particularly useful for research in first and second language acquisition, learner corpus analysis, and language teaching.

The tool has already been used with two Slovene corpora: the CORPLUS learner corpus (https://viri.cjvt.si/corplus/en/) and the Šolar developmental corpus (https://viri.cjvt.si/solar/en/). Its flexible design allows it to be adapted for different languages and corpus types.

## Deployment

1. Copy `docker-compose-prod.yml` and `cli/import-prod.sh` to your server
2. Run `docker-compose up -d`
3. Create `import` directory and place files in it (see below)
4. Run `import-prod.sh` (any existing data will be deleted)

## Importing data

Before importing make sure the `CORPLUS_DATABASE_URL` environment variable is set and databse is running.

Place files in the `import` directory.
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

## Acknowledgements

Corpus was developed under the umbrella of two projects:
- The initial version was prepared with financial aid from the Ministry of Culture in a project "CORPLUS/KUUS"(https://www.cjvt.si/korpus-corplus/en/projects/).
- The finalisation of the tool and its adaptation to the Šolar corpus was financed by the Slovenian Research and Innovation Agency in a project "Empirical foundations for digitally-supported development of writing skills (J7-3159)"(https://www.cjvt.si/prop/en/).
- The UI was designed by Gašper Uršič (https://www.gasperursic.com/) and developed by RSLabs agency (https://rs-labs.si/).
