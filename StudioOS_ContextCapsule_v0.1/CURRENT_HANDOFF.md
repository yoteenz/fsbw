# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-13  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Experience Lab V2 Visual Reconstruction**

**Status: SHIPPED — Immersive Command Interface on isolated V2 route; production Experience Lab preserved**

**Shipped:**

- **`/admin/studio/experience-lab-v2`** — reference-spec immersive workstation (not legacy dashboard cards)
- **Presentation layer rebuilt** — Command Dock, floating inspectors, dominant StudioViewport, integrated Founder Workbench, Approval Bridge, Workbench Dock, Department Dock
- **Three-layer architecture** — Environment (decorative) · React UI · Viewport content inside StudioViewport only
- **Backend preserved** — view-model adapter, approval logic, test modes, feature flags, polling contracts unchanged
- **Tests** — experience-lab-v2.test.ts 18/18 PASS; build PASS
- **Review screenshots** — `docs/studio-os/experience-lab/v2-screenshots/` (390×844, 430×932, tablet, desktop, ultrawide)

**Previous:** Experience Lab V2 Test Environment (`1ac883421`); OS Scheduler (`f0b0ba91b`).

---

## Current blocker

| ID | Blocker | Status |
|----|---------|--------|
| **B1-FounderRender-API** | `founder-render-generate` cold-start 500 | **Fix shipped** — re-probe after deploy |
| **B1-FounderRender** | Photoreal full-room Founder Render on mobile Founder Review | **Verify Pending** |
| **B1-CanonicalDept-Runtime** | Canonical department batch dispatch to live FAL render queue | **Shipped** — queue button + physical queue panel + FAL dispatch via `studio_founder_render_jobs`; verify on production after deploy |
| **B1-ModMarketplace-Runtime** | Live marketplace mod purchase/install API + Supabase sync for founder mods | **Not started** — domain logic + schema shipped; production API wiring next |
| **B1-Parity** | Salvageable opaque layer extraction on real device | **Verify Pending** |
| **B1-Layer1** | Layer 1 mobile Safari/Chrome with `?compilerDiag=1` | **Verify Pending** |
| **B1-ELabV2-LiveSPA** | Post-deploy live React screenshots on production (cloud agent SPA boot timeout) | **Verify Pending** — CSS harness screenshots shipped for layout review |

---

## Founder workflow

### Admin Founder (Experience Lab)

1. Open Experience Lab → **PROGRAM SELECTOR**
2. **BUILD STUDIO WORLD** → select canonical department (e.g. Experience Lab, CDS, Command Center) → review charter/plan → controlled batch with cost confirmation
3. **BUILD INDUSTRY PACKS** → select Industry Pack → department tree (HQ templates only)

### Normal Founder

- Creative Director Studio only — customize approved HQ; never enter Experience Lab

**References:**

- `docs/studio-os/experience-lab/EXPERIENCE_LAB_V2_TEST_ENVIRONMENT.md`
- `docs/studio-os/experience-lab/CANONICAL_DEPARTMENT_GENERATION.md`
- `docs/studio-os/registries/CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.md`
- `docs/studio-os/industry-packs/DEPARTMENT_CLASSIFICATION.md`
- `docs/studio-os/architecture/STUDIO_WORLD_VS_HEADQUARTERS.md`
