#!/usr/bin/env bash
# Compare local vs remote Supabase migration history; fail before db push on mismatch.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

MIG_DIR="supabase/migrations"
RESULTS="${AIO_CI_RESULTS_PATH:-$ROOT/.ci/aio-validation-results.json}"

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

remote_versions=()
if [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
  export PGPASSWORD="$SUPABASE_DB_PASSWORD"
  PGHOST="db.${AIO_CANONICAL_PROJECT_REF}.supabase.co"
  while IFS= read -r line; do
    [[ -n "$line" ]] && remote_versions+=("$line")
  done < <(psql -h "$PGHOST" -p 5432 -U postgres -d postgres -tAc \
    "select version from supabase_migrations.schema_migrations order by version;")
  unset PGPASSWORD
else
  set +e
  remote_raw="$(npx --yes "supabase@${SUPABASE_CLI_VERSION}" migration list --linked 2>&1)"
  remote_exit=$?
  set -e
  if [[ $remote_exit -ne 0 ]]; then
    echo "FAIL: could not read remote migration list"
    echo "$remote_raw"
    exit 1
  fi
  echo ""
  echo "REMOTE MIGRATIONS (CLI):"
  echo "$remote_raw"
  while IFS= read -r line; do
    ver="$(echo "$line" | awk -F'|' '{gsub(/ /,"",$2); print $2}' | grep -E '^[0-9]+$' || true)"
    [[ -n "$ver" ]] && remote_versions+=("$ver")
  done <<< "$remote_raw"
fi

echo ""
echo "REMOTE MIGRATIONS: ${#remote_versions[@]}"
printf '  %s\n' "${remote_versions[@]}"

remote_only=()
local_only=()

for rv in "${remote_versions[@]}"; do
  found=0
  for lv in "${local_versions[@]}"; do
    [[ "$rv" == "$lv" ]] && found=1 && break
  done
  [[ $found -eq 0 ]] && remote_only+=("$rv")
done

for lv in "${local_versions[@]}"; do
  found=0
  for rv in "${remote_versions[@]}"; do
    [[ "$lv" == "$rv" ]] && found=1 && break
  done
  [[ $found -eq 0 ]] && local_only+=("$lv")
done

history_status="MATCH"
if [[ ${#remote_only[@]} -gt 0 || ${#local_only[@]} -gt 0 ]]; then
  history_status="MISMATCH"
fi

echo ""
echo "REMOTE-ONLY: ${remote_only[*]:-(none)}"
echo "LOCAL-ONLY: ${local_only[*]:-(none)}"
echo "HISTORY STATUS: $history_status"

node "$SCRIPT_DIR/aio-migration-history-check.mjs" "$RESULTS" "${#local_versions[@]}" "${#remote_versions[@]}" "$history_status" "${remote_only[*]:-}" "${local_only[*]:-}"

if [[ "$history_status" != "MATCH" ]]; then
  echo ""
  echo "FAIL: migration history mismatch — reconcile before db push."
  echo "See docs/refinement/AIO_SUPABASE_MIGRATION_HISTORY_RECONCILIATION.md"
  exit 1
fi

echo "Migration history check: PASS"
