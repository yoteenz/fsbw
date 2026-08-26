#!/usr/bin/env bash
# Compare local vs remote Supabase migration history; fail before db push on mismatch.
# Uses Supabase CLI (post-link) as authoritative remote source — never direct db.* psql.
# Fail-closed: connection/query failure => UNKNOWN, not MISMATCH.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

MIG_DIR="supabase/migrations"
RESULTS="${AIO_CI_RESULTS_PATH:-$ROOT/.ci/aio-validation-results.json}"
TMP_STATE="$(mktemp)"
trap 'rm -f "$TMP_STATE"' EXIT

if [[ ! -d "$MIG_DIR" ]]; then
  echo "FAIL: missing $MIG_DIR"
  exit 1
fi

mapfile -t local_files < <(find "$MIG_DIR" -maxdepth 1 -name '*.sql' -print | sort)
local_versions=()
for f in "${local_files[@]}"; do
  base="$(basename "$f" .sql)"
  local_versions+=("${base%%_*}")
done

echo "=== Migration history check (post-link) ==="
echo "LOCAL MIGRATIONS: ${#local_versions[@]}"
printf '  %s\n' "${local_versions[@]}"

remote_query_ok=false
remote_malformed=false
remote_method="none"
remote_versions_json='[]'

# --- Primary: Supabase CLI (same connection stack as `supabase link` / `db push`) ---
cli_cmd=(npx --yes "supabase@${SUPABASE_CLI_VERSION}" migration list --linked)
if [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
  cli_cmd+=(-p "$SUPABASE_DB_PASSWORD")
fi

set +e
remote_cli_raw="$("${cli_cmd[@]}" 2>&1)"
remote_cli_exit=$?
set -e

if [[ $remote_cli_exit -eq 0 ]]; then
  remote_method="supabase-cli"
  REMOTE_CLI_STDOUT="$remote_cli_raw" node -e "
    import { writeFileSync } from 'node:fs';
    import { parseRemoteVersionsFromCliOutput } from './scripts/ci/aio-migration-history-lib.mjs';
    const parsed = parseRemoteVersionsFromCliOutput(process.env.REMOTE_CLI_STDOUT ?? '');
    const ok = parsed.sawDataRow && !parsed.malformed;
    writeFileSync('$TMP_STATE', JSON.stringify({
      versions: parsed.versions,
      malformed: parsed.malformed,
      queryOk: ok,
      method: 'supabase-cli',
    }));
  "
  remote_query_ok="$(node -e "process.stdout.write(String(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).queryOk))")"
  remote_malformed="$(node -e "process.stdout.write(String(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).malformed))")"
  remote_versions_json="$(node -e "process.stdout.write(JSON.stringify(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).versions))")"

  if [[ "$remote_query_ok" == "true" ]]; then
    echo ""
    echo "REMOTE HISTORY QUERY: PASS (supabase-cli)"
    echo "REMOTE MIGRATIONS (CLI):"
    echo "$remote_cli_raw"
  else
    remote_query_ok=false
    echo ""
    echo "WARN: Supabase CLI migration list returned no parseable remote rows"
  fi
else
  echo ""
  echo "WARN: Supabase CLI migration list failed (exit $remote_cli_exit)"
  echo "$remote_cli_raw" | sed -E 's/(password|postgresql:\/\/[^@]+@)/[REDACTED]/gi' | head -20
fi

