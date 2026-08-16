#!/usr/bin/env bash
# Scan worktree for accidental secret patterns — does not print matched secrets.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

patterns=(
  'service_role'
  'SUPABASE_SERVICE_ROLE'
  'sk_live_'
  'sk_test_'
  'AKIA[0-9A-Z]{16}'
  'hyycomvcaqxxvyrfupes'
)

found=0
for pat in "${patterns[@]}"; do
  if rg -l -i "$pat" --glob '!.env*' --glob '!node_modules/**' --glob '!dist/**' . >/tmp/aio-secret-scan.txt 2>/dev/null; then
    count=$(wc -l < /tmp/aio-secret-scan.txt)
    if [[ "$count" -gt 0 ]]; then
      echo "Potential secret pattern '$pat' in $count file(s) — review manually (values not printed)"
      found=$((found + count))
    fi
  fi
done

if [[ "$found" -gt 0 ]]; then
  echo "Secret scan: REVIEW REQUIRED ($found hits)"
  exit 1
fi

echo "Secret scan: OK (no obvious patterns in tracked source)"
exit 0
