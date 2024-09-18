# Kost Concordancer

## Deployment

1. Copy `docker-compose-prod.yml` and `cli/import-prod.sh` to your server
2. Run `docker-compose up -d`
3. Create `import` directory and place files in it (see below)
4. Run `import-prod.sh` (any existing data will be deleted)

## Importing data

Before importing make sure the `KOST_DATABASE_URL` environment variable is set and databse is running.

Place files in the `import` directory.
The following files are required:
- `kost-corr.xml`
- `kost-errs.xml`
- `kost-orig.xml`

If you are developing locally, you can use `pnpm import` script to import the data.

```bash
pnpm import-data
```

If you are running a docker container, you can use the `import-prod.sh` script to import the data.

```bash
sh import-prod.sh
```
