# LOAD_SHELL Stall — Evidence-Only Diagnostic Protocol

**Status:** Instrumentation deployed — **no production repair applied**  
**Date:** 2026-07-10  
**Prior analysis:** `LOAD_SHELL_STALL_FORENSIC.md` (hypothesis-ranked; not yet device-proven)

---

## Mandate (this sprint)

- Add observe-only instrumentation at every relevant boundary
- Classify stall **only from captured evidence** (RC-STALL-1 … RC-STALL-4)
- **Forbidden:** runtime repair, compile ownership changes, new context threading, progress state changes, retries/fallbacks/timeouts as fixes, AUTH_REQUIRED resolution

---

## Device reproduction steps

### Prerequisites

1. Deployed build includes stall evidence instrumentation (post `345231e67` + evidence sprint commit).
2. Experience Lab validation render route open (Creative Studio preview with World Compiler pipeline).
3. Same browser session for Experience Lab **and** investigation export (sessionStorage holds events).

### Reproduce stall

1. Open Experience Lab for the failing company/concept/station (compare mode if that is the failing scenario).
2. Allow the pipeline to run without manual retry until **Step stalled** appears (~90s on Load Shell with alive heartbeat).
3. **Do not refresh** before export (events live in `sessionStorage` + memory).

### Export evidence (same tab)

**Option A — Investigation route**

