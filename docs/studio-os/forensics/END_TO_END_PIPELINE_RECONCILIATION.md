# End-to-End Pipeline Reconciliation — Forensic Report

**Sprint:** P0 — “One Work Order, One Finished Room”  
**Report date:** 2026-07-12  
**Branch:** `master`  
**Classification:** Forensic reconciliation — **no repair implemented**  
**Production URL:** https://fsbw.vercel.app

---

## Executive summary

| Field | Value |
|-------|--------|
| **Verdict** | Pipeline reports terminal completion before Scene Stack layer assembly and viewport state agree. |
| **First proven divergence** | `computeRenderPipelineProgress` treats `compileReport.success` as terminal completion (`isComplete`, `progressPct: 100`) without requiring layer pipeline idle, layer count, or composite status. |
| **Primary category** | **B — Incorrect progress calculation** (with **A — Optimistic UI completion** and **N — Final preview desynchronization**) |
| **Repair implemented** | **No** — repair boundary documented; await founder approval. |
| **B0 Dispatch canary** | **Documented Fact** — four governed routes return `application/json` (401 `MISSING_TOKEN`); `studio-builder-generate` returns `traceId`. |
| **Authenticated Layer 1 E2E** | **Unknown** — agent environment cannot run founder-authenticated device render. |

---

## 1. End-to-end journey maps

### 1A. Creative Direction Studio (CDS room)

**Surface:** `/admin/studio/creative-direction` → `CreativeDirectionStudioRoom`  
**Department:** `creative-direction` · stations: `arrival`, `mood-wall`, `story-table`, etc.  
**Execution owner:** `useSceneStack` — **does not** subscribe to `runFullPipeline`.

```
User action (zone navigation / implicit stack use)
  → useSceneStack(departmentId, projectId, workspaceId)
  → ensureStation / generateLayer / compileWorldStation (manual or room-driven)
  → compileSceneStackLayerPrompt
  → withValidationEphemeralAuth
  → requestStudioBuilderGenerate
  → POST /api/admin/studio-builder-generate
  → api/_lib/creativeProduction/legacy-adapters.adaptLegacyBuilderRequest
  → executeGovernedGeneration → generateStudioBuilderAsset → FAL adapter
  → response normalization → saveSceneStackLayerRecord (local store)
  → void compileWorldStation (fire-and-forget per layer in generateLayer)
  → SceneStackViewport overlay (pipeline.layersComplete / phase)
  → NO CreativeStudioPipelineStatusBar (no Experience Lab runtime subscriber)
```

**Key files:**

| Stage | File | Function |
|-------|------|----------|
| UI room | `src/components/admin/studio-os/creative-direction-studio/CreativeDirectionStudioRoom.tsx` | `CreativeDirectionStudioRoom` |
| Scene stack hook | `src/hooks/useSceneStack.ts` | `ensureStation`, `generateLayer`, `compileStation` |
| Viewport overlay | `src/components/admin/studio-os/creative-direction-studio/SceneStackViewport.tsx` | `isBuilding`, pipeline HUD |
| API client | `src/services/studio/studioBuilder/api.ts` | `requestStudioBuilderGenerate` |
| Server gateway | `api/_lib/creativeProduction/generation-gateway.ts` | `executeGovernedGeneration` |
| World compile | `src/studio-os-core/scene-stack/world-compiler/compile-pipeline.ts` | `compileWorldStation` |

### 1B. Experience Engine path (Experience Lab validation runtime)

**Surface:** `/admin/studio/experience-lab` Mode 2 — Creative Intelligence  
**Binding (Layer 1 / screenshot B):** `frontal-slayer` · concept `a` → `creative-direction` / `arrival` / “Luxury beauty flagship — concierge production”  
**Execution owner:** `experience-lab-render-runtime.runFullPipeline` via `subscribeCompilerSession`.

```
User opens preview OR auto-run on subscribe
  → useCreativeStudioRenderPreview
  → subscribeCompilerSession(sessionKey, setSnapshot)
  → runFullPipeline(session) [auto if idle]
  → runExperienceLabValidationShellPipeline (shell: compile-spec → generate-shell → register-ephemeral)
  → driver.ensureStation (sequential generateLayer for pending layers, inner compileWorldStation)
  → driver.compileStation (second full compileWorldStation with onStageComplete callbacks)
  → compileReport.success → session.renderStatus = 'complete'
  → publishRuntimeEvent('RenderCompleted', { progressPct: 100 })
  → buildSnapshot → computeRenderPipelineProgress(compileSuccess: compileReport?.success)
  → CreativeStudioPipelineStatusBar ("Render complete", 100%)
  → SceneStackViewport (separate pipeline from snapshot.pipeline — layersComplete/phase)
```

