# KNOWN BLOCKERS — Do Not Violate

**Last updated:** 2026-07-11  
**Authority:** Overrides feature work, compile repair, and optimistic assumptions

---

## Gate rule

**Creative Studio** governed validation compiles: verify on production mobile **after restoration deploy** before resuming Experience Engine repair.

**Experience Engine Layer 1** remains blocked until Black Box traces confirm whether failure is auth-scope, provider, or compiler-state — **separate sprint**.

---

## B1-Layer1 — Governed generation 500 (P0 — REPAIR SHIPPED)

| Field | Detail |
|-------|--------|
| **ID** | B1-Layer1 |
| **Symptom** | Layer 1 `signature-landmark` fails with client `Generation failed (500)` on shared `studio-builder-generate` path |
| **Proven root cause** | Non-JSON Vercel platform termination (`FUNCTION_INVOCATION_FAILED` / uncaught handler throw) — client synthesizes `(500)` when body is not JSON; FAL errors in caught path were over-collapsed |
| **Repair** | Handler top-level JSON try/catch; structured `generation-error-diagnostics`; FAL ApiError preservation; `vercel.json` maxDuration 120 + marble includeFiles |
| **Forensic reports** | `GENERATION_FAILED_500_TRACE.md`, `LAYER1_GENERATION_500_REPAIR.md` |
| **Verify** | Mobile Safari + Chrome — Creative Studio and Experience Engine at `/admin/studio/experience-lab?compilerDiag=1` |
| **Status** | ⏳ Pending founder production verify |

### Do not

- Add Layer 1 canvas fallback or placeholder assets
- Reintroduce blocking pre-pipeline ephemeral auth
- Treat "Retry Shell Layer" UI as shell failure evidence

---

## B1-Experience-Engine — Layer 1 (merged into B1-Layer1)

Experience Engine uses the same shared runtime as Creative Studio. Layer 1 repair applies to both surfaces. See **B1-Layer1** above.

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
| **Status** | ⏳ Pending founder device verification |

---

## Historical reference (superseded for Creative Studio path)

Pre-2026-07-11 B1 entry documented Layer 1 `AUTH_REQUIRED` with shell canvas fallback masking. Shared-path restoration addresses **governed validation** auth issuance; Experience Engine Layer 1 may still need separate work.
