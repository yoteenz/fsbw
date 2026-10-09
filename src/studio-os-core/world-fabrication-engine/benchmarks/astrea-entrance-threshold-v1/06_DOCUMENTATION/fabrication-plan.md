# Astréa Entrance Threshold — creative fabrication plan (v1)

**Assignment ID:** `astrea-entrance-threshold-creative-v1`  
**Model (when authorized):** `gpt-6-astra` via Codex `exec`  
**Status:** Plan only — **not executed**

## Design intent

Build one bounded **entrance plaza + primary threshold + immediate passage** for **Astréa**, readable as a real spatial destination (not a flat hero image or SaaS landing). Interpret approved references in `astra-context/references/` — especially desktop composition **AW_D_01** for hero camera alignment where applicable.

## Scope boundaries

**In scope:** approach paving, threshold architecture, short interior continuation visible through the portal, flank architecture for depth, lighting rig, six verification cameras, PBR-oriented materials (procedural where possible).

**Out of scope:** full district, Tarot Suite / Mall / Coffee Shop interiors, characters, gameplay, production deploy.

## Execution steps (authorized run)

1. **Preflight** — copy reference JPG/PNG into `04_COMPARISONS/` for side-by-side renders.
2. **Codex session 1** — architecture plan + initial Blender `.blend` under `01_SOURCE/`, modular collections per assignment manifest.
3. **Blender render pass 1** — six cameras → `03_RENDERS/`.
4. **Codex session 2 (revision 1)** — attach hero + left/right renders (`codex exec -i ...`); document deficiencies in `creative-fidelity-assessment.md`; patch scene.
5. **Optional session 3 (revision 2)** — second render pass if within budget.
6. **Export** — review + web GLBs under `02_EXPORTS/`.
7. **WFE ingestion** — existing package ingestion + lineage (same path as SITE 00 proof).
8. **Founder review** — `07_REVIEW/founder-contact-sheet.md`, state **PENDING — V2 REVISE** until founder verdict.

## Technical art (honest targets)

| Requirement | Benchmark v1 target |
|-------------|---------------------|
| Editable modular `.blend` | PRESENT (required) |
| Web GLB export | PRESENT (required) |
| Collision / nav mesh | MISSING (document) |
| LOD strategy | NOT_REQUIRED (note future) |
| Unreal assembly | NOT_APPLICABLE |
| PBR texture pack | PARTIAL (procedural + bundled only) |

## Dispatch configuration (engineering)

```bash
export WFE_CODEX_MODEL=gpt-6-astra
export WFE_ALLOW_CODEX_EXEC_IN_VITEST=1   # only if driving via dedicated npm script
export WFE_CODEX_EXEC_TIMEOUT_MS=900000
```

Extend WFE `authorizeCodexDispatch` for `projectId: astrea` and `executionBudget.allowPaidGeneration: true` when founder approves.

## Success vs this plan

Success requires **authorized** Codex runs that produce new geometry, inspected renders, and ingested package — not this document alone.
