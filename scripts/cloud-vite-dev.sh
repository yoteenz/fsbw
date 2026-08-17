#!/usr/bin/env bash
# Cloud Agent / mobile preview: Vite with ASSTS local API + Supabase env for serverless routes.
set -euo pipefail
cd "$(dirname "$0")/.."

export SUPABASE_URL="${SUPABASE_URL:-${VITE_SUPABASE_URL:-}}"
export SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-${VITE_SUPABASE_ANON_KEY:-}}"
export ADMIN_EMAILS="${ADMIN_EMAILS:-${VITE_ADMIN_EMAILS:-}}"

exec env FSBW_CLOUD_MOBILE_PREVIEW=1 npm run dev
