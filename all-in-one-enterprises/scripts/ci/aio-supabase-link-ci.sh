#!/usr/bin/env bash
# Link AIO Supabase project using Supavisor session pooler (IPv4-safe for GitHub Actions).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

set +x

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "FAIL: AIO_SUPABASE_PROJECT_LINK_FAILURE — missing SUPABASE_ACCESS_TOKEN"
  exit 1
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "FAIL: AIO_SUPABASE_DB_AUTH_FAILURE — missing SUPABASE_DB_PASSWORD"
  exit 1
fi

node "$SCRIPT_DIR/aio-ci-pooler-precheck.mjs"
node "$SCRIPT_DIR/aio-ci-normalize-pooler.mjs"

echo "=== Supabase link (pooler session mode; no --skip-pooler) ==="
if ! npx --yes "supabase@${SUPABASE_CLI_VERSION}" link \
  --project-ref "$AIO_CANONICAL_PROJECT_REF" \
  --password "$SUPABASE_DB_PASSWORD"; then
  echo "FAIL: AIO_SUPABASE_PROJECT_LINK_FAILURE"
  bash "$SCRIPT_DIR/aio-record-result.sh" supabaseLink FAIL "link failed"
  exit 1
fi

node "$SCRIPT_DIR/aio-ci-normalize-pooler.mjs"

bash "$SCRIPT_DIR/aio-record-result.sh" supabaseLink PASS
echo "Supabase link: PASS"
