# Shell Recovery State Machine Audit™

**Status:** Forensic audit complete — **no production fix applied** (per sprint mandate).  
**Date:** 2026-07-10  
**Scope:** Experience Lab validation render path — why the pipeline reports shell recovery but never advances past **Load Shell™**.

Related: `experience-lab-phase-3-render-pipeline.md`, `world-compiler-reset-investigation.md`, `scripts/verify-experience-lab-shell-resolution.mjs`.

---

## Executive summary

The compiler **does** detect a missing shell, **does** run the validation shell recovery pipeline, and **does** register an ephemeral shell. Recovery messaging can show **“Ephemeral validation shell registered for this preview session.”** while **`load-shell` still fails** and the runtime **never transitions to `ready`**.

**Root cause class:** A **resolution split** between two lookup paths:

| Lookup | Function | Scope | Used by |
|--------|----------|-------|---------|
| Session registry | `getValidationEnvironmentShell(previewSessionId)` | Session id only | `diagnoseShellResolution` → recovery message |
| Station overlay | `getEphemeralLayerRecord(sessionId, dept, project, station, layerId)` | Full scope key | `getSceneStackLayerRecord` → `resolveShellLockState` → `load-shell` |

When the session registry succeeds but the station overlay fails, diagnostics report recovery while **`resolveShellLockState().shellUrl` remains `null`**. `load-shell` throws `[SHELL_RECORD_MISSING]`, `report.failedStage` stays `'load-shell'`, and the Experience Lab runtime sets `shellPipelinePhase = 'failed'`.

**The exact transition that never occurs on the success path:**

```text
load-shell (stage success: true)
  → report.success === true
  → shellPipelinePhase: 'ready'
  → renderPipelineProgress.currentStepId: 'complete'
```

---

## Eight forensic questions

### 1. Is the ephemeral shell actually generated?

**Yes — when the validation shell pipeline completes `generate-shell` successfully.**

`runExperienceLabValidationShellPipeline()` builds a recipe, calls `generateShellPublicUrl()` (Studio Builder API, then `validation-shell-canvas` fallback), and only proceeds to registration when `generated.publicUrl` exists.

Source: `src/studio-os-core/creative-studio-preview/validation-shell-pipeline.ts` (stages `generate-shell` → `register-ephemeral`).

---

### 2. Is it registered?

**Yes — on the `register-ephemeral` stage.**

`registerValidationEnvironmentShell(shell)` writes a session entry and a station-scoped layer overlay for `environment-shell`, then dispatches `studio-os-scene-stack-hydrated`.

Source: `src/studio-os-core/scene-stack/ephemeral-validation-registry.ts`.

Verified offline: `npx tsx scripts/verify-experience-lab-shell-resolution.mjs` (register + lookup passes).

---

### 3. Does it receive an executable shell record?

**Conditional — only when `getSceneStackLayerRecord()` resolves the ephemeral overlay at compile time.**

`recipeToLayerRecord()` produces an executable record shape: `status: 'draft_ready'`, `publicUrl` set, `layerId: 'environment-shell'`.

Resolution requires **all** of:

1. `isExperienceLabValidationRender()` === `true` (global singleton in `validation-render.ts`)
2. `getValidationPreviewSession()` === shell’s `previewSessionId`
3. Overlay key match: `{previewSessionId}:{departmentId}:{projectId}:{stationId}:environment-shell`

`getSceneStackLayerRecord()` does **not** accept a per-call `validationMode` flag — it only checks the global validation mode flag.

When overlay lookup fails, `resolveShellLockState()` returns `resolution: 'missing-record'`, `shellUrl: null` — **no executable shell for World Compiler** even if `getValidationEnvironmentShell()` returns the shell object.

Sources:

- `src/studio-os-core/scene-stack/store.ts` — `getSceneStackLayerRecord`
- `src/studio-os-core/scene-stack/world-compiler/immutable-shell.ts` — `resolveShellLockState`
- `src/studio-os-core/creative-studio-preview/environment-shell.ts` — `recipeToLayerRecord`

---

### 4. Does `compileWorldStation()` continue after shell recovery?

**Yes — the function does not abort on `load-shell` failure.**

`runStage()` catches errors, returns `{ success: false }`, and the pipeline **continues** through `lock-shell`, `mount-landmark`, …, `render-final-scene`.

However, `buildCompilationReport()` sets `success = stages.every(s => s.success) && validation.passed`. A failed `load-shell` permanently marks the report failed regardless of later stages.