**Key files:**

| Stage | File | Function |
|-------|------|----------|
| Runtime owner | `src/studio-os-core/experience-lab-runtime/experience-lab-render-runtime.ts` | `runFullPipeline`, `buildSnapshot`, `subscribeCompilerSession` |
| Progress derivation | `src/studio-os-core/creative-studio-preview/render-pipeline-progress.ts` | `computeRenderPipelineProgress` |
| Top status bar | `src/components/admin/studio/experience-lab/CreativeStudioPipelineStatusBar.tsx` | `isComplete` → "Render complete" |
| Preview shell | `src/components/admin/studio/experience-lab/CreativeStudioRenderPreview.tsx` | dual UI consumers |
| Driver bridge | `src/components/admin/studio/experience-lab/ExperienceLabRenderRuntimeProvider.tsx` | `registerSceneStackDriver` |
| Bindings | `src/studio-os-core/creative-studio-preview/render-bindings.ts` | `resolveCreativePreviewRenderBinding` |

**Note:** `/admin/studio/experience-engine` (`ExperienceEngineWorkspace`) is an executive atmosphere dashboard — **not** the governed render pipeline under test. Sprint “Experience Engine” maps to the **Experience Lab validation runtime + shared generation path** documented in `SHARED_GENERATION_PIPELINE_REGRESSION.md`.

---

## 2. Work order identity table

Canonical trace for Experience Lab validation run (`frontal-slayer` · `a` · `arrival` · `signature-landmark`):

| Subsystem | Identifier | Propagation | Mapping preserved? |
|-----------|------------|-------------|-------------------|
| User session | `previewSessionId` | `companyId:conceptId:departmentId:stationId:projectId` | **Yes** — single string |
| Runtime session | `compileRunId` | Created in `runFullPipeline` (`run-{ts}-{rand}`); passed in `previewCompileContext` | **Yes** — threaded to compile + generate |
| Investigation | `compilerInstanceId` | `createCompilerInstanceId()` | **Yes** — logging only |
| Client forensic | `traceId` | API response on governed routes | **Yes** — server-issued per request |
| Layer generate | `productionGroupId` | `scene-stack-{stationId}-{layerId}` | **Yes** — encodes station + layer |
| Layer record | `heroAssetId`, `packageId` | From `compileSceneStackLayerPrompt` | **Yes** |
| Shell ephemeral | `shellId` | `registerValidationEnvironmentShell` | **Yes** — updated via `updateActiveShellId` |
| Server governed | `providerRequestId` | Model orchestrator (when handler executes) | **Unknown** without authenticated run |
| Asset registry | `assetRegistryId` | Phase 1: **no auto-register** on layer save | **N/A** by design |
| Scene stack | `stationId` + `layerId` | `saveSceneStackLayerRecord` | **Yes** |

**Identity loss risk (Inference):** `generateLayer` fire-and-forget `compileWorldStation` can publish a **new** `compileReport` under the same `stationId` while `compileRunId` on the runtime session is unchanged — compile report owner is `compileReports[stationId]` only, not keyed by `compileRunId`.

---

## 3. Completion invariant report

Required before terminal “room finished” (Layer 1 `signature-landmark` focus):

