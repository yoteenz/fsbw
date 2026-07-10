# LOAD_SHELL Stall Forensic Analysis

**Status:** Forensic analysis complete — **no repair applied** (per sprint mandate).  
**Date:** 2026-07-10  
**Symptom:** Shell registration succeeds; UI enters **Load Shell**; step never advances; **Step stalled** after ~90s; heartbeat continues.

Related: `SHELL_RECOVERY_STATE_MACHINE_AUDIT.md`, `world-compiler-reset-investigation.md`, `KNOWN_BLOCKERS.md` (B1).

---

## Executive finding

**`load-shell` does not contain any async work, event listeners, hydration, or mount I/O.** The World Compiler stage completes in a single synchronous `runStage` callback (microseconds to low milliseconds). When the UI shows “Load Shell” indefinitely with **Step stalled**, the pipeline is **not blocked inside `runStage('load-shell')`** — it is blocked **before** the stage runs, **after** the stage throws without updating runtime terminal state, or **while the progress controller pins the step index without receiving updated `compileReport` / `lastStepChangeAt`**.

The user-visible “LOAD_SHELL never completes” is a **progress + runtime state machine stall**, not a pending promise inside the load-shell handler.

---

## 1. Execution timeline (authoritative path)

Legend: **sync** = no await; **async** = may wait.

```text
runFullPipeline (experience-lab-render-runtime.ts)
│
├─ [async] runExperienceLabValidationShellPipeline
│     ├─ sync  compile preview spec
│     ├─ [async] generateShellPublicUrl → requestStudioBuilderGenerate (may await API)
│     ├─ sync  registerValidationEnvironmentShell + verifyEphemeralShellMount
│     └─ onStageChange → lastStepChangeAt updated
│
├─ shellPipelinePhase = 'ensure-station'
├─ [async] driver.ensureStation (useSceneStack.ts)
│     ├─ for each layer (skip environment-shell):
│     │     └─ [async] generateLayer → requestStudioBuilderGenerate (NO timeout — can hang)
│     └─ [async] compileWorldStation (FULL pipeline including load-shell) — FIRST COMPILE
│           └─ setCompileReports (React state — after entire compile returns)
│
├─ shellPipelinePhase = 'world-compile'          ← UI defaults to load-shell HERE
├─ lastStepChangeAt = now
├─ notifySnapshot
│
└─ [async] driver.compileStation                  ← SECOND COMPILE (authoritative for runtime gate)
      └─ compileWorldStation (compile-pipeline.ts)
            ├─ sync  gate: throw if validationMode && !previewSessionId  ⚠️ BEFORE load-shell
            ├─ [async] runStage('load-shell') → execute() is 100% SYNC
            │     ├─ sync  resolveShellLockState
            │     ├─ sync  diagnoseShellResolution
            │     ├─ sync  getValidationEnvironmentShell
            │     ├─ sync  verifyEphemeralShellMount
            │     ├─ sync  assertPreviewSessionInvariant (throw → caught by runStage)
            │     ├─ sync  shellUrl check (throw → caught by runStage)
            │     └─ sync  emitStudioOsRuntimeEvent SHELL_CREATED / SHELL_RESOLVED
            ├─ sync  resolveShellLockState (again for lock-shell body)
            ├─ [async] runStage('lock-shell') → SYNC execute
            ├─ [async] runStage(mount-landmark … bake-reflections) → SYNC execute each
            ├─ sync  buildSceneGraph, validateCompiledScene
            ├─ [async] runStage('render-final-scene')
            └─ sync  buildCompilationReport
      └─ setCompileReports (only AFTER full compileWorldStation returns)
```

### Critical timing facts

| Fact | Evidence |
|------|----------|
| `load-shell` execute has **zero** `await` | `compile-pipeline.ts` lines 147–209 |
| No hydration listener in load-shell | `studio-os-scene-stack-hydrated` fired at register only; no reader in compile path |
| `lock-shell` runs immediately after `load-shell` in same tick | `stages.push(await runStage('load-shell'…)); stages.push(await runStage('lock-shell'…))` |
| UI step **Load Shell** is shown when `shellPhase === 'ready'` (world-compile) and `compileReport?.stages` is empty | `render-pipeline-progress.ts` lines 88–89 |
| `compileReport` in snapshot reads driver state updated **only after full compile** | `useSceneStack.ts` compileStation: `setCompileReports` after `await compileWorldStation` |
| Stall flag fires when `stepStallMs >= 90_000` and `isRunning` | `RENDER_PIPELINE_STALL_MS` + `experience-lab-render-runtime.ts` lines 204–208 |
| Heartbeat updates snapshots but **not** `lastStepChangeAt` | `runtime-heartbeat.ts` → `notifySnapshot` only |

