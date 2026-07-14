# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-13  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Environment Asset Package Production Pipeline**

**Status: SHIPPED — Durable persistence + governed generation pipeline**

**Shipped:**

- Supabase tables for environment packages, outputs, readiness, jobs, approvals, CDS handoffs
- Server API routes: migrate, status, approve, worker, promote
- Generation pipeline with parent `ENVIRONMENT_PACKAGE_PRODUCTION` + dependency-aware child jobs
- Experience Lab drawer wired: Approve for Production, Promote to Canonical (feature-flagged)
- Migration applied to production Supabase (FS Website)
- Feature flags: production generation + canonical promotion default OFF until founder enables

**Previous:** Experience Lab V2 Fixed-Viewport Application Shell.

---

## Current blocker

| ID | Blocker | Status |
|----|---------|--------|
| **B1-EnvPkg-LiveProof** | Founder device review + enable `ENABLE_PACKAGE_PRODUCTION_GENERATION` for one variant | **Verify Pending** |
| **B1-ELabV2-LiveSPA** | Post-deploy live React screenshots on device | **Verify Pending** |

---

## References

- `docs/studio-os/experience-lab/EXPERIENCE_LAB_V2_TEST_ENVIRONMENT.md`
- `docs/studio-os/experience-lab/v2-screenshots/`
