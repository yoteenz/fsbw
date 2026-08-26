#!/usr/bin/env bash
# Smoke tests for aio-record-result helper (JSON validity + edge cases).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$(mktemp -d)"
RESULTS="$TMP/results.json"
export AIO_CI_RESULTS_PATH="$RESULTS"

echo '{"project":"nnnljnhtmseagotvgxxt"}' > "$RESULTS"

run_case() {
  local name="$1"
  shift
  "$SCRIPT_DIR/aio-record-result.sh" "$@"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS', 'utf8'));
    if (typeof data !== 'object' || data === null) throw new Error('not an object');
  " || { echo "FAIL: invalid JSON after $name"; exit 1; }
  echo "OK: $name"
}

run_case "simple PASS" projectGuard PASS
run_case "simple FAIL" migrations FAIL
run_case "detail with spaces" schema PASS "db push failed — manual intervention may be required"
run_case "detail with quotes" rls BLOCKED "missing anon key \"primary\""
run_case "empty optional detail" rlsEnablement PASS
run_case "multiple entries" storage PASS "AIO_SUPABASE_SERVICE_ROLE_KEY optional"

node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$RESULTS', 'utf8'));
const expected = ['projectGuard', 'migrations', 'schema', 'rls', 'rlsEnablement', 'storage'];
for (const key of expected) {
  if (!(key in data)) throw new Error('missing key ' + key);
}
if (data.schemaDetail !== 'db push failed — manual intervention may be required') {
  throw new Error('schemaDetail mismatch');
}
if (data.rlsDetail !== 'missing anon key \\\"primary\\\"') {
  throw new Error('rlsDetail mismatch');
}
"

echo "All aio-record-result smoke tests passed."
