# KNOWN BLOCKERS — Do Not Violate

**Last updated:** 2026-07-12  
**Authority:** Overrides feature work, compile repair, and optimistic assumptions

---

## Gate rule

**Creative Studio and Experience Engine share the Experience Lab runtime.**

**Do not** describe either surface as restored, resolved, or production-verified until:

1. **B0** — All four Dispatch endpoints return application JSON (not `FUNCTION_INVOCATION_FAILED`), and  
2. **B1** — Founder completes authenticated real-device Layer 1 verification on **both** Mobile Safari and Mobile Chrome with `?compilerDiag=1`.

---

## B0-PreHandler — Dispatch Office serverless bundle (P0 — REPAIR SHIPPED, CANARY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B0-PreHandler |
| **Symptom** | Four governed routes return HTTP 500 plain-text `FUNCTION_INVOCATION_FAILED` in ~350–650 ms |
| **Proven boundary** | `api/_lib/creativeProduction/*` → `src/studio-os-core/**` not in Vercel serverless trace |
| **Repair shipped** | Pre-bundle `studio-os-server.bundle.js` + `studio-os-server.ts` runtime surface; `prebuild` script; `vercel.json` `includeFiles` on four routes |
| **Repair class** | D — build/pre-bundle (canonical source remains `src/studio-os-core/`) |
| **Forensic** | `DISPATCH_OFFICE_PREHANDLER_FORENSIC.md` |
| **Verify** | `POST /api/admin/experience-lab-ephemeral-authorization` returns JSON (401/400 acceptable) |
| **Status** | **In Progress** — production canary pending |

### Documented Fact

- Route handler, traceId, and diagnostics did not execute before repair.
- FAL and Model Orchestrator were not reached.
- Control endpoints (`studio-asset-registry`, etc.) were unaffected.

### Do not

- Claim incident resolved on canary alone
- Add FAL/provider changes without new evidence
- Add async queue or fallback masking

---

## B1-Layer1 — Governed generation Layer 1 (VERIFY PENDING — downstream of B0)

| Field | Detail |
|-------|--------|
| **ID** | B1-Layer1 |
| **Symptom** | Layer 1 `signature-landmark` — `Generation failed (500)` or structured gateway failure |
| **Depends on** | B0-PreHandler cleared |
| **Repair history** | Handler JSON hardening `7a8869404` (did not fix pre-handler class) |
| **Verify** | Authenticated mobile Safari + Chrome — both Creative Studio and Experience Engine |
| **Status** | **In Progress** — blocked on B0 canary + founder device |

### Unknown

- First application/provider failure after handler executes (if any).
- Whether FAL_KEY and provider path succeed in production.

### Do not

- Add canvas fallback or parallel pipeline
- Treat repair shipped as incident resolved

---

## B1-Experience-Engine — Layer 1 (merged into B1-Layer1)

Same shared runtime as Creative Studio. See **B1-Layer1**.

---

## B2 — Diagnostic normal-tab verification

| Field | Detail |
|-------|--------|
| **ID** | B2 |
| **Recovery URL** | https://fsbw.vercel.app/__studio-os-recovery |
| **Status** | **In Progress** — pending founder device verification |

---

## Creative Services roadmap

**Planned / Conceptual only** — see `docs/studio-os/creative-services/CREATIVE_SERVICES_ROADMAP.md`. Not implemented. Not a blocker for B0 repair.
