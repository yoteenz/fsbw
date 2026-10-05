# AIO Security & Role Audit

## PASS / PARTIAL / FAIL summary

| Check | Status |
|-------|--------|
| Cross-org tenant isolation (RLS designed) | **PARTIAL** — migrations + live tests; role JWT BLOCKED in CI |
| Shipper vs carrier financial privacy | **PASS** — projection tests + RLS integration design |
| Internal notes visibility | **PARTIAL** — policies exist; needs live staff JWT proofs |
| Provider/driver route isolation | **FAIL** — no guards on provider/driver trees |
| Demo fallback in production build | **PASS** — throws if misconfigured |
| Secrets in frontend | **PASS** — service role not in client bundle |
| localStorage as SoT in prod | **PASS** — demo only by default |

## Route guards

- `CustomerRouteGuard`: supabase session for portal/shipper.
- `OfficeRouteGuard`: internal staff; redirects non-internal to portal.
- **Gap:** `provider/fleetcare`, `driver/driverlink` unguarded.

## RLS (freight)

Live tests: anon deny (3 pass); role matrix 4 skip without JWT secrets. Post-GRANT: service role can seed fixtures; assertions must use role under test.

## Recommendations

1. Configure GitHub `AIO_RLS_TEST_*_EMAIL/PASSWORD` secrets.
2. Add provider/driver guards + membership checks.
3. Never use service role in client to prove user RLS.

**Auth RLS tenant safety (rollup):** **PARTIAL**
