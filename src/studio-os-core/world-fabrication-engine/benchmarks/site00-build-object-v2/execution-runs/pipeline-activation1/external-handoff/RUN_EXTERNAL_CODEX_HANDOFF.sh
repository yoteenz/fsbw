#!/usr/bin/env bash
# Run on a machine with OPENAI_API_KEY and Blender 5.2.2+ (WFE_CODEX_BIN optional).
set -euo pipefail
export WFE_PACKAGE_ROOT="/workspace/src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-v2/fixture"
export WFE_RETURN_ROOT="/workspace/src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-v2/execution-runs/pipeline-activation1/codex-return"
mkdir -p "$WFE_RETURN_ROOT"
npx --yes @openai/codex exec "Bounded WFE task: run Blender 5.2 headless with --python /workspace/src/studio-os-core/world-fabrication-engine/execution/blender/wfe_blender_benchmark_runner.py using env WFE_PACKAGE_ROOT and WFE_RETURN_ROOT. Do not modify creative geometry. Return only when report JSON exists."
echo "Then ingest: npm run wfe:codex-fabrication-proof"
