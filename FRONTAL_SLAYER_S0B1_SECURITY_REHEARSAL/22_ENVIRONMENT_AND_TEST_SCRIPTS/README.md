# 22 — Environment and Test Scripts

Everything here runs **locally**, except `staging/`, which is for the operator once staging is approved. No script contains a key or secret value. Scripts read connection strings from environment variables and never echo them.

## Local replica rehearsal (Track L)

Requirements: PostgreSQL 16 binaries, Node 18+, the `pg` module (from the fsbw `node_modules`).

```
# 1. Start (or restart) the socket-only cluster at /tmp/fsrehearsal_pg1 (no TCP listener)
bash harness/pgstart.sh

# 2. Build a replica database from the live-identical definitions + synthetic fixtures
bash harness/build.sh fs_post          # runs sql/00 … 05 in order

# 3. Baseline tests
node harness/run.cjs fs_post BASELINE baseline.json

# 4. Apply the candidates (committed S0A files, unchanged)
M=../../FRONTAL_SLAYER_S0A_S0B1_READINESS/10_CANDIDATE_MIGRATIONS
for f in V0_PRECHECK_readonly M1A_fs_value_rpc_execute_containment M2_fs_legacy_customer_write_policies M3_fs_hairstyle_analysis_pack_sizes V1_POSTCHECK_and_STAGING_role_tests; do
  psql -h /tmp/fsrehearsal_pg1 -U postgres -d fs_post -v ON_ERROR_STOP=1 -f $M/$f.sql; done

# 5. Post-migration tests
node harness/run.cjs fs_post POST post.json

# 6. Recovery: apply the *_ROLLBACK files in reverse order, re-run tests (expect = baseline),
#    re-apply, re-run (expect = post), run each migration a second time (idempotency)
```

| Path | Contents |
|---|---|
| `sql/00_supabase_emulation.sql` | Roles `anon`, `authenticated`, `service_role` (BYPASSRLS); `auth.uid()`/`auth.jwt()` from `request.jwt.claims`; minimal `auth.users`; `supabase_migrations.schema_migrations`. Idempotent |
| `sql/01_tables.sql` | The 19 in-scope tables + `psa_tool_events`, from the 2026-10-26 read-only capture; RLS enabled |
| `sql/02a_*.sql`, `sql/02b_*.sql` | Live function bodies and the 3 triggers (including the out-of-band debug trigger) |
| `sql/03_policies_grants.sql`, `sql/04_function_acls_live.sql` | The 32 live policies, table grants and function ACLs |
| `sql/05_fixtures.sql` | Synthetic customers A, B and an admin; orders, a meeting, notifications, a review, PSA data. No production data |
| `harness/tests.cjs` | SEC-01…32 and REG-01…20. Each test: `BEGIN; set request.jwt.claims; SET LOCAL ROLE …; attempt; ROLLBACK` |
| `harness/run.cjs` | `node run.cjs <db> <phase> <out.json>` |
| `appchecks/app_checks.ts` | Runs repository code locally (R-03 quote, R-05 ticket count, webhook signature with a synthetic secret). From the fsbw root: `node_modules/.bin/tsx <path>/app_checks.ts` |

## Staging (Track S, BLOCKED until A1a + H2 + H3 and cost approval)

| Path | Purpose |
|---|---|
| `staging/env_guard.cjs` | Fails closed on: wrong Supabase ref for `APP_ENV`, production or `site00-staging` refs in staging, key role/ref mismatch (decodes claims only, prints no value), privileged `VITE_` variables, live Stripe keys outside production, test keys in production, missing service key, production `SITE_URL` or no email sandbox in staging. Tested 7/7 with synthetic tokens (`evidence/results/env_guard_tests.txt`) |
| `staging/schema_export.sh` | `pg_dump --schema-only` from `PROD_DB_URL` (read-only role). Never prints the URL; counts data statements (must be 0) |
| `staging/schema_import.sh` | Loads into the staging database; **refuses** the production and SITE00-staging refs; requires `FS_STAGING_SUPABASE_REF` |
| `staging/staging_fixtures.sql` | Synthetic fixtures for staging (users created first through the staging Auth admin UI) |

Never commit an environment file. Never paste key values into chat or artifacts.
