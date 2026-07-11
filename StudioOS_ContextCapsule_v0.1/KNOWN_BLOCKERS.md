# KNOWN BLOCKERS — Do Not Violate

**Last updated:** 2026-07-11  
**Authority:** Overrides feature work, compile repair, and optimistic assumptions

---

## Gate rule

**Creative Studio** governed validation compiles: verify on production mobile **after restoration deploy** before resuming Experience Engine repair.

**Experience Engine Layer 1** remains blocked until Black Box traces confirm whether failure is auth-scope, provider, or compiler-state — **separate sprint**.

---

## B1-Creative-Studio — Shared pipeline regression (P0 — RESTORATION SHIPPED)

| Field | Detail |
|-------|--------|
| **ID** | B1-Creative-Studio |
| **Symptom** | Creative Studio at `/admin/studio/experience-lab` failed shell/layer governed generation after B1 auth commits |
| **Proven root cause** | `2408310f3` leaked `validationMode` + validation fields into shared `studio-builder-generate` without guaranteed server auth; `49e48c7e4` blocked pipeline at Compile Preview Spec when ephemeral auth endpoint failed |
| **Restoration** | Complete-scope gating (`validation-compile-context.ts`); lazy `ensureValidationEphemeralAuth` hardened; adapter execution context propagation |
| **Forensic report** | `docs/studio-os/forensics/SHARED_GENERATION_PIPELINE_REGRESSION.md` |
| **Verify** | Normal mobile Safari + Chrome on https://fsbw.vercel.app/admin/studio/experience-lab |
| **Status** | ⏳ Pending founder production verify |

### Do not

- Reintroduce blocking pre-pipeline `experience-lab-ephemeral-authorization` call before shell pipeline
- Default `validationMode` from global render mode without complete compile scope
- Disable authorization or add canvas fallback for Layer 1 to mask auth failure

---

## B1-Experience-Engine — Layer 1 remaining failure (P0 — ISOLATED)

| Field | Detail |
|-------|--------|
| **ID** | B1-Experience-Engine |
| **Symptom** | Experience Engine Layer 1 (`signature-landmark`) may still fail after shared-path restoration |
| **Distinction** | **Not** the same as Creative Studio shell regression; triage with Black Box after Creative Studio verified |
| **Classification candidates** | A authorization issuance · C scope mismatch · G provider · I UI/compiler desync |
| **Owner** | Composer (separate approved sprint) |
| **Unblock** | Founder approves EE repair after Creative Studio mobile verify + trace review |
| **Status** | ❌ Not repaired in this sprint |

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