---

## 2. LOAD_SHELL internal milestones (actual code — not aspirational)

There is **no** hydrate/mount/validate sub-pipeline inside World Compiler load-shell. Forensic mapping of **what actually runs**:

```text
LOAD_SHELL (runStage enter)
  → COMPILE_STAGE_ENTER logged
  → emit COMPILER_STAGE_CHANGED
  → [M1] resolveShellLockState(previewSessionId explicit)
  → [M2] diagnoseShellResolution (diagnostics only)
  → [M3] getValidationEnvironmentShell (if validation + session id)
  → [M4] assertPreviewSessionInvariant (may throw → caught)
  → [M5] verifyEphemeralShellMount (may throw → caught)
  → [M6] shellLock.shellUrl guard (may throw → caught)
  → [M7] emit SHELL_CREATED / SHELL_RESOLVED
  → return success string
  → COMPILE_STAGE_COMPLETE logged
  → onStageComplete('load-shell', true)   ← resets lastStepChangeAt IF called
  → (next) LOCK_SHELL runStage
```

**All M1–M7 are synchronous Map lookups and object checks.** None can remain pending.

### Recommended instrumentation (NOT APPLIED — for repair sprint)

Add `logCompilerEvent` at each `[M*]` with `compileRunId`, `previewSessionId`, `resolution`, `durationMs`. This will prove in device logs whether:

- `COMPILE_STAGE_ENTER load-shell` never appears → blocked **before** stage (gate throw / compileStation never invoked)
- `COMPILE_STAGE_ENTER` appears without `COMPILE_STAGE_COMPLETE` → impossible unless process crash (no async gap)
- `COMPILE_STAGE_COMPLETE load-shell` appears but UI still pinned → **progress controller / compileReport desync**

---

## 3. Dependency report (load-shell → lock-shell)

| Dependency | Starts | Completes | Async? | Resolves? | Rejects? | Can pend forever? |
|------------|--------|-----------|--------|-----------|----------|-------------------|
| `previewCompileContext.previewSessionId` | compileWorldStation entry | gate check | sync | yes if present | **throws before load-shell** if missing | no — immediate throw |
| `resolveShellLockState` | M1 | same tick | sync | yes / null shellUrl | via M6 throw | **no** |
| `getValidationEnvironmentShell` | M3 | same tick | sync | yes / null | no | **no** |
| `verifyEphemeralShellMount` | M5 | same tick | sync | ok / not ok | throw in M5 | **no** |
| `runStage` wrapper | stage enter | after execute | await on sync fn | always | catch → failed stage | **no** |
| `onStageComplete` callback | after stage | same tick | sync | always if stage runs | n/a | **no** |
| `driver.getStationCompileReport` (UI) | buildSnapshot | reads React state | n/a | stale until compile ends | n/a | **UI appears stuck** |
| `requestStudioBuilderGenerate` (ensureStation) | before world-compile | API response | **async** | ok / error | network error | **yes — no timeout** (but UI step = ensure-station, not load-shell) |

**First operation that can remain pending in the full pipeline (not inside load-shell):** `await requestStudioBuilderGenerate` during `ensureStation` → Layer 1 generation (B1 `AUTH_REQUIRED` or hung network).

---

## 4. Last successful operation (typical stall scenario)

Based on code structure, when the UI shows **Load Shell** + **Step stalled** + alive heartbeat:

| Last successful operation | Module |
|-------------------------|--------|
| Shell pipeline `register-ephemeral` + `verifyEphemeralShellMount` | `validation-shell-pipeline.ts` |
| `shellPipelinePhase = 'world-compile'` | `experience-lab-render-runtime.ts` ~446 |
| `lastStepChangeAt` set at world-compile entry | same |
| Heartbeat `notifySnapshot` ticks | `runtime-heartbeat.ts` |

**Often NOT reached:**

