#!/usr/bin/env bash
# RLS staging test runner — executes when staging Supabase is configured.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${AIO_STAGING_SUPABASE_URL:-}" || -z "${AIO_STAGING_SUPABASE_ANON_KEY:-}" ]]; then
  echo "NOT_CONFIGURED: Set AIO_STAGING_SUPABASE_URL and AIO_STAGING_SUPABASE_ANON_KEY"
  echo "Optional role JWTs: AIO_RLS_TEST_SHIPPER_A_JWT, AIO_RLS_TEST_SHIPPER_B_JWT, AIO_RLS_TEST_CARRIER_A_JWT, AIO_RLS_TEST_STAFF_JWT"
  echo "See docs/freight/AIO_FREIGHT_PRODUCTION_CONFIGURATION_CHECKLIST.md"
  exit 2
fi

cd "$ROOT"
npm run test -- src/freight/freightRlsIntegration.test.ts
