# Production Readiness Reconciliation

## Stale documentation

| Document | Date | Issue |
|----------|------|-------|
| `docs/PRODUCTION_READINESS_REPORT.md` | 2026-08-16 | Claims 8 migrations; **17** exist. States Supabase not configured; project **nnnljnhtmseagotvgxxt** now linked in CI. |

## Current CI truth (preferred)

| Workflow | Purpose |
|----------|---------|
| `aio-standalone-qa.yml` | Build, unit tests, isolation |
| `aio-supabase-production-validate.yml` | Migrations, schema, RLS, live domain tests |
| `aio-production-readiness.yml` | Readiness orchestration (dispatch) |

**Launch gate:** Production validate job fails unless recorded `finalStatus` is READY TO DEPLOY (semantic PASS/FAIL/BLOCKED per step—not green step alone).

## Reconciled readiness axes

| Area | Reconciled status |
|------|-------------------|
| Standalone app / isolation | Implemented; CI must pass on each push |
| Schema + migrations | **MATCH** after history alignment |
| RLS enablement | PASS in CI schema step |
| Live RLS assertions | **BLOCKED** until role test Auth secrets |
| Service-role fixture writes | **FIXED** via GRANT migration |
| Domain live tests | Shipper, bookkeeping, autopilot, golden path—expected to pass post-GRANT on next validate run |
| Public launch | **NOT READY** — approval + visual + secrets + provider/driver auth gaps |

## Demo fallback in production

`effectiveDataMode()` throws in production deployment if supabase misconfigured—**PASS** (no silent demo in prod build).

## Monitoring / backups / TLS

Not fully verified in this forensic; treat as **launch blockers** until ops runbooks updated post-structural waves.