1. Navigate to [`/__world-compiler-investigation`](https://fsbw.vercel.app/__world-compiler-investigation) in the **same tab** (or open in split view before stall completes).
2. Click **Refresh report**.
3. Click **Copy JSON export** or **Download JSON** — send full file to founder/agent.
4. Optional: **Copy Markdown export** for human-readable summary.

**Option B — Console**

```javascript
window.__WC_STALL_EVIDENCE__?.buildStallEvidenceReport()
// or
copy(JSON.stringify(window.__WC_STALL_EVIDENCE__?.buildStallEvidenceReport(), null, 2))
```

**Option C — Raw events**

```javascript
copy(JSON.stringify(window.__WC_INVESTIGATION__, null, 2))
```

### Black Box browser comparison (parallel)

For each browser mode, **before or after** stall reproduction:

| Mode | Label on flight recorder |
|------|--------------------------|
| Safari normal tab | `safari-normal` |
| Safari private tab | `safari-private` |
| Chrome normal tab | `chrome-normal` |
| Chrome incognito | `chrome-incognito` |

1. Open [`/__studio-os-flight-recorder`](https://fsbw.vercel.app/__studio-os-flight-recorder)
2. Capture env fingerprint with label
3. Compare on [`/__studio-os-session-report`](https://fsbw.vercel.app/__studio-os-session-report)

Compare: bootstrap completion, route entry, service-worker controller, Cache Storage, Studio OS localStorage keys, sessionStorage, IndexedDB stores/versions, persisted registry, `previewSessionId`, `compileRunId`, first abnormal event, last successful event.

**Note:** Normal-tab vs private-tab acceptance gate remains **separate** from load-shell stall classification.

---

## Instrumentation map

### Pipeline ownership (logged)

| Signal | Event type | Source |
|--------|------------|--------|
| `previewSessionId`, `compileRunId`, station/project/concept | `PIPELINE_OWNERSHIP`, lifecycle detail | `runFullPipeline` |
| `pipelineRunning` set/cleared | `PIPELINE_RUNNING_SET_TRUE`, `PIPELINE_RUNNING_CLEARED` | `runFullPipeline` |
| Compile owner (`runFullPipeline`, `ensureStation`, `compileStation`, `compileWorldStation`, fire-and-forget) | lifecycle + `compileOwner` in detail | runtime + `useSceneStack` |
| Duplicate invocation | `DUPLICATE_COMPILE_INVOCATION` | `recordDuplicateCompileInvocation` |

### Compiler lifecycle

| Boundary | Lifecycle event |
|----------|-----------------|
| `runFullPipeline` enter/exit | `RUN_FULL_PIPELINE_ENTERED`, `RUN_FULL_PIPELINE_EXIT_SUCCESS`, `RUN_FULL_PIPELINE_UNHANDLED_REJECTION` |
| `ensureStation` | `ENSURE_STATION_ENTERED`, `ENSURE_STATION_COMPLETED`, `ENSURE_STATION_FAILED` |
| `compileStation` | `COMPILE_STATION_ENTERED`, `COMPILE_STATION_COMPLETED`, `COMPILE_STATION_REJECTED` |
| `compileWorldStation` | `COMPILE_WORLD_STATION_ENTERED`, `COMPILE_WORLD_STATION_COMPLETED`, `COMPILE_WORLD_STATION_GATE_THROW` |
| Each `runStage` | `COMPILE_STAGE_ENTER`, `COMPILE_STAGE_COMPLETE`, `COMPILE_FAILED` (existing) |
| `onStageComplete` | `ON_STAGE_COMPLETE_PUBLISHED` |
| `setCompileReports` | `COMPILE_REPORT_PUBLISHED` |
| Stall 90s | `STALL_THRESHOLD_REACHED` + pending async markers |

### Load-shell milestones (M1–M7)

| ID | Meaning | Where |
|----|---------|--------|
| M1 | load-shell stage entered | start of load-shell execute |
| M2 | previewSessionId gate evaluated | before compile stages |
| M3 | registry lookup started | load-shell execute |
| M4 | shell record resolved/rejected | after `resolveShellLockState` |
| M5 | validation/mount-readiness | `verifyEphemeralShellMount` |
| M6 | onStageComplete path | after successful load-shell stage |
| M7 | transition to lock-shell | lock-shell `runStage` enter |

Each milestone records: timestamp, elapsed ms, `previewSessionId`, `compileRunId`, shell/registry fields, milestone state (`success` | `failure` | `skipped` | `pending`).

### Async boundaries (true async only)

Tracked with `ASYNC_BOUNDARY_START` / `ASYNC_BOUNDARY_END` / `ASYNC_BOUNDARY_STALL`:

- `waitForSceneStackDriver`
- `runExperienceLabValidationShellPipeline`
- `runFullPipeline.ensureStation` → inner `ensureStation`, `generateLayer` API, inner `compileWorldStation`
- `runFullPipeline.compileStation` → `compileWorldStation`

**Not tracked as async:** synchronous `runStage` execute bodies (including load-shell M1–M5).

### UI vs compiler sync

`UI_COMPILER_SYNC` snapshots at:

- `ensure-station` / `world-compile` phases
- First stall threshold per `compileRunId`

Fields: `session.currentStage`, `compileReport.stages`, UI `currentStepId`, `pipelineRunning`, `stepStallMs`, `synchronized`, `divergenceReason`.

---

## Stall classification rules (proof-based)

| ID | Proof required |
|----|----------------|
| **RC-STALL-1** | No `COMPILE_STAGE_ENTER load-shell` / M1; and (`COMPILE_STATION_ENTERED` or `COMPILE_WORLD_STATION_ENTERED` absent OR `COMPILE_WORLD_STATION_GATE_THROW` OR `RUN_FULL_PIPELINE_UNHANDLED_REJECTION` at compileStation) |
| **RC-STALL-2** | `COMPILE_STAGE_COMPLETE load-shell` and/or M6–M7 present; `UI_COMPILER_SYNC.synchronized === false`; often missing `COMPILE_REPORT_PUBLISHED` for authoritative compileStation |
| **RC-STALL-3** | `ENSURE_STATION_ENTERED` without `ENSURE_STATION_COMPLETED`; pending `ensureStation` async at stall; UI shows `load-shell` while ensure-station active |
| **RC-STALL-4** | `DUPLICATE_COMPILE_INVOCATION` + multiple load-shell enters for same run |
| **AUTH_REQUIRED (separate)** | Generation failure / `AUTH_REQUIRED` in ensure-station path — **not** load-shell body; may present as RC-STALL-3 |

Classifier: `classifyLoadShellStall()` in `stall-classifier.ts` — applied in export report.

---

## Deliverable template (fill after device capture)

### Evidence timeline

(Paste `pipelineLifecycleEvents` + M1–M7 from JSON export)

### Last confirmed successful event

From export: `stallClassification.lastSuccessfulEvent`

### First missing / failed / permanently pending event

From export: `stallClassification.firstMissingOrFailedEvent` + `asyncBoundaries.open`

### Compiler state at stall

- `activeCompileRun`
- Last `COMPILE_STAGE_*` for active `compileRunId`
- M1–M7 reached / missing lists

### UI state at stall

Last `UI_COMPILER_SYNC` snapshot: `currentStepId`, `sessionCurrentStage`, `compileReportStages`, `isStalled`, `divergenceReason`

### Session / compile ownership

`PIPELINE_OWNERSHIP` + lifecycle events with `compileOwner`

### Normal vs private tab comparison

From Black Box session report env diff (attach JSON)

### Confirmed root-cause classification

`stallClassification.classification` + `confidence` + `proof[]`

### Affected files (by classification)

| Classification | Primary files |
|----------------|---------------|
| RC-STALL-1 | `experience-lab-render-runtime.ts`, `compile-pipeline.ts`, `useSceneStack.ts` |
| RC-STALL-2 | `render-pipeline-progress.ts`, `useSceneStack.ts`, `experience-lab-render-runtime.ts` |
| RC-STALL-3 | `useSceneStack.ts` ensureStation/generateLayer, `studioBuilder/api.ts` |
| RC-STALL-4 | `useSceneStack.ts` ensureStation + fire-and-forget compile |

### Smallest evidence-supported repair

Document **only after** classification is `proven` on device — see `LOAD_SHELL_STALL_FORENSIC.md` P1–P3 (still **not applied**).

### Confirmation

- [ ] No P1–P3 production repair in this sprint
- [ ] Instrumentation only
- [ ] AUTH_REQUIRED not resolved

---

## Files (evidence sprint)

| File | Role |
|------|------|
| `stall-evidence.ts` | Milestones, async boundaries, UI sync, ownership |
| `stall-classifier.ts` | RC-STALL-1…4 proof rules |
| `stall-evidence-report.ts` | JSON/Markdown export bundle |
| `compile-pipeline.ts` | M1–M7, compileWorldStation lifecycle |
| `experience-lab-render-runtime.ts` | Pipeline lifecycle, async boundaries, stall threshold |
| `useSceneStack.ts` | ensureStation/compileStation boundaries, report publication |
| `world-compiler-investigation/page.tsx` | Copy/export UI |
| `types.ts` | New investigation event types |

---

## Next step

Founder reproduces stall → exports JSON from `/__world-compiler-investigation` → agent fills deliverable template → **approve proven root cause** → then and only then implement smallest repair from forensic doc.
