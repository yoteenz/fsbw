#!/usr/bin/env bash
# Regression: AIO Vitest must not require repository-root tailwindcss (GHA simulation).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
cd "$ROOT"

echo "=== AIO toolchain boundary regression (clean install, no root node_modules) ==="

# Preserve caller node_modules; use temp copy without parent deps.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp -a "$ROOT/." "$TMP/aio/"
mkdir -p "$TMP/repo-root"
cp "$REPO_ROOT/postcss.config.js" "$TMP/repo-root/postcss.config.js" 2>/dev/null || true

mkdir -p "$TMP/repo-root/all-in-one-enterprises"
cp -a "$TMP/aio/." "$TMP/repo-root/all-in-one-enterprises/"

cd "$TMP/repo-root/all-in-one-enterprises"
rm -rf node_modules
npm ci --silent

bash scripts/check-toolchain-boundary.sh

npm run test -- src/freight/demoProductionIsolation.test.ts

npm run test -- \
  src/freight/freightGoldenPath.test.ts \
  src/freight/freightProduction.test.ts \
  src/brokerage/brokerageBookkeepingHandoff.test.ts \
  src/freight/freight.test.ts

VITE_AIO_SUPABASE_URL=https://nnnljnhtmseagotvgxxt.supabase.co \
VITE_AIO_SUPABASE_ANON_KEY=placeholder-build-only \
VITE_AIO_DATA_MODE=supabase \
npm run build

echo "All AIO toolchain boundary regression checks passed."
