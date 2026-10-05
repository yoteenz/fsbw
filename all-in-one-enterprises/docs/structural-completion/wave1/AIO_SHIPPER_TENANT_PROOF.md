# Shipper tenant proof

Live harness: `wave1TenantIsolation.live.test.ts`. Tables in scope: `aio_shipment_requests`, `aio_brokerage_shipments`, `aio_brokerage_quotes`, `aio_brokerage_shipper_invoices`.

**Status:** Proofs execute in CI when `AIO_LIVE_SUPABASE_TEST=1` and role JWT secrets are provisioned. Without secrets: **BLOCKED** (harness present, no false PASS).
