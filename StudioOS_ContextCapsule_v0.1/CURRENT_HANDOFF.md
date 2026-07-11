# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-11  
**Git reference:** (pending restoration commit)

---

## Current sprint

**P0 Forensic — Shared Generation Pipeline Regression (Creative Studio restoration)**

Surgical root-cause isolation and Creative Studio governed-generation restoration on the shared `studio-builder-generate` path. Experience Engine Layer 1 remains a **separate** tracked blocker until founder verifies production traces.

**Previous:** Invite Manager sharing migration + password recovery (`3051691d2`, `bab32950c`).

---

## Current blocker

See `KNOWN_BLOCKERS.md` for full detail.

| ID | Blocker | Owner | Unblock |
|----|---------|-------|---------|
| **B1-restored** | Creative Studio validation compile — governed shell/layer generation | Founder (device) | Verify `/admin/studio/experience-lab` on normal mobile Safari + Chrome after deploy |
| **B1-ee** | Experience Engine Layer 1 — remaining failure after shared-path fix | Composer (separate sprint) | Production Black Box trace review; do not speculative-repair |

---

## Current debugging status

| System | Status | Notes |
|--------|--------|-------|
| Shared pipeline forensic report | ✅ Shipped | `docs/studio-os/forensics/SHARED_GENERATION_PIPELINE_REGRESSION.md` |
| Validation context gating | ✅ Shipped | `validation-compile-context.ts` + adapter hardening |
| Regression tests | ✅ 17/17 pass | `shared-generation-pipeline-regression.test.ts` |
| Lazy server ephemeral auth | ✅ Retained | `ensureValidationEphemeralAuth` on complete scope only |
| Blocking pre-pipeline auth | ✅ Removed | `ff19d5016` — do not reintroduce |
| Creative Studio production verify | ⏳ Pending | Founder mobile Safari + Chrome |
| Experience Engine Layer 1 | ❌ Isolated | Classify separately post-deploy |

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
