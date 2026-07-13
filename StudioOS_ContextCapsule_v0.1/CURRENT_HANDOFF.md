# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-13  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Eliminate Cross-Department Render Contamination**

**Status: SHIPPED — Each canonical department now owns isolated blueprint, prompt, cache, and fingerprint**

**Root cause:** `buildCanonicalDepartmentConstructionPlan()` called `fixtureReceptionConstructionPlan()` for all departments — every render used ReceptionShell.

**Shipped:**

- **`department-blueprint-builder.ts`** — per-department shells (ExperienceLabShell, CreativeDirectorStudioShell, ExecutiveAtriumShell, etc.)
- **`canonical-founder-render-prompt.ts`** — per-department effective FAL prompts (`canonical-*-founder-render.v1`)
- **`department-architectural-fingerprints.ts`** — signature elements + reception contamination markers
- **`founder-render-cache-identity.ts`** — department-isolated cache keys
- **`department-distinctness-validator.ts`** — rejects RECEPTION_CONTAMINATION and DEPARTMENT_NOT_DISTINCT
- **Charters expanded** — mustInclude/neverInclude for EL, CDS, Command Center, Marketplace, Founder Suite
- **Persistence** — job diagnostics store departmentId, blueprint, cacheKey, fingerprint
- **Diagnostics panel** — Department Render Diagnostics in Founder Review
- **Tests** — `department-render-isolation.test.ts` 11/11 PASS; canonical-department-generator 29/29 PASS
- **Forensic doc** — `docs/studio-os/investigations/CROSS_DEPARTMENT_RENDER_CONTAMINATION.md`

**Previous:** Industry Pack Neutrality (`718ff3556`); Canonical Department Queue (`2e0a1ff7b`); NBP Approval Gate (`0f4ce7a55`).

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
