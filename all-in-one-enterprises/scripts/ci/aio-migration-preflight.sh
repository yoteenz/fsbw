#!/usr/bin/env bash
# Migration preflight — local vs remote migration inventory (no mutations).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

RESULTS="${AIO_CI_RESULTS_PATH:-.ci/aio-validation-results.json}"
mkdir -p "$(dirname "$RESULTS")"

MIG_DIR="supabase/migrations"
local_count="$(find "$MIG_DIR" -maxdepth 1 -name '*.sql' 2>/dev/null | wc -l | tr -d ' ')"

echo "=== Migration preflight ==="
echo "Local migration files: $local_count"
echo "Local migrations:"
find "$MIG_DIR" -maxdepth 1 -name '*.sql' -print | sort

remote_list=""
pending_note="unknown"
if command -v npx >/dev/null 2>&1; then
  set +e
  remote_list="$(npx --yes "supabase@${SUPABASE_CLI_VERSION}" migration list --linked 2>&1)"
  list_exit=$?
  set -e
  if [[ $list_exit -eq 0 ]]; then
    echo ""
    echo "Remote migration list:"
    echo "$remote_list"
    pending_note="see migration list above"
  else
    echo ""
    echo "Remote migration list unavailable (link/db push may be required first)"
    pending_note="remote list failed — will attempt db push"
  fi
fi

node - <<'NODE' "$RESULTS" "$local_count" "$pending_note"
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const [resultsPath, localCount, pendingNote] = process.argv.slice(2);
let data = existsSync(resultsPath) ? JSON.parse(readFileSync(resultsPath, 'utf8')) : { project: 'nnnljnhtmseagotvgxxt' };
data.migrationsPreflight = {
  localCount: Number(localCount),
  pendingNote,
  status: 'INFO',
};
writeFileSync(resultsPath, JSON.stringify(data, null, 2));
NODE

echo "Migration preflight: recorded (local=$local_count)"
