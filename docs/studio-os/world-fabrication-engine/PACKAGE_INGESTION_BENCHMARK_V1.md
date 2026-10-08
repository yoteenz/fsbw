# Package Ingestion Benchmark V1

Real-file benchmark for SITE 00 Build Object V2 Codex/Blender return packages.

## Workflow

`RECEIVE → INVENTORY → VERIFY → EXTRACT GLB METADATA → PROFILE → VALIDATE → READINESS REPORT → LINEAGE → FOUNDER REVIEW`

Code: `src/studio-os-core/world-fabrication-engine/package-ingestion/`

## Benchmark outputs

Generated under `benchmarks/site00-build-object-v2/reports/` when ingestion tests run with fixture present:

- `inventory.json`
- `glb-inspection.json`
- `asset-package-manifest.json`
- `technical-art-audit.json`
- `lineage.json`
- `readiness-report.json`
- `founder-review-package.json`

## Execution tiers

| Tier | Status in this sprint |
|------|------------------------|
| Contract / manifest validation | Verified (tests) |
| Real GLB parse (Node) | Verified when fixture extracted |
| Blender `.blend` inspection | **BLOCKED** (no Blender CLI in cloud agent) |
| Unreal import | **NOT TESTED** (per package documentation) |
| End-to-end Codex agent loop | **IMPORT_RETURN_PATH_ONLY** |

## Fixture

Extract `SITE00_Build_Object_V2_Review_Package.zip` (or Under4MB subset) to `benchmarks/site00-build-object-v2/fixture/`. Binary fixture files are gitignored; committed JSON reports reflect the last verified ingestion run.
