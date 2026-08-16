#!/usr/bin/env bash
# Apply All In One migrations to PRODUCTION Supabase — requires explicit confirmation.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export AIO_MIGRATION_TARGET="${AIO_MIGRATION_TARGET:-production}"
export AIO_SUPABASE_PROJECT_REF="${AIO_PRODUCTION_PROJECT_REF:-${AIO_SUPABASE_PROJECT_REF:-}}"

if [[ -z "${AIO_SUPABASE_PROJECT_REF:-}" ]]; then
  echo "BLOCKED: Set AIO_PRODUCTION_PROJECT_REF to dedicated production project."
  echo "Owner action required — see docs/DATABASE_OPERATIONS.md"
  exit 2
fi

if [[ "${AIO_CONFIRM_PRODUCTION:-}" != "yes-i-understand-production" ]]; then
  echo "ABORT: Production migrations require:"
  echo "  AIO_CONFIRM_PRODUCTION=yes-i-understand-production"
  echo "Target ref: ${AIO_SUPABASE_PROJECT_REF:-unset}"
  exit 1
fi

bash scripts/verify-migration-environment.sh

echo ""
echo "Production migration prerequisites:"
echo "  - Staging dry-run PASS on clean + current state"
echo "  - RLS staging suite PASS"
echo "  - Backup verified"
echo ""
echo "Apply with Supabase CLI:"
echo "  supabase db push --project-ref $AIO_SUPABASE_PROJECT_REF"
