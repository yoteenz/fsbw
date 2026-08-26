#!/usr/bin/env bash
# Database connectivity preflight — pooler SQL after supabase link (fail-closed).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

bash "$SCRIPT_DIR/aio-project-guard.sh" pre-db-connectivity

node "$SCRIPT_DIR/aio-db-connectivity-preflight.mjs"
