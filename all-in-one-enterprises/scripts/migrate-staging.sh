#!/usr/bin/env bash
# Apply All In One migrations to STAGING Supabase project only.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export AIO_MIGRATION_TARGET="${AIO_MIGRATION_TARGET:-staging}"
export AIO_SUPABASE_PROJECT_REF="${AIO_STAGING_PROJECT_REF:-${AIO_SUPABASE_PROJECT_REF:-}}"

if [[ -z "${AIO_SUPABASE_PROJECT_REF:-}" ]]; then
  echo "BLOCKED: Set AIO_STAGING_PROJECT_REF or AIO_SUPABASE_PROJECT_REF to dedicated staging project."
  echo "Owner action required — see docs/DATABASE_OPERATIONS.md"
  exit 2
fi

if [[ "${AIO_CONFIRM_STAGING:-}" != "yes" ]]; then
  echo "Refusing to migrate without AIO_CONFIRM_STAGING=yes"
  echo "Target ref: $AIO_SUPABASE_PROJECT_REF"
  exit 1
fi

bash scripts/verify-migration-environment.sh

echo ""
echo "Staging migration dry-run checklist:"
echo "  1. Apply to clean staging project"
echo "  2. Re-apply to current staging state (forward migrations only)"
echo ""
echo "Apply with Supabase CLI:"
echo "  supabase db push --project-ref $AIO_SUPABASE_PROJECT_REF"
echo ""
echo "Then run: npm run test:rls-staging (when configured)"
