# Independent Forensic Recorder

**Sprint:** P0 Independent Forensic Recorder  
**Authority order:** IFR raw sequence → function return evidence → network → RSS → GSPU → UI labels

## Purpose

Existing diagnostic stores (RSS Job Board, GSPU Contractor Directory, Shell Foundation Black Box) share persistence, subscribers, and derived stall classifiers. When the shell stalls, those layers can disagree.

The Independent Forensic Recorder (IFR) is an **append-only security van** parked outside the Mansion:

- Own power (separate module + sessionStorage key)
- Strict chronological sequence
- Never calls back into workflow, React, or Black Box stores
- Records immutable facts only — no stall cause, health, or root-cause inference

## Event contract

Each event includes:

| Field | Description |
|-------|-------------|
| `sequenceNumber` | Monotonic append index |
| `monotonicTimestamp` | `performance.now()` |
| `wallClockTimestamp` | ISO wall clock |
| `compileRunId` | Active compile run |
| `surface` | e.g. `experience-lab-validation` |
| `invocationId` | GSPU/IFR invocation when bound |
| `parentInvocationId` | Parent call when nested |
| `eventType` | `function-enter`, `function-exit`, `before-statement`, `after-statement`, `await-*`, `fetch-*`, `exception`, `explicit-checkpoint` |
| `sourceFile` | Observed file |
| `sourceFunction` | Observed function |
| `sourceMarker` | IFR-01…IFR-16 or call marker |
| `status` | `observed` |
| `safeDetail` | Redacted summary (no secrets) |
| `errorName` / `errorMessage` | On exceptions only |

## IFR checkpoints (disputed window)

| Marker | Source step |
|--------|-------------|
| IFR-01 | Before `recordShellStage('create-shell-request')` |
| IFR-02 | After `recordShellStage` returns |
| IFR-03 | Before GSPU-02 success marker |
| IFR-04 | After GSPU-02 success marker |
| IFR-05 | Before GSPU-03 running marker |
| IFR-06 | After GSPU-03 running marker |
| IFR-07 | Before `recipe.departmentId` read |
| IFR-08 | After `recipe.departmentId` read |
| IFR-09 | Before registry initialization |
| IFR-10 | After registry initialization |
| IFR-11 | Before package lookup |
| IFR-12 | After package lookup |
| IFR-13 | Before authorization attach |
| IFR-14 | After authorization attach |
| IFR-15 | Before `requestStudioBuilderGenerate` |
| IFR-16 | After `requestStudioBuilderGenerate` |

## Return proof (minimum)

Wrapped with `recordIfrFunctionCall` / `recordIfrAsyncFunctionCall`:

- `recordShellStage`
- `recordGspuSubStage`
- `ensureDepartmentPackageRegistryInitialized`
- `requireDepartmentPackage`
- `requestStudioBuilderGenerate`

## Mobile export

`/admin/studio/experience-lab?compilerDiag=1` → Shell Foundation Black Box panel → **INDEPENDENT FORENSIC RECORDER**

- Latest sequence, event, marker, compileRunId, count, dropped count, persistence status
- Copy raw events / Export raw JSON
- Reconciliation snippet when RSS/GSPU disagree

## Reconciliation

`independent-forensic-reconciliation.ts` builds source-order table (S01–S16). When IFR observes a step and RSS/GSPU do not, **IFR wins**.

**Documented Fact:** RSS proved `recordShellStage` returned; GSPU-02b stayed pending while GSPU-02a stayed running.

**Inference:** GSPU marker sequencing / stale derived state — not proof of runtime hang inside `recordShellStage`.

**Unknown:** Actual next runtime boundary until post-deploy IFR export from founder mobile run.

## Diagnostic self-interference risks

See `DIAGNOSTIC_SELF_INTERFERENCE_RISKS` in `independent-forensic-reconciliation.ts` (SI-01…SI-08).

## Module paths

- `src/studio-os/diagnostics/world-compiler-investigation/independent-forensic-recorder.ts`
- `src/studio-os/diagnostics/world-compiler-investigation/independent-forensic-reconciliation.ts`
- Instrumentation: `validation-shell-pipeline.ts`, `initialize.ts`

## Server beacon

Not required — IFR uses throttled non-blocking `sessionStorage` persist; append path never awaits persistence.
