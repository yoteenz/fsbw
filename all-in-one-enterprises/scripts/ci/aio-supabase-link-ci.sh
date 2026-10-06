#!/usr/bin/env bash
# Link AIO Supabase project using Supavisor session pooler (IPv4-safe for GitHub Actions).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

set +x

DIAG_DIR="${AIO_LINK_DIAG_DIR:-$ROOT/.ci/aio-link-diagnostic}"
mkdir -p "$DIAG_DIR"

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

LINK_STDOUT="$DIAG_DIR/link.stdout"
LINK_STDERR="$DIAG_DIR/link.stderr"
DEBUG_STDOUT="$DIAG_DIR/debug.stdout"
DEBUG_STDERR="$DIAG_DIR/debug.stderr"

echo "=== Supabase link (pooler session mode; no --skip-pooler) ==="
set +e
npx --yes "supabase@${SUPABASE_CLI_VERSION}" link \
  --project-ref "$AIO_CANONICAL_PROJECT_REF" \
  --password "$SUPABASE_DB_PASSWORD" >"$LINK_STDOUT" 2>"$LINK_STDERR"
link_exit=$?
set -e

if [[ $link_exit -ne 0 ]]; then
  echo "FAIL: AIO_SUPABASE_PROJECT_LINK_FAILURE (primary link attempt)"

  echo "=== Supabase link diagnostic (--debug, sanitized artifact) ==="
  set +e
  npx --yes "supabase@${SUPABASE_CLI_VERSION}" link \
    --project-ref "$AIO_CANONICAL_PROJECT_REF" \
    --password "$SUPABASE_DB_PASSWORD" \
    --debug >"$DEBUG_STDOUT" 2>"$DEBUG_STDERR"
  set -e

  node "$SCRIPT_DIR/aio-link-permission-diagnostic.mjs" \
    --link-stdout "$LINK_STDOUT" \
    --link-stderr "$LINK_STDERR" \
    --debug-stdout "$DEBUG_STDOUT" \
    --debug-stderr "$DEBUG_STDERR"

  bash "$SCRIPT_DIR/aio-record-result.sh" supabaseLink FAIL "AIO_SUPABASE_PROJECT_LINK_FAILURE — see link diagnostic artifact"
  exit 1
fi

node "$SCRIPT_DIR/aio-ci-normalize-pooler.mjs"

bash "$SCRIPT_DIR/aio-record-result.sh" supabaseLink PASS
echo "Supabase link: PASS"
