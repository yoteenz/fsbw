#!/usr/bin/env bash
# All In One — migration environment guard
# ABORT if target appears to be Frontal Slayer Supabase production.

set -euo pipefail

FS_FORBIDDEN_PROJECT="hyycomvcaqxxvyrfupes"
AIO_PROJECT_REF="${AIO_SUPABASE_PROJECT_REF:-}"
SUPABASE_URL="${AIO_SUPABASE_URL:-${VITE_AIO_SUPABASE_URL:-}}"

if [[ -z "$AIO_PROJECT_REF" && -z "$SUPABASE_URL" ]]; then
  echo "ERROR: Set AIO_SUPABASE_PROJECT_REF or AIO_SUPABASE_URL before applying All In One migrations."
  exit 1
fi

if [[ "$AIO_PROJECT_REF" == "$FS_FORBIDDEN_PROJECT" ]]; then
  echo "ABORT: AIO_SUPABASE_PROJECT_REF matches Frontal Slayer production ($FS_FORBIDDEN_PROJECT)."
  echo "All In One migrations must target a DEDICATED All In One Supabase project only."
  exit 1
fi

if [[ "$SUPABASE_URL" == *"$FS_FORBIDDEN_PROJECT"* ]]; then
  echo "ABORT: Supabase URL references Frontal Slayer project ($FS_FORBIDDEN_PROJECT)."
  exit 1
fi

MIGRATIONS_DIR="$(cd "$(dirname "$0")/../supabase/migrations" && pwd)"
echo "All In One migration guard: OK"
echo "Target project ref: ${AIO_PROJECT_REF:-(from URL)}"
echo "Migrations directory: $MIGRATIONS_DIR"
echo "Migration files:"
ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null || echo "(none)"

echo ""
echo "Apply migrations using Supabase CLI against the dedicated AIO project:"
echo "  supabase db push --project-ref <AIO_PROJECT_REF>"
echo ""
echo "Do NOT run against Frontal Slayer project $FS_FORBIDDEN_PROJECT."