Source: `src/studio-os-core/scene-stack/world-compiler/compile-pipeline.ts`, `compilation-report.ts`.

---

### 5. Is the compiler state transitioning from LOAD_SHELL to MOUNT_LANDMARK, or stuck in LOAD_SHELL?

**Stuck on the success path. Stage bodies may still run; semantic progression does not.**

| Layer | LOAD_SHELL → MOUNT_LANDMARK |
|-------|----------------------------|
| **World Compiler stages** | `mount-landmark` `runStage` may execute after failed `load-shell`, often with “Stage skipped — no mount-landmark components yet.” |
| **Compilation report** | `failedStage` = `'load-shell'`; `success` = `false` |
| **Runtime phase** | `shellPipelinePhase` → `'failed'` (not `'world-compile'` completion → `'ready'`) |
| **UI progress** | `computeRenderPipelineProgress` pins `currentStepId` to `'load-shell'` when `compileFailedStage === 'load-shell'` |

**Effective state: remains LOAD_SHELL** from the product/runtime perspective.

---

### 6. Does the recovery callback return early?

**No — the shell recovery pipeline does not short-circuit the orchestrator on success.**

`runExperienceLabValidationShellPipeline()` returns `{ ok: true, stage: 'complete' }` after registration.

`runFullPipeline()` in `experience-lab-render-runtime.ts`:

- Returns early only if `!shellResult.ok` (shell pipeline failure)
- Returns early after compile if `!compiled.report.success` (line ~455) — **this is the post-recovery gate that blocks progression**

The recovery callback (`onStageChange`) only updates phase snapshots; it does not `return` from `runFullPipeline`.

---

### 7. Is the stage controller waiting for a shell status that is never updated?

**Yes — multiple controllers diverge.**

| Signal | Updates when overlay resolves? | Can show “recovered” without mount? |
|--------|-------------------------------|-------------------------------------|
| `shellDiagnostic.recoveryAction` | N/A | **Yes** — uses `getValidationEnvironmentShell()` only |
| `shellReady` (`shellIsMountReady`) | Requires `lock.shellUrl && lock.locked` | Stays `false` if overlay fails |
| `compileReport.failedStage` | Set on first failed stage | Stays `'load-shell'` |
| `renderPipelineProgress.currentStepId` | Driven by `compileFailedStage` | Stays `'load-shell'` |
| `shellPipelinePhase` | Set `'failed'` on `!report.success` | Never reaches `'ready'` |

**Diagnostic bug (forensic, not fixed):** `diagnoseShellResolution()` clears `failureReason` when `ephemeralShell` exists **without** checking whether `resolveShellLockState()` can mount that shell at the current station scope.

Source: `src/studio-os-core/scene-stack/shell-diagnostics.ts` lines 51–53.

---

### 8. Complete compiler state transition diagram

Legend:

- **Solid arrow** — transition observed in code on happy path
- **Dashed arrow** — stage executes but does not advance success semantics
- **❌** — transition that **never occurs** in the failure mode under audit

```text
BOOT
 │  subscribeCompilerSession → ensureSessionState
 │    bumpValidationMode() · setValidationPreviewSession()
 │    runFullPipeline() (unless diagnostic auto-run disabled)
 ▼
COMPILE_PREVIEW_SPEC
 │  buildEnvironmentShellRecipe
 ▼
GENERATE_SHELL
 │  studio-builder API → preview-canvas fallback
 ▼
REGISTER_EPHEMERAL
 │  registerValidationEnvironmentShell(shell)
 │  [diagnostic recovery message can show success here]
 ▼
ENSURE_STATION
 │  skipEnvironmentShell: true — other layers only
 ▼
WORLD_COMPILE (runtime shellPipelinePhase)
 │  driver.compileStation → compileWorldStation()
 ▼
LOAD_SHELL
 │  resolveShellLockState() — single resolve at compile start
 │  if !shellLock.shellUrl → throw [SHELL_RECORD_MISSING|SHELL_URL_MISSING]
 │
 ├─ success: true ──────────────────────────────┐
 │                                              │
 │  ❌ BLOCKED PATH (overlay resolution fail)   │  HAPPY PATH
 │                                              ▼
 │                                         LOCK_SHELL
 │                                              ▼
 │                                         MOUNT_LANDMARK
 │                                              ▼
 │                                         MOUNT_FURNITURE
 │                                              ▼
 │                                         APPLY_MATERIALS
 │                                              ▼
 │                                         CALCULATE_LIGHTING
 │                                              ▼
 │                                         APPLY_ATMOSPHERE
 │                                              ▼
 │                                         APPLY_MOTION
 │                                              ▼
 │                                         BAKE_REFLECTIONS
 │                                              ▼
 │                                         RENDER_FINAL_SCENE
 │                                              ▼
 │                                         report.success === true
 │                                              ▼
 │                                         shellPipelinePhase: ready
 │                                              ▼
 │                                         UI: complete
 │
 ├─ success: false (caught, pipeline continues)
 │       report.failedStage = 'load-shell'
 │       report.success = false
 ▼
LOCK_SHELL … RENDER_FINAL_SCENE (dashed — non-authoritative)
 │
 ▼
RUNTIME_GATE: !compiled.report.success
 │  shellPipelinePhase = 'failed'
 │  renderStatus = 'failed'
 │  return early — never reaches 'ready'
 ▼
UI_PINNED: currentStepId = 'load-shell'
```

