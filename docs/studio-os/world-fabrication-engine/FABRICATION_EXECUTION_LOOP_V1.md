# Fabrication Execution Loop V1

## Workflow

Studio OS assignment → **Blender local runner** (verified) → return package → `package-ingestion/` → founder review (pending).

Codex programmatic dispatch: **BLOCKED** — handoffs prepared; manual external execution.

## Blender

- Requires **Blender 5.2+** for V2 `.blend` (Zstandard compression).
- Cloud benchmark uses `/home/ubuntu/.tools/blender-5.2.2-linux-x64/blender` or `WFE_BLENDER_BIN`.
- Runner: `execution/blender/wfe_blender_benchmark_runner.py`

## Evidence tiers

| Stage | Status |
|-------|--------|
| Handoff prepared | Verified |
| Codex job dispatched | Blocked |
| Blender executed | Verified (when 5.2 available) |
| Return ingested | Verified |
| Full agent automation | Not verified |

## Reduced vs full package

See `benchmarks/site00-build-object-v2/reports/full-package-missing-manifest.json`.