# --- Fallback: pooler SQL (CI-compatible; avoids direct db.<ref>.supabase.co IPv6 issues) ---
if [[ "$remote_query_ok" != "true" && -n "${SUPABASE_DB_PASSWORD:-}" && -f supabase/.temp/pooler-url ]]; then
  echo ""
  echo "Attempting pooler SQL fallback (post-link pooler-url)..."
  set +e
  pooler_json="$(node "$SCRIPT_DIR/aio-migration-history-pooler-query.mjs" 2>/dev/null)"
  pooler_exit=$?
  set -e
  if [[ $pooler_exit -eq 0 ]]; then
    POOLER_JSON="$pooler_json" node -e "
      import { writeFileSync } from 'node:fs';
      const r = JSON.parse(process.env.POOLER_JSON);
      const ok = r.ok && Array.isArray(r.versions) && r.versions.length > 0 && !r.malformed;
      writeFileSync('$TMP_STATE', JSON.stringify({
        versions: r.versions ?? [],
        malformed: !!r.malformed,
        queryOk: ok,
        method: 'supabase-pooler-sql',
      }));
    "
    remote_query_ok="$(node -e "process.stdout.write(String(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).queryOk))")"
    remote_malformed="$(node -e "process.stdout.write(String(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).malformed))")"
    remote_versions_json="$(node -e "process.stdout.write(JSON.stringify(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).versions))")"
    remote_method="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).method)")"
    if [[ "$remote_query_ok" == "true" ]]; then
      echo "REMOTE HISTORY QUERY: PASS (supabase-pooler-sql)"
    else
      echo "WARN: pooler SQL fallback did not yield authoritative remote history"
    fi
  else
    echo "WARN: pooler SQL fallback failed"
  fi
fi

# --- Evaluate (fail-closed) ---
LOCAL_VERSIONS="$(printf '%s\n' "${local_versions[@]}")" \
REMOTE_VERSIONS_JSON="$remote_versions_json" \
REMOTE_QUERY_OK="$remote_query_ok" \
REMOTE_MALFORMED="$remote_malformed" \
REMOTE_METHOD="$remote_method" \
node -e "
  import { writeFileSync } from 'node:fs';
  import { evaluateHistoryCheck } from './scripts/ci/aio-migration-history-lib.mjs';
  const local = (process.env.LOCAL_VERSIONS ?? '').split('\n').filter(Boolean);
  const remote = JSON.parse(process.env.REMOTE_VERSIONS_JSON ?? '[]');
  const result = evaluateHistoryCheck({
    localVersions: local,
    remoteVersions: remote,
    remoteQueryOk: process.env.REMOTE_QUERY_OK === 'true',
    malformed: process.env.REMOTE_MALFORMED === 'true',
    remoteMethod: process.env.REMOTE_METHOD ?? 'none',
  });
  writeFileSync('$TMP_STATE', JSON.stringify(result));
"

eval_json="$(cat "$TMP_STATE")"
history_status="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).historyStatus)")"
remote_query_status="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).remoteQueryStatus)")"
connection_status="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).connectionStatus)")"
remote_count="$(node -e "const r=JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')); process.stdout.write(r.remoteCount===null?'':String(r.remoteCount))")"
remote_only="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).remoteOnly.join(' '))")"
local_only="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).localOnly.join(' '))")"
exit_code="$(node -e "process.stdout.write(String(JSON.parse(require('fs').readFileSync('$TMP_STATE','utf8')).exitCode))")"

echo ""
echo "REMOTE HISTORY QUERY: $remote_query_status"
if [[ "$remote_query_status" != "PASS" ]]; then
  echo "CONNECTION STATUS: $connection_status"
fi

if [[ "$remote_query_status" == "PASS" && -n "$remote_count" ]]; then
  echo "REMOTE MIGRATIONS: $remote_count"
  node -e "
    const v = JSON.parse(process.argv[1]);
    for (const x of v) console.log('  ' + x);
  " "$remote_versions_json"
else
  echo "REMOTE MIGRATIONS: (not retrieved — remote query did not succeed)"
fi

echo ""
echo "REMOTE-ONLY: ${remote_only:-(none)}"
echo "LOCAL-ONLY: ${local_only:-(none)}"
echo "HISTORY STATUS: $history_status"

echo "$eval_json" | node "$SCRIPT_DIR/aio-migration-history-check.mjs" "$RESULTS"

if [[ "$exit_code" -ne 0 ]]; then
  echo ""
  if [[ "$history_status" == "UNKNOWN" ]]; then
    echo "FAIL: could not retrieve authoritative remote migration history — aborting before db push."
    echo "Direct db.<project-ref>.supabase.co psql is not used; prefer Supabase CLI or pooler SQL."
  else
    echo "FAIL: migration history mismatch — reconcile before db push."
    echo "See docs/refinement/AIO_SUPABASE_MIGRATION_HISTORY_RECONCILIATION.md"
  fi
  exit "$exit_code"
fi

echo "Migration history check: PASS"
