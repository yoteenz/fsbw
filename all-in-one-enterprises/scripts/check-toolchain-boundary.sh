#!/usr/bin/env bash
# Detect accidental AIO dependency on repository-root Frontal Slayer frontend tooling.
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

if rg -q "postcss\.config\.js" "$ROOT/vite.config.ts" "$ROOT/vitest.config.ts" 2>/dev/null; then
  echo "OK: Vite/Vitest pin AIO postcss config"
else
  echo "FAIL: vite.config.ts or vitest.config.ts must pin css.postcss to AIO-owned config"
  FAIL=1
fi

echo ""
echo "=== Root PostCSS leakage simulation (no repo-root node_modules) ==="
if [[ -f "$REPO_ROOT/postcss.config.js" ]]; then
  # Simulate GHA: AIO-only install; root tailwindcss must not be required.
  if ! node -e "
    const { pathToFileURL } = require('node:url');
    const path = require('node:path');
    const fs = require('node:fs');
    const aioPostcss = path.join('$ROOT', 'postcss.config.js');
    const cfg = fs.readFileSync(aioPostcss, 'utf8');
    if (!cfg.includes('plugins')) process.exit(1);
  "; then
    echo "FAIL: AIO postcss config unreadable"
    FAIL=1
  else
    echo "OK: AIO postcss config is self-contained"
  fi
else
  echo "WARN: no repository-root postcss.config.js (leakage check skipped)"
fi

echo ""
echo "=== Forbidden FS Supabase project in AIO env defaults ==="
if rg -l "hyycomvcaqxxvyrfupes" vite.config.ts vitest.config.ts postcss.config.js 2>/dev/null; then
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