### Highlighted missing transition

```text
LOAD_SHELL (success: true)
  ❌→  report.success === true
         ❌→  shellPipelinePhase: 'ready'
                ❌→  MOUNT_LANDMARK (as a completed pipeline step in UI/runtime)
```

---

## Contributing failure modes (ranked)

### F1 — Registry vs overlay resolution split (primary)

`getValidationEnvironmentShell(sessionId)` succeeds → recovery text shown.  
`getEphemeralLayerRecord(sessionId, dept, project, station, 'environment-shell')` fails → `load-shell` fails.

Typical triggers:

- **Global validation session race (H3):** Multiple `CreativeStudioRenderPreview` instances overwrite `activePreviewSessionId`; ephemeral shell registered under session A while compile reads session B.
- **Scope key mismatch:** `departmentId`, `projectId`, or `stationId` at compile time ≠ values baked into shell recipe overlay key (e.g. `projectId` drift from `useDepartmentVerticalSlice` mid-run).
- **Validation context off:** `isExperienceLabValidationRender()` false during `getSceneStackLayerRecord` even when `validationMode: true` is passed to `resolveShellLockState` (overlay path skipped).

### F2 — Post-compile runtime gate

Even when later World Compiler stages run, `experience-lab-render-runtime.ts` returns early when `!compiled.report.success`, forcing `shellPipelinePhase = 'failed'`. The UI treats the run as terminal at Load Shell.

### F3 — forceRegenerate invalidation loop (H4)

Every auto-run uses `forceRegenerate: true` → `clearValidationPreviewSession` at pipeline start. A restart loop can register then invalidate shells between compile attempts, producing intermittent `missing-record` at `load-shell`.

### F4 — Misleading recovery UX

`diagnoseShellResolution` reports recovery complete when session-level ephemeral exists, independent of `shellIsMountReady()`. Operators see recovery guidance while progress remains on Load Shell.

---

## Module ownership map

| Concern | Owner |
|---------|-------|
| Shell generation | `validation-shell-pipeline.ts` |
| Ephemeral registration | `ephemeral-validation-registry.ts` |
| Layer record bridge | `store.ts` → `getSceneStackLayerRecord` |
| Shell lock / load-shell gate | `immutable-shell.ts` + `compile-pipeline.ts` |
| Recovery messaging | `shell-diagnostics.ts` |
| Pipeline orchestration | `experience-lab-render-runtime.ts` |
| UI step index | `render-pipeline-progress.ts` |
| Validation context singleton | `validation-render.ts` |

---

## Verification performed

| Check | Result |
|-------|--------|
| `npx tsx scripts/verify-experience-lab-shell-resolution.mjs` | **9/9 passed** (recipe + ephemeral register/lookup) |
| `npm run build` (`tsc --noEmit`) | **Fails** on pre-existing `vitest` module resolution in `*.test.ts` files — unrelated to this audit |

---

## Absolute rules (sprint mandate)

- **No patch** applied
- **No retries** added
- **No fabricated shell records**
- Forensic documentation only

---

## Smallest repair directions (NOT APPLIED — for future sprint)

1. Unify recovery diagnostics with `shellIsMountReady()` — do not claim recovery until overlay resolves.
2. Per-instance validation session (not global `activePreviewSessionId`) when compare mode renders multiple previews.
3. Pass `validationMode` into `getSceneStackLayerRecord` or resolve ephemeral using explicit `previewSessionId` from compile options.
4. Single compile gate: defer `compileWorldStation` until `shellIsMountReady()` is true post-registration.

Enforce: **ONE RUN · ONE RUN ID · ONE SHELL RESOLUTION PATH · ONE TERMINAL RESULT**
