# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-12  
**Git reference:** (pending Layer 1 repair commit)

---

## Current sprint

**P0 Forensic Repair — Layer 1 `signature-landmark` generation 500 (shared Experience Lab runtime)**

Narrow repair shipped: structured server diagnostics, handler JSON hardening, FAL error preservation, `vercel.json` duration/includeFiles for `studio-builder-generate`. **Production mobile verification pending founder.**

**Previous:** P0 onboarding pack v1.2.1 archive inventory reconciliation.

---

## Current blocker

See `KNOWN_BLOCKERS.md` for full detail.

| ID | Blocker | Owner | Unblock |
|----|---------|-------|---------|
| **B1-layer1** | Layer 1 `signature-landmark` governed generation 500 | Founder (device) | Verify Creative Studio + Experience Engine on mobile Safari + Chrome after repair deploy |
| **B2** | Diagnostic normal-tab verification | Founder (device) | https://fsbw.vercel.app/__studio-os-recovery |

---

## Current debugging status

| System | Status | Notes |
|--------|--------|-------|
| Layer 1 forensic repair | ✅ Shipped | `docs/studio-os/forensics/LAYER1_GENERATION_500_REPAIR.md` |
| Handler JSON hardening + diagnostics | ✅ Shipped | `generation-error-diagnostics.ts`, route try/catch, gateway traceId |
| Regression tests | ✅ 13/13 pass | diagnostics + shared pipeline |
| Local governed FAL path | ✅ ~24s success | `executeGovernedGeneration` → `generateStudioBuilderAsset` |
| Production mobile verify | ⏳ Pending | Creative Studio + Experience Engine × Safari + Chrome |

---

## Latest architectural decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-11 | Validation mode requires **complete compile scope** | Prevents Experience Lab field leakage into shared gateway |
| 2026-07-11 | Lazy auth on `studio-builder-generate` only | No blocking pre-pipeline serverless call |
| 2026-07-11 | Creative Studio restoration separate from EE repair | Shared root cause proven; EE may have additional failures |

---

## Founder verification checklist

1. Open https://fsbw.vercel.app/admin/studio/experience-lab in **normal** mobile Safari tab (signed in as admin).
2. Repeat in **normal** mobile Chrome tab.
3. Confirm shell reaches **Generate Shell** with `studio-builder` method (not only canvas fallback) when network allows.
4. Confirm Layer 1 attempt shows governed auth in Black Box (not bare `AUTH_REQUIRED` with complete scope).
5. If stale cache: https://fsbw.vercel.app/__studio-os-recovery first.

---

## Immediate next priorities

1. **Founder:** Mobile verification of Creative Studio route (checklist above).
2. **Founder:** Review forensic report; approve separate Experience Engine sprint if Layer 1 still fails.
3. **Composer (future):** Experience Engine-only repair from Black Box traces — no shared-path speculation.

---

## Key forensic references

- `docs/studio-os/forensics/SHARED_GENERATION_PIPELINE_REGRESSION.md`
- Last good: `7f4e73553`
- First bad (shared payload): `2408310f3`
- Pipeline block: `49e48c7e4`
- Lazy auth baseline: `ff19d5016`