| # | Invariant | Enforced? | Evidence |
|---|-----------|-----------|----------|
| 1 | Request created | Partial | `compileRunId` created in runtime; CDS path may lack compile run |
| 2 | Server handler reached | **Yes** (probe) | Production 401 JSON + `traceId` on `studio-builder-generate` |
| 3 | Governed generation authorized | Partial | `withValidationEphemeralAuth` client; server lazy auth |
| 4 | Generation started | Partial | Client `GENERATION_REQUEST_STARTED` in diag mode only |
| 5 | Provider returned valid result | **Unknown** | Requires authenticated production |
| 6 | Schema/format validation | Partial | `validateSceneLayerQuality` on client after response |
| 7 | Asset URL reachable | Partial | Quality guard checks URL |
| 8 | Asset normalized | Partial | gateway normalization |
| 9 | Asset registered | **No** (by design) | Comment in `generateLayer`: no auto registry |
| 10 | Correct org/station/stack/layer/run association | Partial | `previewCompileContext` when validation; report not keyed by run |
| 11 | Scene Stack accepted asset | Partial | `saveSceneStackLayerRecord` |
| 12 | Layer mount succeeded | **Weak** | `mount-*` stages succeed on **skip** without packages |
| 13 | Scene graph reflects mount | Partial | `buildSceneGraph` from records |
| 14 | Final preview shows mounted asset | **Not gated** | Top bar can show complete while overlay building |
| 15 | No stale/fallback mistaken for new | **Not enforced** | `forceGenerate`, prior `publicUrl` reuse paths exist |
| 16 | Client/backend agree | **No** | Dual progress systems |
| 17 | Completion only after all checks | **No** | `isComplete = compileSuccess` only |

---

## 4. Completion signal audit

| Signal | Source | Trigger | Evidence required | Optimistic? | Can fire without full mount? | UI consumer |
|--------|--------|---------|-------------------|-------------|------------------------------|-------------|
| `isComplete` | `render-pipeline-progress.ts:121` | `compileSuccess === true` | World compile report only | **Yes** | **Yes** | `CreativeStudioPipelineStatusBar` |
| `progressPct: 100` | `render-pipeline-progress.ts:131` | same | same | **Yes** | **Yes** | Status bar, aria progressbar |
| Step `done` (idx < stepIndex) | `render-pipeline-progress.ts:99` | step index advance | positional | **Yes** | **Yes** | Step list (green checks) |
| `RenderCompleted` event | `experience-lab-render-runtime.ts:658` | `compiled.report.success` | compile report | **Yes** | **Yes** | Runtime event bus |
| `renderStatus: 'complete'` | `experience-lab-render-runtime.ts:648` | compile success | compile report | **Yes** | **Yes** | Snapshot subscribers |
| `mount-landmark` stage success | `compile-pipeline.ts:350` | zero packages → "Stage skipped" | string return, not asset | **Yes** | **Yes** | Stage list / compile report |
| `Landmark Mounted™` line | `compilation-report.ts:85` | package exists in input | package metadata | Partial | Can be stale package | Compile headline |
| `layersComplete/layersTotal` | `useSceneStack.ts:199` | `publicUrl` on layer views | layer records | No | Accurate for stack | `SceneStackViewport` HUD |
| `isBuilding` (viewport) | `SceneStackViewport.tsx:128` | `status === 'building'` OR `pipeline.phase !== 'idle'` | stack pipeline | No | — | Inner overlay |
| `isBuilding` (runtime snapshot) | `experience-lab-render-runtime.ts:287` | OR of progress + layerPipeline + status | mixed | Partial | Can disagree with viewport | `CreativeStudioRenderPreview` |

**Cosmetic completion pattern (Proven in code):** Top pipeline bar displays **Render complete / 100%** from World Compiler `compileReport.success` while viewport overlay can still show **Generating {layer}… N/8 layers** because overlay reads `snapshot.pipeline` (Scene Stack), not `renderPipelineProgress.isComplete`.

---

## 5. Production event ledgers

### 5A. Unauthenticated production probe (2026-07-12)

| T+ms | Subsystem | Function | Event | trace/work-order | Success | Evidence |
|------|-----------|----------|-------|------------------|---------|----------|
| 0 | curl | POST ephemeral-auth | request | — | yes | HTTP 401 JSON |
| 0 | API | handler | `MISSING_TOKEN` | — | expected | not pre-handler fail |
| 0 | curl | POST studio-builder-generate | request | — | yes | HTTP 401 JSON |
| 0 | API | handler | `traceId: route-1783871641171-ovb1sqyq` | traceId issued | expected | handler executed |

**Documented Fact:** B0 pre-handler `FUNCTION_INVOCATION_FAILED` plain-text failure is **not** reproduced on these probes post-bundle repair.

### 5B. Experience Lab validation run — code-traced ledger (Inference)

*Synthetic ledger from static analysis; authenticated timings **Unknown**.*

