#!/usr/bin/env bash
# Non-billable Gate 01 checks for SITE00_BUILD_OBJECT_ASTRA_V2_BLOCKOUT.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG="$ROOT/src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-astra-v2-blockout"
REF="$PKG/03_COMPARISONS/approved-reference.jpg"
EXPECTED_SHA="50590912003833aeff8a1851dcbd5a1342d7aa8e47c4603a4eea3e932726582b"

echo "== WFE SITE 00 Astra V2 blockout preflight =="
test -f "$REF" || { echo "MISSING reference: $REF"; exit 1; }
ACTUAL_SHA="$(sha256sum "$REF" | awk '{print $1}')"
if [[ "$ACTUAL_SHA" != "$EXPECTED_SHA" ]]; then
  echo "Reference SHA mismatch: $ACTUAL_SHA"
  exit 1
fi
echo "Reference OK ($ACTUAL_SHA)"

npx --yes @openai/codex@0.162.0 login status >/dev/null
echo "Codex auth: OK"

if npx --yes @openai/codex@0.162.0 debug models 2>/dev/null | grep -q 'gpt-6-astra'; then
  echo "Model gpt-6-astra: listed"
else
  echo "Model gpt-6-astra: NOT FOUND in debug models"
  exit 1
fi

BLENDER="${BLENDER_BIN:-/home/ubuntu/.tools/blender-5.2.2-linux-x64/blender}"
if [[ -x "$BLENDER" ]]; then
  echo "Blender: $("$BLENDER" --version | head -1)"
else
  echo "Blender: MISSING at $BLENDER"
  exit 1
fi

echo "Phase B paid exec: BLOCKED until WFE_BLOCKOUT_PHASE_B_AUTHORIZED=1 and WFE_FOUNDER_AUTHORIZED_BUDGET_USD>0"
echo "PREFLIGHT COMPLETE"
