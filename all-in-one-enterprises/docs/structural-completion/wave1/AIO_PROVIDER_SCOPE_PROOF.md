# Provider scope proof

Live harness: `wave1TenantIsolation.live.test.ts`. Tables in scope: `aio_service_providers`, `aio_fleetcare_tickets`, `aio_fleetcare_service_jobs`.

**Status:** Proofs execute in CI when `AIO_LIVE_SUPABASE_TEST=1` and role JWT secrets are provisioned. Without secrets: **BLOCKED** (harness present, no false PASS).
