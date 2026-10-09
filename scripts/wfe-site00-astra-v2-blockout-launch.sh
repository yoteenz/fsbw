#!/usr/bin/env bash
# Founder-authorized Phase B only. Spawns billable Codex exec.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG="$ROOT/src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-astra-v2-blockout"
RUN="$PKG/execution-runs/phase-b-blockout"
REF="$PKG/03_COMPARISONS/approved-reference.jpg"
PROMPT="$RUN/codex-assignment-prompt.txt"

if [[ "${WFE_BLOCKOUT_PHASE_B_AUTHORIZED:-}" != "1" ]]; then
  echo "BLOCKED: export WFE_BLOCKOUT_PHASE_B_AUTHORIZED=1 after founder Gate 01 approval"
  exit 1
fi
if [[ -z "${WFE_FOUNDER_AUTHORIZED_BUDGET_USD:-}" ]] || [[ "${WFE_FOUNDER_AUTHORIZED_BUDGET_USD}" == "0" ]]; then
  echo "BLOCKED: set WFE_FOUNDER_AUTHORIZED_BUDGET_USD (soft ceiling; not enforced by OpenAI API)"
  exit 1
fi

"$ROOT/scripts/wfe-site00-astra-v2-blockout-preflight.sh"

mkdir -p "$RUN"
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
cat > "$RUN/LAUNCH_IMAGE_INPUT_EVIDENCE.json" <<EOF
{
  "launchedAt": "$STAMP",
  "model": "gpt-6-astra",
  "codexCli": "0.162.0",
  "imageInput": "$REF",
  "promptPath": "$PROMPT",
  "budgetUsdSoftCeiling": "${WFE_FOUNDER_AUTHORIZED_BUDGET_USD}",
  "budgetEnforcement": "SOFT_ONLY",
  "timeoutMs": ${WFE_CODEX_EXEC_TIMEOUT_MS:-900000}
}
EOF

export WFE_CODEX_MODEL="${WFE_CODEX_MODEL:-gpt-6-astra}"
TIMEOUT_MS="${WFE_CODEX_EXEC_TIMEOUT_MS:-900000}"

echo "Launching Codex Phase B (billable)..."
npx --yes @openai/codex@0.162.0 exec \
  -m "$WFE_CODEX_MODEL" \
  -s workspace-write \
  -C "$ROOT" \
  -i "$REF" \
  - < "$PROMPT" 2>&1 | tee "$RUN/codex-exec.log"

echo "Done. Review $RUN/codex-exec.log for tokens and WFE_ASTRA_V2_BLOCKOUT_COMPLETE line."
