#!/usr/bin/env bash
# Cloud Agent — standalone SITE 00 Vite dev server (port 5174).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITE00_SKIP_GITHUB_PULL:-}" != "1" ]]; then
  "${SCRIPT_DIR}/site00-clone-github.sh" 2>/dev/null || true
fi

SITE00_ROOT="$("${SCRIPT_DIR}/site00-resolve-root.sh")"
cd "$SITE00_ROOT"

export SUPABASE_URL="${SUPABASE_URL:-${VITE_SUPABASE_URL:-}}"
export SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-${VITE_SUPABASE_ANON_KEY:-}}"
export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
export ADMIN_EMAILS="${ADMIN_EMAILS:-${VITE_ADMIN_EMAILS:-}}"

if [[ ! -d node_modules ]]; then
  echo "[site00-vite] Installing dependencies..."
  npm ci
fi

echo "[site00-vite] Starting SITE 00 at ${SITE00_ROOT} (port 5174)"
exec env SITE00_CLOUD_MOBILE_PREVIEW=1 npm run dev
