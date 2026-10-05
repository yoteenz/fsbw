# Shipper / carrier financial boundary proof

Tables: `aio_brokerage_load_financials`, `aio_brokerage_quote_pricing_drafts`, view `aio_brokerage_load_financials_internal` (staff).

| Actor | carrier pay / margin | shipper charge |
|-------|-------------------|----------------|
| SHIPPER_A | DENY | ALLOW (own rows) |
| CARRIER_A | ALLOW (own rate) | DENY |
| STAFF | ALLOW (internal view) | ALLOW |

Live tests in `wave1TenantIsolation.live.test.ts` + `freightRlsIntegration.test.ts`.
