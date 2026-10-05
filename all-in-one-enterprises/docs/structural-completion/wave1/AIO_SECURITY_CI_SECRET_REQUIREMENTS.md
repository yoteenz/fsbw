# AIO Wave 1 CI Secret Requirements

**Environment:** GitHub `aio-production` (workflow `aio-supabase-production-validate.yml`)

## Supabase project (non-secret)

- `SUPABASE_PROJECT_ID` = `nnnljnhtmseagotvgxxt`
- `AIO_STAGING_SUPABASE_URL` — set by `aio-fetch-api-keys.mjs` in CI
- `AIO_STAGING_SUPABASE_ANON_KEY` — set by fetch step

## Auth provisioning (preferred)

For each identity, set **email + password** OR pre-rotated **JWT** secret:

- `AIO_RLS_TEST_CUSTOMER_A_EMAIL` + `AIO_RLS_TEST_CUSTOMER_A_PASSWORD` → provisions `AIO_RLS_TEST_CUSTOMER_A_JWT`; optional `AIO_RLS_TEST_CUSTOMER_A_ORG` for IDOR fixtures
- `AIO_RLS_TEST_CUSTOMER_B_EMAIL` + `AIO_RLS_TEST_CUSTOMER_B_PASSWORD` → provisions `AIO_RLS_TEST_CUSTOMER_B_JWT`; optional `AIO_RLS_TEST_CUSTOMER_B_ORG` for IDOR fixtures
- `AIO_RLS_TEST_SHIPPER_A_EMAIL` + `AIO_RLS_TEST_SHIPPER_A_PASSWORD` → provisions `AIO_RLS_TEST_SHIPPER_A_JWT`; optional `AIO_RLS_TEST_SHIPPER_A_ORG` for IDOR fixtures
- `AIO_RLS_TEST_SHIPPER_B_EMAIL` + `AIO_RLS_TEST_SHIPPER_B_PASSWORD` → provisions `AIO_RLS_TEST_SHIPPER_B_JWT`
- `AIO_RLS_TEST_CARRIER_A_EMAIL` + `AIO_RLS_TEST_CARRIER_A_PASSWORD` → provisions `AIO_RLS_TEST_CARRIER_A_JWT`
- `AIO_RLS_TEST_DRIVER_A_EMAIL` + `AIO_RLS_TEST_DRIVER_A_PASSWORD` → provisions `AIO_RLS_TEST_DRIVER_A_JWT`
- `AIO_RLS_TEST_DRIVER_B_EMAIL` + `AIO_RLS_TEST_DRIVER_B_PASSWORD` → provisions `AIO_RLS_TEST_DRIVER_B_JWT`
- `AIO_RLS_TEST_PROVIDER_A_EMAIL` + `AIO_RLS_TEST_PROVIDER_A_PASSWORD` → provisions `AIO_RLS_TEST_PROVIDER_A_JWT`
- `AIO_RLS_TEST_PROVIDER_B_EMAIL` + `AIO_RLS_TEST_PROVIDER_B_PASSWORD` → provisions `AIO_RLS_TEST_PROVIDER_B_JWT`
- `AIO_RLS_TEST_STAFF_EMAIL` + `AIO_RLS_TEST_STAFF_PASSWORD` → provisions `AIO_RLS_TEST_STAFF_JWT`
- `AIO_RLS_TEST_STAFF_SPECIALIST_EMAIL` + `AIO_RLS_TEST_STAFF_SPECIALIST_PASSWORD` → provisions `AIO_RLS_TEST_STAFF_SPECIALIST_JWT`
- `AIO_RLS_TEST_STAFF_ADMIN_EMAIL` + `AIO_RLS_TEST_STAFF_ADMIN_PASSWORD` → provisions `AIO_RLS_TEST_STAFF_ADMIN_JWT`

## Server-only (never client)

- `AIO_SUPABASE_SERVICE_ROLE_KEY` — fixture writes / golden path only; **VALID_SERVER_ONLY**

## Token strategy

1. CI runs `scripts/ci/aio-provision-rls-test-sessions.mjs` (ephemeral JWT via sign-in).
2. Optional static JWT secrets skip sign-in when rotating is inconvenient.

## Blocked semantics

If core JWTs missing after provision: live role matrix reports **BLOCKED** with exact env names — not PASS.
