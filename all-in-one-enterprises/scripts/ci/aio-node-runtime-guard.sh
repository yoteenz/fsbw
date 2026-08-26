#!/usr/bin/env bash
# AIO CI Node runtime guard — @supabase/realtime-js requires native WebSocket (Node 22+).
set -euo pipefail

MAJOR="$(node -pe "process.versions.node.split('.')[0]")"

echo "=== AIO Node runtime guard ==="
echo "NODE_VERSION: $(node -v)"

if [[ "$MAJOR" -lt 22 ]]; then
  echo "FAIL: AIO CI requires Node.js 22+ (native WebSocket for Supabase live validation)"
  exit 1
fi

echo "AIO Node runtime guard: PASS"
