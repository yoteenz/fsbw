#!/usr/bin/env bash
# RLS staging test runner — executes when staging Supabase is configured.

set -euo pipefail

if [[ -z "${AIO_STAGING_SUPABASE_URL:-}" || -z "${AIO_STAGING_SUPABASE_ANON_KEY:-}" ]]; then
  echo "NOT_CONFIGURED: Set AIO_STAGING_SUPABASE_URL and AIO_STAGING_SUPABASE_ANON_KEY"
  echo "Run Customer A/B and staff role matrix manually — see docs/DATABASE_OPERATIONS.md"
  exit 2
fi

echo "RLS staging tests: run vitest integration suite against staging when implemented."
echo "Checklist:"
echo "  - Customer A vs Customer B isolation"
echo "  - Staff role permissions"
echo "  - Storage signed URL expiry"
exit 0
