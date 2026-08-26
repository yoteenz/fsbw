#!/usr/bin/env bash
# Detect accidental AIO dependency on repository-root Frontal Slayer frontend tooling.
# Uses semantic Vite config resolution (not ripgrep — unavailable on GHA ubuntu-latest).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
cd "$ROOT"

FAIL=0

echo "=== AIO PostCSS ownership ==="
if [[ ! -f "$ROOT/postcss.config.js" ]]; then
  echo "FAIL: missing all-in-one-enterprises/postcss.config.js (required CI boundary)"
  FAIL=1
else
  echo "OK: AIO postcss.config.js present"
fi

if node "$ROOT/scripts/verify-toolchain-postcss.mjs" 2>/tmp/aio-postcss-probe.err; then
  : # verify script prints OK lines
else
  echo "FAIL: effective Vite/Vitest PostCSS not bounded to AIO package"
  sed -E 's/(postgresql:\/\/[^@]+@|password[=[:space:]]+[^[:space:]]+)/[REDACTED]/gi' /tmp/aio-postcss-probe.err 2>/dev/null || true
  FAIL=1
fi

echo ""
echo "=== Root PostCSS leakage simulation (no repo-root node_modules) ==="
if [[ -f "$REPO_ROOT/postcss.config.js" ]]; then
  if [[ ! -f "$ROOT/node_modules/vite/package.json" ]]; then
    echo "WARN: AIO node_modules/vite missing - run npm ci in all-in-one-enterprises"
  fi
  if [[ -f "$ROOT/postcss.config.js" ]] && grep -q 'plugins' "$ROOT/postcss.config.js"; then
    echo "OK: AIO postcss config is self-contained"
  else
    echo "FAIL: AIO postcss config unreadable or missing plugins block"
    FAIL=1
  fi
else
  echo "WARN: no repository-root postcss.config.js (leakage check skipped)"
fi

echo ""
echo "=== Forbidden FS Supabase project in AIO env defaults ==="
if grep -rq "hyycomvcaqxxvyrfupes" "$ROOT/vite.config.ts" "$ROOT/vitest.config.ts" "$ROOT/postcss.config.js" 2>/dev/null; then
  echo "FAIL: forbidden FS project ref in AIO toolchain config"
  FAIL=1
else
  echo "OK"
fi

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi

echo ""
echo "Toolchain boundary check: PASS"
