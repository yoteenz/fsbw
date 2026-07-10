# World Compiler Three-Second Reset Loop Investigation™

**Status:** Forensic instrumentation shipped — **no production fix applied**.  
**Diagnostic mode:** `?compilerDiag=1` on Experience Lab route  
**Report route:** `/__world-compiler-investigation`

---

## Observed production behavior (user report)

World Compiler shows "Generating Landmark… 1/8 Layers", advances briefly, then resets to "Retry Shell Layer" or Layer 1 every ~3 seconds without user interaction. Never reaches layers 2–8.

**Treated separately** from Safari/Chrome heartbeat investigation.

---

## Diagnostic mode (`?compilerDiag=1`)

When enabled (persisted in `sessionStorage`):

| Normal production | Diagnostic mode |
|-------------------|-----------------|
| Auto-starts pipeline on mount | **Manual tap only** — "Start compile run" button |
| Retry / full pipeline buttons | **Disabled** — COMPILE STOPPED panel instead |
| `forceRegenerate: true` every run | Shell regen blocked after run start |
| Failures may trigger retry UI | **First failure frozen** on screen |

COMPILE STOPPED displays: compile run ID, failed stage/layer, error, shell ID, last successful event, reset attempted by, reset prevented.

---

## Immutable compile run ID

Every manual compile attempt receives:

```
compileRunId = crypto.randomUUID()
```

Logged on every compiler event with: `compilerInstanceId`, `renderId`, `shellId`, `stationId`, `companyId`, `layerNumber`, `stageName`, `status`, `elapsedMs`, `caller`.

If a new `compileRunId` appears without a founder tap → `COMPILE_RUN_ID_VIOLATION` logged with stack trace.

---

## Instrumentation map

| Module | Events |
|--------|--------|
| `useCreativeStudioRenderPreview.ts` | Run start/end, effect lifecycle, state writes, progress reset detection, tap tracking |
| `compile-pipeline.ts` | `COMPILE_STAGE_ENTER/COMPLETE/FAILED` per World Compiler stage |
| `ephemeral-validation-registry.ts` | `SHELL_REGISTERED`, `SHELL_DELETED` |
| `validation-shell-pipeline.ts` | `SHELL_INVALIDATED` on force regen |
| `validation-render.ts` | `CONTEXT_UPDATED` on session/mode changes |
| `CreativeStudioRenderPreview.tsx` | Mount/unmount/render, COMPILE STOPPED UI, tap on manual button |
| `investigation-log.ts` | `RESET_DETECTED`, `RESET_PREVENTED`, append-only session log |

Window API: `window.__WC_INVESTIGATION__` (event array)

---

## ~3 second timer audit (codebase evidence)

**No `setTimeout`/`setInterval` at ~3000ms in compile/scene-stack/experience-lab paths.**

| Timer | Interval | Can restart compile? |
|-------|----------|---------------------|
| Pipeline UI clock | 1000ms | No |
| Stall warning threshold | 90000ms | No |
| **BOOT_MODULE_TIMEOUT_MS** | **3000ms** | **Yes** (studio-kernel boot) |
| MTD heartbeat | 250ms | No |
| Loading terminal watchdog | 12000ms | No |
| Ephemeral shell TTL | 30min | Yes (on read expiry) |

Runtime ~3s timers: `window.__STUDIO_OS_TIMER_INVENTORY__` (flight recorder timer hook)

---

## Leading hypotheses (unproven — require device capture)

### H1: Auto-run effect cleanup restart loop

`useCreativeStudioRenderPreview` auto-run effect (lines 237–255) re-triggers when deps change (`workspaceId`, `layerPipelineActive`, etc.). Cleanup sets `cancelled=true` → on completion clears `pipelineRunRef` → **full pipeline restart** including `forceRegenerate: true`.

**Evidence needed:** `EFFECT_CLEANUP` + `COMPILE_RUN_STARTED` pairs ~3s apart with same `previewSessionId`.

### H2: Per-layer fire-and-forget compile during ensureStation

`useSceneStack.generateLayer` calls `compileWorldStation` after **each** layer save — compile report/progress UI may jump backward (looks like reset, same run).

**Evidence needed:** Multiple `COMPILE_STAGE_ENTER load-shell` without new `compileRunId`.

### H3: Global validation session race (compare mode)

Three `CreativeStudioRenderPreview` instances overwrite `activePreviewSessionId` — ephemeral shell may disappear mid-run.

**Evidence needed:** `CONTEXT_UPDATED` + `SHELL_DELETED` during active compile.

### H4: Shell force-regenerate loop

Every auto-run calls `forceRegenerate: true` → `clearValidationPreviewSession` → shell invalidated → load-shell fails or restarts.

**Evidence needed:** `SHELL_INVALIDATED` before each `RESET_DETECTED`.

---

## Layer 1 classification (automated from event log)

Report field `layer1Classification` classifies:

- **A** — mount-landmark never entered
- **B** — load-shell repeats, landmark never entered
- **C** — shell invalidated during run
- **D** — component unmount/remount
- **E** — multiple compile run IDs

---

## Investigation procedure

1. Open Experience Lab with `?compilerDiag=1`
2. Tap **Start compile run** once
3. Wait for reset or COMPILE STOPPED
4. Open `/__world-compiler-investigation` — read forensic report
5. Export `sessionStorage.worldCompilerInvestigationLog_v1`

---

## Absolute rules

- No production fix until exact reset caller proven with stack trace
- No retry logic added
- No new watchdogs
- Diagnostic mode only disables auto-retry — normal mode unchanged

---

## Smallest systemic repair proposal (NOT APPLIED)

After evidence confirms root cause, likely directions:

1. **If H1:** Remove auto-run; single owner for pipeline start; stable deps; don't clear `pipelineRunRef` on effect cleanup mid-run
2. **If H2:** Defer `compileWorldStation` until `ensureStation` completes; one compile per run ID
3. **If H3:** Per-instance validation session (not global singleton)
4. **If H4:** `forceRegenerate` only on explicit user action; preserve shell for active `compileRunId`

Enforce: **ONE RUN · ONE RUN ID · ONE COMPILER INSTANCE · ONE SHELL · ONE STATE OWNER · ONE TERMINAL RESULT**
