# AIO CI DB URL encoding fix

**Sprint:** P0.AIO.SUPABASE-CI-POOLER-DB-URL-ENCODING-FIX1

## Root cause

`scripts/ci/aio-ci-db-transport.mjs` → `getPercentEncodedPoolerDbUrl()` applied `encodeURIComponent()` to the **entire** DSN after password substitution. `aio-ci-export-db-url.mjs` wrote that value to `AIO_CI_DB_URL`, producing `postgresql%3A%2F%2F...` — invalid for `psql` and `--db-url`.

## Fix

- **`scripts/ci/aio-ci-db-url.mjs`** — `buildAioCiDatabaseUrl()` raw DSN; password-only encoding; guards; sanitized logging.
- **`exportRawDbUrlToGithubEnv()`** — GitHub `GITHUB_ENV` heredoc (multiline-safe), not URI-encoded line.
- **`aio-ci-postgres-auth-precheck.mjs`** — `psql -c 'select 1'` before migration history.
- **`resolvePoolerUri()`** — prefers `AIO_CI_DB_URL` when set; rejects full-uri encoding.

## Contract

`postgresql://postgres.<ref>:<encoded-password>@<pooler-host>:5432/postgres?sslmode=require`