| T+ms | Subsystem | Function | Event | compileRunId | Actual vs expected |
|------|-----------|----------|-------|--------------|------------------|
| 0 | UI | `subscribeCompilerSession` | subscribe | `run-*` created | expected |
| 50 | Runtime | `runFullPipeline` | entered | same | expected |
| 200 | Shell | `runExperienceLabValidationShellPipeline` | compile-spec | same | shell phase |
| 5000 | Shell | generate-shell | `requestStudioBuilderGenerate` | same | **Unknown** auth/gen |
| 8000 | Shell | register-ephemeral | shell registered | shellId set | expected |
| 8100 | Stack | `ensureStation` | layer loop starts | same | layers 0/N |
| * | Stack | `generateLayer` | signature-landmark | same | **Unknown** if 500 |
| * | Runtime | `compileStation` | compileWorldStation | same | may succeed with skips |
| * | Progress | `computeRenderPipelineProgress` | isComplete=true | same | **DIVERGENCE if layers < N** |
| * | Viewport | `SceneStackViewport` | overlay building | same | **contradicts top bar** |

### 5C. Creative Direction Studio — code-traced ledger (Inference)

CDS does not auto-enter `runFullPipeline`. Layer generation only when room triggers `ensureStation` / `generateLayer` / user regen.

| T+ms | Subsystem | Event | Identity | Note |
|------|-----------|-------|----------|------|
| 0 | CDS | mount room | department project | no compileRunId unless diag |
| * | Stack | generateLayer | station:layer key | same API path |
| * | Viewport | pipeline HUD only | layersComplete | no top “Render complete” bar |

---

## 6. Reconciliation matrix

### Screenshot A (96% / Render complete vs overlay Generating Lighting 1/8)

| Stage | UI top bar | Client runtime | Server | Registry | Scene Stack | Visible |
|-------|------------|----------------|--------|----------|-------------|---------|
| World compile | Complete 100% | `renderStatus: complete` | **Unknown** | N/A | compile report success | asset may show |
| Layer assembly | (bar: complete) | `pipeline.phase` generating | — | — | `layersComplete: 1`, total 8 | overlay active |
| **First disagreement** | **Complete** | **isBuilding true** | — | — | **1/8 layers** | **partial scene** |

**Classification:** Separate state machines — `WORLD_COMPILER_OWNERSHIP.progressPct` vs `currentLayer` (see `ownership-report.ts`).

### Screenshot B (22% Mount layer stack, shell steps green, 0/8 layers, dark viewport)

| Stage | UI top bar | Client runtime | Scene Stack | Visible |
|-------|------------|----------------|-------------|---------|
| Shell stages | done (optimistic idx) | shell phases complete | — | dark |
| Mount layer stack | active step 4/15 | `ensureStationActive` | 0/8 `publicUrl` | Queued Shell overlay |
| **First disagreement** | shell steps **green** | ensureStation in progress | **no layers mounted** | **stuck** |

**Classification:** Optimistic step marking (`idx < stepIndex` → `done`) before `ensureStation` finishes layer generation.

---

## 7. Creative Studio vs Experience Engine diff

| Dimension | CDS room | Experience Lab runtime |
|-----------|----------|------------------------|
| Entry | Room mount | `subscribeCompilerSession` auto-run |
| Pipeline owner | `useSceneStack` only | `runFullPipeline` + driver |
| Top progress bar | **Absent** | `CreativeStudioPipelineStatusBar` |
| Viewport overlay | `useSceneStack` pipeline | snapshot.pipeline (same driver) |
| Shell pipeline | Manual / partial | `runExperienceLabValidationShellPipeline` always |
| compileRunId | Optional (diag) | Always created |
| Completion UI | Overlay only | **Dual** bar + overlay |
| Shared API | Same `studio-builder-generate` | Same |
| Shared compile | Same `compileWorldStation` | Same |

**Conclusion:** Shared generation infrastructure; **divergence is UI/state ownership**, not separate endpoints. Experience Lab progresses further (shell + compile orchestration) but fails the same layer-generation boundary when Dispatch/generation fails.

---

## 8. First false success / lost handoff

### Primary boundary (proven)

| Field | Detail |
|-------|--------|
| **Category** | **B — Incorrect progress calculation** |
| **File** | `src/studio-os-core/creative-studio-preview/render-pipeline-progress.ts` |
| **Function** | `computeRenderPipelineProgress` |
| **Lines** | 121 (`isComplete`), 131 (`progressPct: 100`), 99 (`idx < stepIndex` → `done`) |
| **Event** | `compileReport.success === true` → terminal completion |
| **Expected contract** | Terminal completion requires Scene Stack layer pipeline idle, full layer count, composite `ready`, and confirmed mount |
| **Actual contract** | Terminal completion = World Compiler report success only |
| **Downstream** | `runFullPipeline` sets `renderStatus: 'complete'` and emits `RenderCompleted` at same boundary |

