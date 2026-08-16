#!/usr/bin/env bash
# Validate All In One production/staging environment configuration before build or deploy.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FS_FORBIDDEN="hyycomvcaqxxvyrfupes"
ENV="${VITE_AIO_ENVIRONMENT:-${AIO_ENVIRONMENT:-local}}"
DATA_MODE="${VITE_AIO_DATA_MODE:-demo}"
AUTH_MODE="${VITE_AIO_AUTH_MODE:-demo}"
STORAGE_MODE="${VITE_AIO_STORAGE_MODE:-demo}"
SUPABASE_URL="${VITE_AIO_SUPABASE_URL:-}"
STAGING_REF="${VITE_AIO_STAGING_PROJECT_REF:-}"
PROD_REF="${VITE_AIO_PRODUCTION_PROJECT_REF:-}"

errors=0
warnings=0

fail() { echo "ERROR: $1"; errors=$((errors + 1)); }
warn() { echo "WARN: $1"; warnings=$((warnings + 1)); }

echo "=== All In One environment validation ==="
echo "Environment: $ENV"
echo "Data mode: $DATA_MODE | Auth: $AUTH_MODE | Storage: $STORAGE_MODE"

if [[ "$ENV" == "production" || "$ENV" == "prod" ]]; then
  if [[ "$DATA_MODE" == "demo" ]]; then fail "production cannot use demo data mode"; fi
  if [[ "$AUTH_MODE" == "demo" ]]; then fail "production cannot use demo auth mode"; fi
  if [[ "$STORAGE_MODE" == "demo" ]]; then fail "production cannot use demo storage mode"; fi
  if [[ -z "${VITE_AIO_APP_URL:-}" ]]; then warn "VITE_AIO_APP_URL not set"; fi
fi

if [[ "$SUPABASE_URL" == *"$FS_FORBIDDEN"* ]]; then
  fail "Supabase URL references forbidden Frontal Slayer project $FS_FORBIDDEN"
fi

if [[ -n "$STAGING_REF" && -n "$PROD_REF" && "$STAGING_REF" == "$PROD_REF" ]]; then
  fail "Staging and production Supabase project refs must differ"
fi

if [[ "$errors" -gt 0 ]]; then
  echo ""
  echo "Validation FAILED ($errors errors, $warnings warnings)"
  exit 1
fi

echo "Validation OK ($warnings warnings)"
exit 0
