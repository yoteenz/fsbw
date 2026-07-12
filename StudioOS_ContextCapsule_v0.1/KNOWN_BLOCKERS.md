# KNOWN BLOCKERS — Do Not Violate

**Last updated:** 2026-07-12  
**Authority:** Overrides feature work, compile repair, and optimistic assumptions

---

## Gate rule

**Do not** describe Creative Direction Studio or Experience Lab validation runtime as restored until:

1. **B1-Layer1** — Founder completes authenticated real-device Layer 1 verification on Mobile Safari and Mobile Chrome with `?compilerDiag=1`, **and**  
2. **B1-E2E-Completion** — Founder confirms top bar and viewport never contradict (no 100% with N/8 generating) on authenticated device.

---

## B0-PreHandler — Dispatch Office serverless bundle (CLEARED)

| Field | Detail |
|-------|--------|
| **ID** | B0-PreHandler |
| **Symptom** | Four governed routes returned HTTP 500 plain-text `FUNCTION_INVOCATION_FAILED` |
| **Repair** | Pre-bundle `studio-os-server.bundle.js` (`4ec75321f`) |
| **Verify** | `POST /api/admin/experience-lab-ephemeral-authorization` and `studio-builder-generate` return JSON |
| **Status** | **Production** — unauthenticated probe 2026-07-12: JSON 401; `studio-builder-generate` issues `traceId` |

### Documented Fact

- Pre-handler module evaluation failure was real; bundle repair addresses import trace.
- Handler and `traceId` execute on probed routes post-deploy.

---

## B1-Layer1 — Governed generation Layer 1 (VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Layer1 |
| **Symptom** | Layer 1 `signature-landmark` — generation failure or incomplete scene |
| **Depends on** | B0 cleared |
| **Verify** | Authenticated mobile — CDS `arrival` + Experience Lab `frontal-slayer` concept A |
| **Status** | **In Progress** — founder device |

### Unknown

- First provider failure after authenticated handler (if any).
- Whether governed asset returns and mounts in production for one correlated `compileRunId`.

### Do not

- Add canvas fallback or parallel pipeline
- Declare restored from compile report or 100% bar alone

---

## B1-E2E-Completion — Premature terminal completion (REPAIR SHIPPED — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-E2E-Completion |
| **Symptom** | Top bar **Render complete / 100%** while viewport overlay shows **Generating … N/8** or **0/8** |
| **Proven boundary** | `computeRenderPipelineProgress` — `isComplete = Boolean(compileSuccess)` |
| **Repair** | `evaluateRenderTerminalComplete` gate; runtime defers `RenderCompleted` until invariants pass; `notifySnapshot` promotes on late layer finish |
| **Files** | `render-pipeline-progress.ts`, `experience-lab-render-runtime.ts` |
| **Tests** | `render-pipeline-progress.invariants.test.ts` (14) |
| **Forensic** | `END_TO_END_PIPELINE_RECONCILIATION.md` §13 |
| **Status** | **In Progress** — code shipped; founder authenticated verification pending |

### Documented Fact

- Repair changes completion **authority** only — no Scene Stack, World Compiler, or provider changes.
- `compileReport.success` = blueprint ready; terminal complete = Final Inspection passed.

### Do not

- Treat repair shipped as incident resolved without authenticated device proof
- Revert to compile-only completion authority

---

## B1-Shell — Shell foundation construction stall (IFR SHIPPED — REPAIR NOT STARTED)

| Field | Detail |
|-------|--------|
| **ID** | B1-Shell |
| **Symptom** | Pipeline stops at **Building Shell** — stall at `create-shell-request` |
| **Instrumentation** | Independent Forensic Recorder + RSS Job Board + GSPU Contractor Directory |
| **Forensic** | `INDEPENDENT_FORENSIC_RECORDER.md`, `RECORD_SHELL_STAGE_JOB_BOARD.md`, `GENERATE_SHELL_DISPATCH_DESK.md` |
| **Verify** | Mobile `?compilerDiag=1` — export IFR raw JSON; compare IFR-01…IFR-16 vs RSS/GSPU |
| **Status** | **In Progress** — observation layer reconciled; repair awaits IFR proven boundary |
| **Authority** | IFR raw sequence > RSS > GSPU > UI labels |

### Documented Fact

- RSS telemetry proved `recordShellStage()` returned successfully (persist + notify completed)
- GSPU-02a stayed **running** while GSPU-02b stayed **pending** — stores disagreed
- Diagnostic stores useful but not sole evidence source until IFR export confirms execution order

### Inference

- GSPU marker sequencing bug (02b skipped `running`) contributed to stale GSPU view
- Actual runtime boundary unknown until post-deploy IFR founder mobile capture

### Do not

- Implement shell repair without IFR raw ledger from founder device
- Treat RSS or GSPU alone as proof of where execution stopped

---


Experience Lab validation runtime shares `useSceneStack` driver and `studio-builder-generate` with CDS. See **B1-Layer1** and **B1-E2E-Completion**.

---

## B2 — Diagnostic normal-tab verification

| Field | Detail |
|-------|--------|
| **ID** | B2 |
| **Recovery URL** | https://fsbw.vercel.app/__studio-os-recovery |
| **Status** | **In Progress** — pending founder device verification |

---

## Creative Services roadmap

**Planned / Conceptual only** — see `docs/studio-os/creative-services/CREATIVE_SERVICES_ROADMAP.md`. Not implemented.
