#!/usr/bin/env bash
# Wave 1 security live stage — PASS / FAIL / BLOCKED (never skip-as-pass).
set -euo pipefail

cd "$(dirname "$0")/../.."

export AIO_LIVE_SUPABASE_TEST=1
export AIO_STAGING_SUPABASE_URL="${AIO_STAGING_SUPABASE_URL:-https://nnnljnhtmseagotvgxxt.supabase.co}"
export VITE_AIO_SUPABASE_URL="${VITE_AIO_SUPABASE_URL:-$AIO_STAGING_SUPABASE_URL}"
export VITE_AIO_SUPABASE_ANON_KEY="${VITE_AIO_SUPABASE_ANON_KEY:-${AIO_STAGING_SUPABASE_ANON_KEY:-}}"

record() {
  bash scripts/ci/aio-record-result.sh "$@"
}

if [[ -z "${AIO_STAGING_SUPABASE_ANON_KEY:-}" && -z "${VITE_AIO_SUPABASE_ANON_KEY:-}" ]]; then
  record wave1Security BLOCKED "missing AIO_STAGING_SUPABASE_ANON_KEY"
  record wave1SecurityBlockedReason "anon key not available after fetch-api-keys"
  exit 0
fi

set +e
npm run test -- src/security/live/wave1TenantIsolation.live.test.ts 2>&1 | tee /tmp/aio-wave1-security.log
test_exit=$?
set -e

if [[ $test_exit -ne 0 ]]; then
  record wave1Security FAIL "wave1TenantIsolation.live.test.ts failed"
  exit 0
fi

missing=()
for key in AIO_RLS_TEST_SHIPPER_A_JWT AIO_RLS_TEST_SHIPPER_B_JWT AIO_RLS_TEST_CARRIER_A_JWT AIO_RLS_TEST_STAFF_JWT; do
  if [[ -z "${!key:-}" ]]; then
    missing+=("$key")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  record wave1Security BLOCKED "role matrix requires ${missing[*]} (or EMAIL/PASSWORD for provision script)"
  record wave1SecurityBlockedReason "LIVE RLS — BLOCKED_BY_MISSING_CI_SECRET"
  exit 0
fi

record wave1Security PASS
