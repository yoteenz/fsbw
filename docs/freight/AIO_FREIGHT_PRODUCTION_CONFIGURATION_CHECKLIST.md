# AIO Freight — Production Configuration Checklist

**Product:** All In One Enterprises (`all-in-one-enterprises/`)  
**Authoritative Supabase project:** `nnnljnhtmseagotvgxxt`  
**Forbidden (Frontal Slayer):** `hyycomvcaqxxvyrfupes`

Canonical detail: `all-in-one-enterprises/docs/freight/AIO_FREIGHT_PRODUCTION_CONFIGURATION_CHECKLIST.md`

---

## Phone-triggerable GitHub Action

| Item | Value |
|------|--------|
| Workflow | `.github/workflows/aio-supabase-production-validate.yml` |
| Trigger | `workflow_dispatch` only (manual) |
| Environment | `aio-production` |
| Working directory | `all-in-one-enterprises` |

### Required environment secrets (`aio-production`)

| Secret | Purpose |
|--------|---------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI + Management API (never logged) |
| `SUPABASE_PROJECT_ID` | Must equal `nnnljnhtmseagotvgxxt` |
| `SUPABASE_DB_PASSWORD` | Postgres link + schema verify (never logged) |

### Optional secrets (full live RLS / role matrix)

| Secret | Purpose |
|--------|---------|
| `AIO_RLS_TEST_SHIPPER_A_JWT` | Shipper A session |
| `AIO_RLS_TEST_SHIPPER_B_JWT` | Shipper B session |
| `AIO_RLS_TEST_CARRIER_A_JWT` | Carrier A session |
| `AIO_RLS_TEST_CARRIER_B_JWT` | Carrier B session |
| `AIO_RLS_TEST_STAFF_JWT` | AIO staff session |
| `AIO_RLS_TEST_SHIPPER_A_ORG` | Shipper A org id for cross-org test |
| `AIO_SUPABASE_SERVICE_ROLE_KEY` | Optional; fetched via Management API when absent |

If role JWTs are missing, workflow marks **RLS — BLOCKED** and final status remains **NOT READY TO DEPLOY**.

---

## Mobile trigger steps

1. GitHub app → repository → **Actions**
2. **AIO Supabase Production Validate**
3. **Run workflow** → branch `master` → **Run workflow**
4. Open the run → read **Summary** on the job page

---

## Validation gates (workflow)

| Gate | Script / test |
|------|----------------|
| Project guard | `scripts/ci/aio-project-guard.sh` |
| Migrations | `supabase db push --linked` |
| Schema + RLS enabled | `scripts/ci/aio-verify-schema.sh` |
| Live RLS | `src/freight/freightRlsIntegration.test.ts` |
| Storage | `src/freight/freightStorageSecurity.test.ts` |
| Shipper repository | `src/shipper/shipperFreightRepositoryLive.test.ts` |
| Bookkeeping handoff | `src/brokerage/brokerageBookkeepingHandoffLive.test.ts` |
| Golden path | `src/freight/freightLiveGoldenPath.test.ts` |
| Demo isolation | `src/freight/demoProductionIsolation.test.ts` + `scripts/check-isolation.sh` |
| Unit tests | golden path (demo), production, bookkeeping, freight |
| Build | `npm run build` (AIO directory only) |

**Does not deploy** — no Vercel / production release steps.

---

## Current status

Workflow exists; live run results populate `all-in-one-enterprises/.ci/aio-validation-results.json` and the GitHub Actions job summary after each manual run.

Until a successful manual run with all gates PASS (or only non-blocking deferred items), status remains:

**NOT READY TO DEPLOY — BLOCKERS REMAIN**