| Missing operation | Meaning |
|-------------------|---------|
| `COMPILE_STAGE_ENTER load-shell` | compileWorldStation never entered or threw before first `runStage` |
| `onStageComplete('load-shell', …)` | No stage ran → stall timer never reset after world-compile entry |
| `setCompileReports` with stages | compileStation never finished or never called |
| `shellPipelinePhase = 'failed' \| 'ready'` | runFullPipeline terminal handler never ran |

---

## 5. First operation that never completes

### Primary root cause (RC-STALL-1): **Orphaned runtime state — not a load-shell async hang**

**Mechanism:** `runFullPipeline` has **no `try/catch/finally`** around `await driver.compileStation()`. If `compileWorldStation` **throws before** the first `runStage('load-shell')` (gate at lines 130–133), the rejection is **unhandled**:

```typescript
if (validationMode && !previewSessionId) {
  throw new Error('[SHELL_RECOVERY_LOOKUP_MISMATCH] compileWorldStation requires previewCompileContext.previewSessionId…');
}
```

**Resulting orphan state:**

| Field | Value |
|-------|-------|
| `pipelineRunning` | `true` (never cleared) |
| `renderStatus` | `'running'` |
| `shellPipelinePhase` | `'world-compile'` |
| `lastStepChangeAt` | frozen at world-compile entry |
| `compileReport` in snapshot | `null` or stale |
| UI `currentStepId` | `'load-shell'` (default, line 89) |
| After 90s | `isStalled === true` (“Step stalled”) |
| Heartbeat | continues |

**Why this still happens after shell-resolution repair:** Any validation compile invoked **without** `previewCompileContext.previewSessionId` triggers the gate throw — including fire-and-forget `compileWorldStation` from `generateLayer` when global validation mode is on but per-call context is omitted (`useSceneStack.ts` ~529).

The main `runFullPipeline` path passes `previewCompileContext` correctly; **secondary compile entry points** may not.

---

### Secondary root cause (RC-STALL-2): **UI progress pin — semantic “load-shell” without stage execution**

**Mechanism:** When `shellPipelinePhase === 'world-compile'`, `buildSnapshot` maps `shellPhase` to `'ready'`. `computeRenderPipelineProgress` selects **`load-shell`** whenever `compileReport?.stages` is empty:

```typescript
// render-pipeline-progress.ts lines 88-89
} else {
  currentStepId = 'load-shell';
}
```

This happens **before** `compileStation` returns and **before** `compileReport` is written — even if load-shell would succeed synchronously. Normally milliseconds; paired with RC-STALL-1 it persists **≥90s**.

---

### Secondary root cause (RC-STALL-3): **Incremental progress desync**

**Mechanism:** `onStageComplete` updates `session.lastStepChangeAt` during compile, but **`driver.getStationCompileReport()`** only updates after **entire** `compileWorldStation` completes. UI step index uses `compileReport.stages`, not `session.currentStage`. Operators see **Load Shell** active while later stages may already be running internally.

If `onStageComplete` never fires (RC-STALL-1), stall timer is never reset.

---

### Contributing factor (RC-STALL-4): **Double compile in ensureStation**

`ensureStation` runs a **full** `compileWorldStation` before runtime `compileStation` (`useSceneStack.ts` ~632). This can:

- Populate `compileReport` with a failed `load-shell` from an earlier context
- Fire duplicate `COMPILE_STAGE_ENTER load-shell` events (investigation H2)
- Confuse progress if first compile fails and second never starts (RC-STALL-1)

Not an infinite hang by itself.

---

### Ruled out for load-shell stage body

| Hypothesis | Verdict |
|------------|---------|
| Unresolved promise inside load-shell | **Ruled out** — execute is sync |
| Hydration deadlock | **Ruled out** — no hydration in compile path |
| Event listener waiting on `studio-os-scene-stack-hydrated` | **Ruled out** — no subscriber gates compile |
| Async mutex on shell registry | **Ruled out** — in-memory Map |
| Timeout inside load-shell | **Ruled out** — none defined |
| Compare-mode registry collision (prior bug) | **Mitigated** by preview-scoped resolution (`e641dc7dc`); stall persists → points to RC-STALL-1/2 |

---

## 6. Root cause (ranked)

