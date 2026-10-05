# AIO office / specialist scope

Live harness: `wave1TenantIsolation.live.test.ts`. Tables in scope: `aio_internal_staff`, `aio_crm_notes`, `aio_internal_notes`.

**Status:** Proofs execute in CI when `AIO_LIVE_SUPABASE_TEST=1` and role JWT secrets are provisioned. Without secrets: **BLOCKED** (harness present, no false PASS).
