# AIO Freight — Production Configuration Report

**Product:** All In One Enterprises  
**Date:** 2026-08-19  
**Supabase project (AIO):** `nnnljnhtmseagotvgxxt`

Canonical detail: `all-in-one-enterprises/docs/refinement/AIO_FREIGHT_PRODUCTION_CONFIGURATION_REPORT.md`

---

## GitHub Actions validation workflow (new)

A manually triggered workflow validates AIO Supabase production configuration without deploying.

| Field | Value |
|-------|--------|
| File | `.github/workflows/aio-supabase-production-validate.yml` |
| Name | AIO Supabase Production Validate |
| Environment | `aio-production` |
| Isolation | Hard guard rejects `hyycomvcaqxxvyrfupes`; runs only from `all-in-one-enterprises/` |

### What the workflow does

1. Validates `SUPABASE_PROJECT_ID === nnnljnhtmseagotvgxxt`
2. Links Supabase CLI to AIO only
3. Preflights local vs remote migrations (15 SQL files in repo)
4. Applies migrations via `supabase db push --linked`
5. Verifies freight schema + RLS enablement (postgres)
6. Fetches anon/service keys via Management API (no secret echo)
7. Runs live RLS, storage, shipper repo, bookkeeping handoff, golden path tests
8. Runs demo isolation + freight unit tests + AIO production build
9. Writes phone-readable GitHub Actions summary + artifact JSON

### Run results

Record each manual run in the table below (no secrets):

| Run date | GitHub run URL | Final status | Notes |
|----------|----------------|--------------|-------|
| _(pending first manual run)_ | | | |

---

## Deployment recommendation

**NOT READY TO DEPLOY — BLOCKERS REMAIN** until the workflow completes with:

- Migrations PASS  
- Schema PASS  
- Live RLS PASS (not BLOCKED)  
- Golden path + financial privacy PASS  
- Production build PASS  

Founder triggers workflow from GitHub mobile after secrets are configured in `aio-production`.

---

## Related CI scripts

- `all-in-one-enterprises/scripts/ci/aio-project-guard.sh`
- `all-in-one-enterprises/scripts/ci/aio-migration-preflight.sh`
- `all-in-one-enterprises/scripts/ci/aio-verify-schema.sh`
- `all-in-one-enterprises/scripts/ci/aio-fetch-api-keys.mjs`
- `all-in-one-enterprises/scripts/ci/aio-write-summary.mjs`
