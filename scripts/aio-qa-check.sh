#!/usr/bin/env bash
# All In One — Sprint 21 QA regression script
set -euo pipefail

echo "=== AIO Typecheck (via build tsc) ==="
npm run build

echo ""
echo "=== AIO Vitest ==="
npm run test -- src/all-in-one/

echo ""
echo "=== FS isolation guard ==="
if rg -l "from '@/lib/supabase'|from '@/utils/adminAuth'" src/all-in-one/ 2>/dev/null; then
  echo "FAIL: FS import detected in src/all-in-one/"
  exit 1
fi
echo "OK: no forbidden FS imports in AIO src"

echo ""
echo "=== Migration environment guard ==="
./all-in-one/scripts/verify-migration-environment.sh || true

echo ""
echo "=== Optional: Playwright AIO E2E (local server) ==="
echo "Run: E2E_LOCAL_SERVER=1 E2E_BASE_URL=http://localhost:3001 npm run test:aio:e2e"

echo ""
echo "QA check complete."
