#!/usr/bin/env bash
# Frontal Slayer host — delegate All In One QA to standalone app (Sprint 22)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AIO="$ROOT/all-in-one-enterprises"

if [[ ! -d "$AIO" ]]; then
  echo "ERROR: all-in-one-enterprises/ not found"
  exit 1
fi

echo "=== Frontal Slayer build (regression) ==="
npm run build

echo ""
echo "=== Standalone All In One QA ==="
cd "$AIO"
npm run qa

echo ""
echo "FS + standalone QA check complete."
