# KNOWN BLOCKERS — Do Not Violate

**Last updated:** 2026-07-12  
**Authority:** Overrides feature work, compile repair, and optimistic assumptions

---

## Gate rule

**Do not** describe Creative Direction Studio or Experience Lab validation runtime as restored until:

1. **B1-Layer1** — Founder completes authenticated real-device Layer 1 verification on Mobile Safari and Mobile Chrome with `?compilerDiag=1`, **and**  
2. **B1-E2E-Completion** — Terminal completion UI requires compound invariant (compile + full layer assembly + composite ready) — repair **not shipped**; forensic boundary documented only.

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

## B1-E2E-Completion — Premature terminal completion (NEW — FORENSIC PROVEN)

| Field | Detail |
|-------|--------|
| **ID** | B1-E2E-Completion |
| **Symptom** | Top bar **Render complete / 100%** while viewport overlay shows **Generating … N/8** or **0/8** |
| **Proven boundary** | `computeRenderPipelineProgress` — `isComplete = Boolean(compileSuccess)` without layer pipeline gate |
| **Secondary** | `compile-pipeline` mount stages succeed on "Stage skipped" with zero packages |
| **Forensic** | `END_TO_END_PIPELINE_RECONCILIATION.md` |
| **Repair** | **Not implemented** — compound invariant documented; await founder approval |
| **Status** | **In Progress** — evidence shipped; repair pending |

### Documented Fact

- Creative Studio preview and CDS viewport use **different** progress owners (`ownership-report.ts`).
- Experience Lab `runFullPipeline` emits `RenderCompleted` on compile report success only.

### Do not

- Treat World Compiler `compileReport.success` as guest-ready room
- Force progress bar to 100% without invariant checks
- Implement broad architecture changes without approval

---

## B1-Experience-Engine — Layer 1 (merged into B1-Layer1)

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
