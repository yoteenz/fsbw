#!/usr/bin/env bash
# Migration preflight — local inventory before link (no remote access yet).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

RESULTS="${AIO_CI_RESULTS_PATH:-$ROOT/.ci/aio-validation-results.json}"
MIG_DIR="supabase/migrations"

mapfile -t local_files < <(find "$MIG_DIR" -maxdepth 1 -name '*.sql' -print | sort)
local_count="${#local_files[@]}"

echo "=== Migration preflight (local inventory) ==="
echo "LOCAL MIGRATIONS: $local_count"
for f in "${local_files[@]}"; do
  base="$(basename "$f" .sql)"
  echo "  $base"
done
echo "REMOTE MIGRATIONS: (deferred until post-link history check)"
echo "HISTORY STATUS: pending post-link check"

node "$SCRIPT_DIR/aio-migration-history-check.mjs" "$RESULTS" "$local_count" "0" "PENDING" "" ""

echo "Migration preflight: local inventory recorded ($local_count files)"
