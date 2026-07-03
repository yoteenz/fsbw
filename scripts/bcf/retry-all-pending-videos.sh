#!/usr/bin/env bash
# Retry missing BCF videos + failed color regens until manifest shows 75/75 ready.
set -euo pipefail
cd "$(dirname "$0")/../.."

COLOR_FAIL_KEYS="bundles-curly-cherry,bundles-curly-citrine,bundles-curly-ginger,bundles-curly-raspberry,bundles-curly-slime,bundles-curly-teal,bundles-straight-cherry,bundles-straight-citrine,bundles-straight-ginger,bundles-straight-teal,bundles-wavy-citrine"

LOG="/tmp/bcf-video-retry-all.log"
MAX_CYCLES=20
CYCLE=0

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

while [ "$CYCLE" -lt "$MAX_CYCLES" ]; do
  CYCLE=$((CYCLE + 1))
  log "=== Cycle $CYCLE/$MAX_CYCLES ==="

  log "Refreshing manifest..."
  npm run bcf:videos:manifest >>"$LOG" 2>&1

  read -r TOTAL READY MISSING FAILED <<<"$(node -e "
    const m = require('./scripts/bcf/manifests/bcf-videos-v1.json');
    const s = m.summary || {};
    console.log(s.total||75, s.ready||0, s.missing||0, s.failed||0);
  ")"

  log "Status: ready=$READY/$TOTAL missing=$MISSING failed=$FAILED"

  if [ "$MISSING" = "0" ] && [ "$FAILED" = "0" ] && [ "$READY" = "$TOTAL" ]; then
    log "All $TOTAL videos ready — syncing manifest..."
    npm run bcf:videos:sync >>"$LOG" 2>&1
    log "DONE — 75/75 complete"
    exit 0
  fi

  if [ "$MISSING" != "0" ] || [ "$FAILED" != "0" ]; then
    log "Phase A: RETRY_PENDING=1 FORCE=1 (missing=$MISSING failed=$FAILED)"
    RETRY_PENDING=1 FORCE=1 SKIP_WEBM=1 npm run bcf:videos:generate >>"$LOG" 2>&1 || true
  fi

  log "Phase B: FORCE regen for 11 color-fail keys"
  ONLY_PRODUCT_KEYS="$COLOR_FAIL_KEYS" FORCE=1 SKIP_WEBM=1 npm run bcf:videos:generate >>"$LOG" 2>&1 || true

  log "Sleep 30s before next cycle..."
  sleep 30
done

log "ERROR: Max cycles reached — check $LOG"
exit 1
