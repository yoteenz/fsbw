#!/usr/bin/env bash
# Verify AIO freight schema + RLS enablement via CI-compatible pooler SQL.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

bash "$SCRIPT_DIR/aio-project-guard.sh" pre-schema

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "FAIL: SUPABASE_DB_PASSWORD required"
  exit 1
fi

node "$SCRIPT_DIR/aio-verify-schema.mjs"
