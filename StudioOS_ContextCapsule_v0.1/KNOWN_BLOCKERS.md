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

## B1-Layer1 — Governed generation Layer 1 (ASYNC REPAIR SHIPPED — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Layer1 |
| **Symptom** | Layer 1 / shell generation — `TypeError: Load failed` after ~95.5s synchronous pending |
| **Proven boundary** | Synchronous HTTP transport waiting for full FAL `fal.subscribe` completion |
| **Repair** | ASYNC_GOVERNED_GENERATION_V1 — `fal.queue.submit` + persisted job + 202 submit + status poll/resume |
| **Files** | `async-governed-generation.ts`, `studio-builder-generate.ts`, `studioBuilder/api.ts`, migration `studio_governed_generation_jobs` |
| **Forensic** | `ASYNC_GOVERNED_GENERATION.md` |
| **Verify** | Mobile — submit <2s, leave page, return, asset mounts without resubmit |
| **Status** | **In Progress** — code shipped; founder production proof pending |
| **Rollback** | `ASYNC_GOVERNED_GENERATION_V1=0` restores synchronous path |

### Documented Fact

- Package resolution, authorization, and `requestStudioBuilderGenerate` entry succeeded before transport failure
- IFR proved execution through IFR-15/16 window; failure was long-lived fetch not returning JSON

### Do not

- Declare Creative Studio or Experience Lab restored until founder device proof
- Remove synchronous path until async verified in production

---

## B1-Shell — Shell foundation (ASYNC TRANSPORT REPAIR — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Shell |
| **Symptom** | Building Shell stall when sync fetch dropped at ~95s |
| **Repair** | Same async work-order path via `requestStudioBuilderGenerate` 202 handling |
| **Status** | **In Progress** — awaits founder compile with async submit |

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
