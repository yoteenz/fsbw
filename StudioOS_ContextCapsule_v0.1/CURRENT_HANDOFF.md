# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-13  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Eliminate Cross-Department Render Contamination**

**Status: SHIPPED — Architectural DNA Registry & FounderRenderPromptCompiler govern all canonical department prompts**

**Previous:** Cross-Department Render Contamination (`def341fa9`); Industry Pack Neutrality (`718ff3556`).

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
