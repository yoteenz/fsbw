#!/usr/bin/env bash
# All In One standalone — forbidden Frontal Slayer dependency scan
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FAIL=0

echo "=== FS import scan (src/) ==="
if rg -l "from ['\"]@/lib/supabase|from ['\"]@/utils/adminAuth" src/ 2>/dev/null; then
  echo "FAIL: forbidden FS import in src/"
  FAIL=1
else
  echo "OK"
fi

echo ""
echo "=== Path traversal to FS host ==="
if rg -l "\.\./\.\./\.\./src/|/frontal-slayer/" src/ 2>/dev/null; then
  echo "FAIL: host path reference"
  FAIL=1
else
  echo "OK"
fi

echo ""
echo "=== FS env fallback in app config (excluding isolation guard) ==="
if rg -l "VITE_DEV_PROXY_TARGET|FS_SUPABASE" src/ --glob '!security/fsIsolation.ts' 2>/dev/null; then
  echo "FAIL: FS env fallback"
  FAIL=1
else
  echo "OK"
fi

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
echo ""
echo "Isolation check: PASS"
