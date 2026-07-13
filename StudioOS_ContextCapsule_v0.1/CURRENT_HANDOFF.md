# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-13  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Experience Lab V2 Test Environment**

**Status: SHIPPED — React-first V2 on isolated test route; production Experience Lab preserved**

**Shipped:**

- **`/admin/studio/experience-lab-v2`** — canonical V2 test route with native badges (TEST ENVIRONMENT / NOT YET PRODUCTION)
- **`/admin/studio/experience-lab/test-v2`** — alias redirect to V2
- **`src/features/studio-world/experience-lab-v2/`** — React-first shell, StudioViewport™, environment layer, inspectors, workbench, approval bar, tool dock, diagnostics, view-model adapter, feature flags, test modes
- **Production `/admin/studio/experience-lab`** — unchanged, no redirect, no deletion
- **Tests** — experience-lab-v2.test.ts 13/13 PASS; build PASS

**Previous:** Operating System Scheduler (`f0b0ba91b`); Implementation Orchestrator (`3dd1e1e2e`).

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

---

## Founder workflow

### Admin Founder (Experience Lab)

1. Open Experience Lab → **PROGRAM SELECTOR**
2. **BUILD STUDIO WORLD** → select canonical department (e.g. Experience Lab, CDS, Command Center) → review charter/plan → controlled batch with cost confirmation
3. **BUILD INDUSTRY PACKS** → select Industry Pack → department tree (HQ templates only)

### Normal Founder

- Creative Director Studio only — customize approved HQ; never enter Experience Lab

**References:**

- `docs/studio-os/experience-lab/CANONICAL_DEPARTMENT_GENERATION.md`
- `docs/studio-os/registries/CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.md`
- `docs/studio-os/industry-packs/DEPARTMENT_CLASSIFICATION.md`
- `docs/studio-os/architecture/STUDIO_WORLD_VS_HEADQUARTERS.md`
