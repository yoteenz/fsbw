# FS vs Studio OS Generation Parity — Forensic Investigation

**Sprint:** P0 Generation Parity Forensics + Surgical Repair  
**Status:** Repair shipped — Founder Verification Pending  
**Last updated:** 2026-07-13

---

## Executive verdict

**Confirmed root cause (first causal divergence):** Frontal Slayer accepts FAL provider output as the final artifact with **no** `runVerifiedAssetProductionPipeline` or isolated-layer contract. Studio OS Experience Lab and Creative Director Studio route isolated layers (`signature-landmark`, `furniture-objects`) through **verified-asset production** that rejected **salvageable opaque studio plates** at structural/quality stages **before** governed background removal could run.

**Repair shipped:** Defer hard rejection for salvageable opaque studio plates; route validation by **artifact intent**; tighten `FULL_SCENE_RERENDER` to require architecture signals; expose parity forensic envelope under `?compilerDiag=1`.

---

## Side-by-side call graph

### A. Frontal Slayer (known-good control)

```
Build-a-Wig color/styling UI
  → POST /api/wig-preview/live-noir-color | /api/live-wig-after-color-styling
  → fal.subscribe(openai/gpt-image-2/edit) [sync]
  → Supabase Storage (live-preview bucket)
  → Client displays URL
  ✗ No governed jobs · ✗ No Scene Stack · ✗ No Quality Guard · ✗ No isolation validator
```

| Stage | Implementation |
|-------|----------------|
| Entry | `src/pages/build-a-wig/color/page.tsx`, `styling/page.tsx` |
| API | `api/wig-preview/live-noir-color.ts` |
| Provider | FAL `openai/gpt-image-2/edit` |
| Mode | Image edit (mannequin refs) |
| Async | Sync `fal.subscribe()` |
| Validation | None post-generation |
| Completion | URL returned → displayed |

### B. Experience Lab

```
Founder Review / validation render
  → experience-lab-render-runtime / validation-shell-pipeline
  → useSceneStack.generateLayer (validationMode: true)
  → compileSceneStackLayerPrompt + layer-model-routing
  → requestStudioBuilderGenerate
  → POST /api/admin/studio-builder-generate
  → generation-gateway → studioBuilderGeneration (FAL)
  → async-governed-generation + studio_governed_generation_jobs
  → runVerifiedAssetProductionPipeline [DIVERGENCE]
  → Scene Stack assembly → composite
```

| Stage | Implementation |
|-------|----------------|
| Shell model | `fal-ai/nano-banana-pro/edit` |
| Isolated layers | `fal-ai/nano-banana-2` T2I |
| Validation | `verified-asset-production/pipeline.ts` |
| Failure codes | `LANDMARK_VALIDATION_FAILED`, `QUALITY_REGENERATE_REQUIRED` |

### C. Creative Director Studio

```
CreativeDirectionStudioRoom
  → useSceneStack (creativeStudioStackMode: true)
  → [same kernel as Experience Lab through studio-builder-generate]
  → artifact intent routing for non-isolated CDS composites
  → runVerifiedAssetProductionPipeline (isolated layers only)
```

CDS shares the **same** FAL gateway and governed job queue as Experience Lab. Divergence from Frontal Slayer is identical at the verified-asset boundary.

---

## First causal divergence (proven)

| # | Layer | Frontal Slayer | Studio OS |
|---|-------|----------------|-----------|
| 1 | Provider dispatch | Direct FAL edit | Same FAL via `studio-builder-generate` |
| 2 | Output acceptance | Immediate | **Verified asset pipeline** |
| 3 | Isolated contract | Not applied | `isolated-layer-quality` + structural + background classify |
| 4 | Opaque studio plate | N/A (final composite OK) | **Rejected before cleanup** (pre-repair) |
| 5 | Full-scene from NB2 | N/A | Correctly rejected when architecture-dominant |

**Boundary repaired:** `salvageable-opaque.ts` + structural/quality deferral + artifact-intent gating in `pipeline.ts`.

