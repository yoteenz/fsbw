# Driver scope proof

Live harness: `wave1TenantIsolation.live.test.ts`. Tables in scope: `aio_driver_profiles`, `aio_driver_credentials`, `aio_driver_applications`.

**Status:** Proofs execute in CI when `AIO_LIVE_SUPABASE_TEST=1` and role JWT secrets are provisioned. Without secrets: **BLOCKED** (harness present, no false PASS).
