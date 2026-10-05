# Customer tenant proof

Live harness: `wave1TenantIsolation.live.test.ts`. Tables in scope: `aio_service_requests`, `aio_documents`, `aio_invoices`, `aio_messages`, `aio_appointments`, `aio_road_ready_profiles`, `aio_insurance_cases`, `aio_factoring_cases`.

**Status:** Proofs execute in CI when `AIO_LIVE_SUPABASE_TEST=1` and role JWT secrets are provisioned. Without secrets: **BLOCKED** (harness present, no false PASS).
