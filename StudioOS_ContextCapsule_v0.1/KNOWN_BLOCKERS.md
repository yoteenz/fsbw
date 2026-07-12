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

## B1-Isolated — Full-scene rerender + unverified mount (VERIFIED PIPELINE SHIPPED — VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Isolated |
| **Symptom** | Layer 1 blocked — full-scene outputs or unverified candidates could not mount |
| **Compile runs** | `run-1783893880377-6ymov2` and follow-on |
| **Documented fact** | Shell healthy; prompt/model routing repaired (`0d374488c`); Layer 1 still blocked without candidate→approved gate |
| **Root cause (proven)** | Raw provider URLs reached Scene Stack as `draft_ready` without identity/structure/background/postprocess approval |
| **Repair** | `verified-asset-production.v1` — full production pipeline, approval proof required for mount, quarantine, conditional Ideogram cleanup |
| **Docs** | `VERIFIED_ASSET_PRODUCTION_PIPELINE.md`, `ASSET_APPROVAL_CONTRACT.md`, `BACKGROUND_REMOVAL_POLICY.md`, `UNVERIFIED_LAYER_MOUNT_FAILURE.md` |
| **Verify** | Experience Lab advances beyond Layer 1 with approved isolated landmark on authenticated mobile |
| **Status** | **In Progress** — code shipped; founder production proof pending |

### Do not

- Rebuild shell on layer-quality failure
- Accept full-scene rerenders to advance pipeline
- Show "Retry Shell Layer" for landmark quality failures

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

## B1-Immune — Schema drift self-healing (SHIPPED — PRODUCTION ENV PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Immune |
| **Symptom** | Missing `studio_governed_generation_jobs` caused schema-cache insert failure; hours of misdirected investigation |
| **Repair** | Studio OS Immune System™ — drift detector + Class A migration apply + contract verify + single retry |
| **Reference migration** | `20260712180000_studio_governed_generation_jobs` |
| **Files** | `src/studio-os-core/immune-system/`, `api/_lib/immuneSystem/`, `async-governed-generation.ts` |
| **Env** | `IMMUNE_SYSTEM_AUTO_REPAIR=1` + `SUPABASE_DB_URL` or `DATABASE_URL` (preferred) or Management API token |
| **CD Studio auth** | Separate fix — `POST /api/admin/creative-studio-stack-authorization` before stack build (not Immune System) |
| **CD Studio async** | `ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO=1` + `ASYNC_GOVERNED_GENERATION_V1=1` for 202 transport |
| **Verify** | Isolated reference-recovery test passes; production proof requires env + missing-table scenario (do not drop prod table) |
| **Status** | **In Progress** — code shipped; Vercel env + live auto-repair proof pending |
| **Rollback** | `IMMUNE_SYSTEM_AUTO_REPAIR=0` — detection/escalation only, no DDL apply |

### Documented Fact

- Missing table was deterministic root cause; adding table restored governed generation workflow
- FAL was not the active failure during the reference incident

### Do not

- Drop production table to test auto-repair
- Enable arbitrary SQL endpoints or client-controlled migration IDs
- Treat immune repair as permission for destructive schema changes

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
