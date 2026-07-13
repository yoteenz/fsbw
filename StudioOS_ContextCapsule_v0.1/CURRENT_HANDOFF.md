# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-13  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Industry Pack Neutrality, Creator IP Lineage & Marketplace Royalties**

**Status: SHIPPED — Build-A-Wig Atelier removed from official Hair packs; founder mod IP system live**

**Correction:** Build-A-Wig Atelier™ is **not** a neutral Hair Brand/Salon default — it is a **Frontal Slayer** founder-created mod (`FOUNDER_CREATED_MODDED_SCENE`).

**Shipped:**

- **Hair Brand Pack** — 15 neutral departments; no Build-A-Wig Atelier
- **Hair Salon Pack** — 14 neutral departments; no Build-A-Wig Atelier
- **Founder mods module** — `src/studio-os-core/founder-mods/` (6 content classes, brand-neutrality validator, IP lineage, royalties, licensing, certification, installation)
- **Frontal Slayer HQ preserved** — BAW Atelier, Hair Analysis Lab, Transformation Suite remain in `BEAUTY_HEADQUARTERS_REGISTRY` with creator lineage
- **UI** — `FounderModRegistryPanel` separates founder mods from official pack tree
- **Supabase** — `20260713210000_founder_mod_ip_lineage.sql` (11 tables + RLS); applied to production `hyycomvcaqxxvyrfupes`
- **Tests** — `founder-mod-ip-lineage.test.ts` — 24/24 PASS
- **Docs** — `BRAND_NEUTRALITY_STANDARD.md`, `FOUNDER_MOD_IP_LINEAGE.md`, `CREATOR_ROYALTIES.md`, `MOD_LICENSING.md`, `MOD_CERTIFICATION.md`

**Previous:** Canonical Studio World Department Generator (`c82cbd810`); Architecture Law #001 (`e892b3a65`); Experience Lab admin infrastructure (`188f1fc36`).

---

## Current blocker

| ID | Blocker | Status |
|----|---------|--------|
| **B1-FounderRender-API** | `founder-render-generate` cold-start 500 | **Fix shipped** — re-probe after deploy |
| **B1-FounderRender** | Photoreal full-room Founder Render on mobile Founder Review | **Verify Pending** |
| **B1-CanonicalDept-Runtime** | Canonical department batch dispatch to live FAL render queue | **Not started** — planning/batch UI shipped; runtime queue wiring next |
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
