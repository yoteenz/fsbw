# KNOWN BLOCKERS — Do Not Violate

**Last updated:** 2026-07-12  
**Authority:** Overrides feature work, compile repair, and optimistic assumptions

---

## Gate rule

**Creative Studio and Experience Engine share the Experience Lab runtime.** The deployed Layer 1 repair (`7a8869404`) applies to **both**.

**Do not** describe either surface as restored, resolved, or production-verified until founder completes authenticated real-device verification on **both** Mobile Safari and Mobile Chrome with `?compilerDiag=1`.

**Do not** begin a new repair sprint without founder review of new production evidence.

---

## B1-Layer1 — Governed generation 500 (P0 — REPAIR SHIPPED, VERIFY PENDING)

| Field | Detail |
|-------|--------|
| **ID** | B1-Layer1 |
| **Symptom** | Layer 1 `signature-landmark` fails with client `Generation failed (500)` on shared `studio-builder-generate` path |
| **Proven failure position** | After M1–M7, shell lock, and `ensureStation` — first failure at Layer 1 (`Documented Fact`) |
| **Leading explanation** | Vercel platform termination / non-JSON 500 before structured handler response (`Inference` — not conclusively proven until authenticated production traces confirm) |
| **Repair shipped** | Handler top-level JSON try/catch; `generation-error-diagnostics`; FAL ApiError preservation; `vercel.json` maxDuration 120 + marble includeFiles (`Documented Fact`, commit `7a8869404`) |
| **Forensic reports** | `GENERATION_FAILED_500_TRACE.md`, `LAYER1_GENERATION_500_REPAIR.md` |
| **Verify** | Mobile Safari + Chrome — Creative Studio **and** Experience Engine at `/admin/studio/experience-lab?compilerDiag=1` |
| **Status** | **In Progress** — production verification pending |

### Documented Fact

- Repair code is deployed on `master` (`7a8869404`).
- Regression tests pass locally (13/13).
- Client `Generation failed (500)` is synthesized when HTTP body is not JSON.
- Creative Studio and Experience Engine use the same shared runtime.

### Inference

- Vercel duration/platform termination is the leading explanation for the original non-JSON 500.
- JSON hardening should expose `traceId` + `diagnostic.category` if the handler executes.

### Unknown

- Whether authenticated founder production now succeeds on real devices.
- Whether a downstream provider, normalization, or import-time failure will appear once the handler executes.
- Whether unauthenticated API probes reflect the authenticated Layer 1 path.

### Do not

- Add Layer 1 canvas fallback or placeholder assets
- Reintroduce blocking pre-pipeline ephemeral auth
- Treat "Retry Shell Layer" UI as shell failure evidence
- Claim Creative Studio was restored separately from Experience Engine
- Treat repair shipped as incident resolved

---

## B1-Experience-Engine — Layer 1 (merged into B1-Layer1)

Experience Engine uses the same shared runtime as Creative Studio. Layer 1 repair and verification apply to both surfaces. See **B1-Layer1** above.

### Verify compile diagnostic

```
https://fsbw.vercel.app/__world-compiler-investigation
```

Optional query: `?compilerDiag=1` on Experience Lab route.

---

## B2 — Diagnostic normal-tab verification

| Field | Detail |
|-------|--------|
| **ID** | B2 |
| **Recovery URL** | https://fsbw.vercel.app/__studio-os-recovery |
| **Status** | **In Progress** — pending founder device verification |

---

## Historical reference (superseded)

Pre-2026-07-11 B1 entries documented Layer 1 `AUTH_REQUIRED` with shell canvas fallback masking. Shared-path auth issuance was addressed in prior sprints. Current blocker is governed generation 500 / platform termination — not a separate Experience Engine-only runtime incident.