| Rank | ID | Summary |
|------|-----|---------|
| **1** | RC-STALL-1 | Unhandled rejection / orphan `pipelineRunning` when `compileWorldStation` throws before first `runStage`, leaving UI on default **load-shell** until 90s stall |
| **2** | RC-STALL-2 | Progress controller defaults to **load-shell** for world-compile with empty `compileReport` — conflates “about to compile” with “load-shell blocked” |
| **3** | RC-STALL-3 | `compileReport` published only after full compile; step UI ignores `onStageComplete` / `session.currentStage` |
| **4** | RC-STALL-4 | Duplicate compile in `ensureStation` + fire-and-forget compiles without preview context |

**The first condition never satisfied for LOCK_SHELL UI transition:** `compileReport.stages` containing successful `load-shell` **or** `compileFailedStage` / terminal `renderStatus` — because compile either never finishes reporting or runtime never reaches terminal handler.

**LOCK_SHELL in World Compiler** runs synchronously immediately after successful load-shell in the same function invocation — there is no separate async gate.

---

## 7. Files involved

| File | Role in stall |
|------|----------------|
| `src/studio-os-core/scene-stack/world-compiler/compile-pipeline.ts` | load-shell sync body; pre-stage throw gate |
| `src/studio-os-core/experience-lab-runtime/experience-lab-render-runtime.ts` | world-compile phase; no try/finally around compileStation; stall timer |
| `src/studio-os-core/creative-studio-preview/render-pipeline-progress.ts` | Defaults `currentStepId` to `load-shell`; 90s stall input |
| `src/hooks/useSceneStack.ts` | compileReport updated only post-compile; ensureStation double compile; fire-and-forget compile |
| `src/studio-os-core/scene-stack/world-compiler/immutable-shell.ts` | M1 resolveShellLockState |
| `src/studio-os-core/scene-stack/ephemeral-validation-registry.ts` | M3/M5 registry reads |
| `src/studio-os-core/scene-stack/preview-compile-context.ts` | previewSessionId gate |
| `src/components/admin/studio/experience-lab/CreativeStudioPipelineStatusBar.tsx` | “Step stalled” display |
| `src/services/studio/studioBuilder/api.ts` | Ungoverned timeout on API (ensureStation / Layer 1 — different UI step) |

---

## 8. Recommended repair (document only — NOT APPLIED)

### P0 — Prove on device (before code)

1. Open `/__world-compiler-investigation` or `window.__WC_INVESTIGATION__` after stall.
2. Confirm whether `COMPILE_STAGE_ENTER` with `stageName: load-shell` exists for active `compileRunId`.
3. If **absent** → RC-STALL-1 confirmed (throw or compileStation not reached).
4. If **present** with `COMPILE_STAGE_COMPLETE` → RC-STALL-2/3 confirmed (UI desync).

### P1 — Runtime hardening

1. Wrap `compileStation` in `try/catch/finally` in `runFullPipeline`; always clear `pipelineRunning`; set `failed` on throw.
2. Pass `previewCompileContext` into **all** `compileWorldStation` call sites (including fire-and-forget in `generateLayer`).
3. Remove or defer `ensureStation` inner `compileWorldStation` — single compile owner per `compileRunId`.

### P2 — Progress accuracy

1. Publish incremental `compileReport` / stage list after each `onStageComplete` (not only at end).
2. Drive `currentStepId` from `session.currentStage` during `world-compile` when `compileReport` is stale.
3. Map `session.currentStage === 'lock-shell'` when load-shell completes.

### P3 — Instrumentation (user-requested milestones)

Add `[M1]…[M7]` logs inside load-shell execute + gate-before-stage log with `previewSessionId` presence.

### P4 — Layer 1 (separate blocker)

B1 `AUTH_REQUIRED` causes **ensure-station** failure/hang, not load-shell — do not conflate; see `KNOWN_BLOCKERS.md`.

---

## 9. Absolute rules (this sprint)

- **No patch** applied
- **No retry loops**
- **No timeouts added blindly**
- Forensic documentation only

---

## 10. Success criteria for repair sprint (future)

- `COMPILE_STAGE_COMPLETE load-shell` followed by `COMPILE_STAGE_COMPLETE lock-shell` in same `compileRunId` on device logs
- UI advances past Load Shell within one heartbeat tick of load-shell complete (or shows explicit failed state, not 90s stall)
- Orphan `pipelineRunning` impossible after throw
- Step stalled only when a **true** async dependency (Layer 1 API) exceeds threshold **and** UI shows correct step name