### Secondary boundary (compile stage optimism)

| Field | Detail |
|-------|--------|
| **Category** | **I — Scene Stack state transition failure** (stage-level) |
| **File** | `src/studio-os-core/scene-stack/world-compiler/compile-pipeline.ts` |
| **Function** | `runStage` / mount loop |
| **Event** | `mounted.length === 0` → `"Stage skipped"` with `success: true` |
| **Effect** | `compileReport.success` can be true without `signature-landmark` mounted |

### Partial-success loop explanation

1. Shell pipeline or compile stages report success (or optimistic UI marks steps done).  
2. Top bar hits **Render complete / 100%**.  
3. Scene Stack layer generation still queued, failed, or incomplete → overlay shows **0/8** or **Generating …**.  
4. Targeted repair fixes one boundary (e.g. pre-handler bundle) → handler executes but **completion semantics unchanged** → founder still sees contradictory UI.  
5. Retry triggers new `compileRunId` while `compileReports[stationId]` may reflect stale or fire-and-forget compile → loop continues.

---

## 9. Repair boundary

**Forensic sprint (fedd0270f):** Documented only — await founder approval.

**Repair sprint (shipped):** Completion authority gate implemented.

| Change | File | Detail |
|--------|------|--------|
| `evaluateRenderTerminalComplete` | `render-pipeline-progress.ts` | Final Inspection gate — requires compile success, layer pipeline idle, `layersComplete === layersTotal`, `compositeStatus === 'ready'`, no queue/generating |
| `computeRenderPipelineProgress` | same | `isComplete` and 100% keyed to terminal gate only; `complete` step pending until gate passes |
| `buildSnapshot` inputs | `experience-lab-render-runtime.ts` | Passes `pipelinePhase`, `layersComplete/Total`, `compositeStatus`, `pipelineRunning` |
| `runFullPipeline` | same | Defers `renderStatus: complete` and `RenderCompleted` until terminal gate passes |
| `notifySnapshot` | same | Promotes to complete when layers finish after compile |
| `isBuilding` | same | Stays true when compile succeeded but terminal gate not passed |

**Not changed:** Scene Stack, World Compiler, provider, FAL, registry, auth.

---

## 13. Repair record (2026-07-12)

**Classification:** Repair — completion authority only.

**Invariant gate:** `evaluateRenderTerminalComplete` — all of: `compileSuccess`, `!layerPipelineActive`, `!ensureStationActive`, `!pipelineRunning`, `pipelinePhase === idle`, `layersComplete === layersTotal > 0`, `compositeStatus === ready`.

**Regression tests:** 14 in `render-pipeline-progress.invariants.test.ts`.

**Production verification:** Unit tests pass; authenticated device verification **Unknown**.

---

## 10. Test report

| Suite | Result |
|-------|--------|
| `render-pipeline-progress.invariants.test.ts` | 14 pass — authoritative completion gate |
| `server-bundle-boundary.test.ts` | Existing — bundle boundary |
| `layer1-generation-diagnostics.test.ts` | Existing — shared adapter path |
| `npm run build` | Run at commit time |

---

## 11. Operational state

| System | State |
|--------|--------|
| B0 Dispatch JSON | **Production** — probe verified JSON 401 |
| B1 Layer 1 authenticated | **Unknown** — founder device pending |
| Creative Studio (CDS) | **In Progress** — not restored |
| Completion authority gate | **In Progress** — repair shipped; device verify pending |
| Experience Lab runtime | **In Progress** — UI authority repaired; E2E unverified |
| Incident resolved | **No** |

---

## 12. Git report

Filled at commit time in `CURRENT_HANDOFF.md` and CONCLUSION block.

---

## Labels

- **Documented Fact:** Production probes return JSON; dual progress ownership documented in `ownership-report.ts`; shared API path in `SHARED_GENERATION_PIPELINE_REGRESSION.md`.
- **Inference:** Screenshot reconciliation from code structure; synthetic event ledger timings.
- **Unknown:** Authenticated Layer 1 provider success; registry state in production for a specific run.
