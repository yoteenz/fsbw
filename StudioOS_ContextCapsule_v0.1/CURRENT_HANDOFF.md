# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-13  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Canonical Studio World Department Generator™**

**Status: SHIPPED — Experience Lab Program A + Program B separation live**

Experience Lab now supports two separate admin programs:

- **BUILD STUDIO WORLD** — canonical main department registry (25 departments, 6 categories)
- **BUILD INDUSTRY PACKS** — existing Industry Pack headquarters flow (unchanged, visually separated)

Migration `20260713200000_canonical_department_generator.sql` applied to production Supabase.  
Tests: `canonical-department-generator.test.ts` — 25/25 PASS.  
Build: PASS.

**Previous:** Architecture Law #001 (`e892b3a65`); Experience Lab admin infrastructure (`188f1fc36`); Canonical Studio World (`35d094db0`).

---

## Current blocker

| ID | Blocker | Status |
|----|---------|--------|
| **B1-FounderRender-API** | `founder-render-generate` cold-start 500 | **Fix shipped** — re-probe after deploy |
| **B1-FounderRender** | Photoreal full-room Founder Render on mobile Founder Review | **Verify Pending** |
| **B1-CanonicalDept-Runtime** | Canonical department batch dispatch to live FAL render queue | **Not started** — planning/batch UI shipped; runtime queue wiring next |
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