---

## Hypothesis classification

| # | Hypothesis | Verdict |
|---|------------|---------|
| 1 | Different FAL wrapper | **Rejected** (shared gateway) |
| 2 | Different endpoint | **Contributing** (FS: gpt-image-2/edit; SO: NB2/NBP) |
| 3 | Different model | **Contributing** |
| 4 | Different generation mode | **Contributing** (edit vs T2I) |
| 5 | FS passes refs, SO does not | **Rejected** for isolated layers (intentional law) |
| 6 | SO passes prohibited scene refs | **Rejected** |
| 7 | Prompt builders differ | **Contributing** |
| 8 | SO requests isolated from scene model | **Contributing** |
| 9 | FS accepts scenes, SO requires isolated | **Confirmed** |
| 10 | Quality guard rejects usable images | **Confirmed** (pre-repair ordering) |
| 11 | Background removal wrong stage | **Confirmed** (fixed) |
| 12 | SO validates before postprocess | **Confirmed** (fixed for salvageable opaque) |
| 13 | Valid output lost in persistence | **Rejected** |
| 14 | Missing Supabase objects | **Rejected** (audit below) |
| 15 | Job polling ends early | **Contributing** (stale jobs fixed prior sprint) |
| 16 | Browser lifecycle | **Contributing** (async jobs mitigate) |
| 17 | Timeout differs | **Contributing** |
| 18 | Completion gate impossible states | **Contributing** |
| 19 | CDS/EL duplicated runtime | **Rejected** (shared kernel) |
| 20 | FS direct final-scene vs layer-first | **Confirmed** |
| 21 | Stale model routing | **Contributing** |
| 22 | Isolation validator too strict for model | **Confirmed** (contract mismatch on opaque plates) |
| 23 | Scene Stack composes rasters as transparent | **Rejected** (mount gated on approval) |
| 24 | Blueprint Author UI changed path only | **Rejected** (Founder Review is presentation) |
| 25 | Missing migration | **Rejected** |

---

## Supabase schema audit

**Production project:** `hyycomvcaqxxvyrfupes`

| Object | Required by code | Present | Status |
|--------|------------------|---------|--------|
| `studio_governed_generation_jobs` | async governed generation | Yes | **Verified** |
| `studio_os_org_memberships` | authorization | Yes | **Verified** |
| `studio_os_workspace_state` | workspace prefs | Yes | **Verified** |
| `studio_asset_registry` (migration name) | asset registry | Yes (via `studio_asset_registry_v1`) | **Verified** |
| `studio_creative_intelligence` | CIE | Yes | **Verified** |

**Migrations tracked:** 12 (includes `studio_governed_generation_jobs`, `studio_os_migration_history_reconcile`).  
**Missing migrations applied this sprint:** None required.

---

## Repair evidence

- `src/studio-os-core/scene-stack/verified-asset-production/salvageable-opaque.ts`
- `src/studio-os-core/scene-stack/verified-asset-production/structural-validation.ts` — defer transparent-margin rejection
- `src/studio-os-core/scene-stack/isolated-layer-quality.ts` — defer opaque REGENERATE for salvageable plates
- `src/studio-os-core/scene-stack/verified-asset-production/background-classification.ts` — architecture signals for FULL_SCENE_RERENDER
- `src/studio-os-core/creative-production/artifact-intent.ts` — intent-based validation routing
- `src/studio-os-core/generation-runtime/generation-parity-forensic.ts` — shared forensic envelope
- `src/components/admin/studio/experience-lab/GenerationParityDiagnosticPanel.tsx` — mobile diagnostics (`?compilerDiag=1`)

---

## Founder verification

Run Experience Lab validation render on mobile with `?compilerDiag=1`. Isolated layer should advance to **BACKGROUND_REMOVING** for opaque studio plates instead of immediate `QUALITY_REGENERATE_REQUIRED`. Export parity JSON from Generation Parity panel.
