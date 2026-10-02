# Studio World — World Architecture Forensic Audit (Audit1)

**Sprint:** `P0.STUDIOWORLD.WORLD-ARCHITECTURE.FORENSIC-AUDIT1`  
**Repo:** yoteenz/fsbw  
**Date:** 2026-10-02  
**Status:** Discovery complete — **no redesign, no implementation, no deploy**

---

## Executive summary

Studio World in fsbw is **not** a single feature folder. It is a **layered product history** spanning:

1. **Canon docs** (`docs/studio-world/`, `STUDIO_OS_BIBLE/`, `docs/studio-os/architecture/*`) describing a persistent headquarters / digital twin of real organizations.
2. **A large admin surface** (~**319** `studio/*` routes in `src/App.tsx`, ~**262** pages under `src/pages/admin/studio/`) — many rooms are **spatial metaphors** for Studio OS machinery.
3. **Core engines** under `src/studio-os-core/` (~**85** world/spatial/tenancy modules vs ~**85** OS-kernel modules vs ~**112** hybrid org-intelligence modules — see `repo-audit/studio-world/15_system_boundary.md`).
4. **Multi-company Postgres model** (`studio_world_organizations`, memberships, clients, projects, **entitlements**, production budgets — migration `20260820180000_studio_world_production_governance.sql`).
5. **Resident Life** (Season 1 + Foundation2 + Runtime1 on feature branches) — organizational life simulation with debug UI at `/__studio-world/residents`.
6. **SITE 00** as separate **creation/inception** product (`src/site00/`, `docs/site00/`) with documented handoff (`docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.md`).
7. **Frontal Slayer customer “mansion”** (`/lobby`, `/lobby/lounge`) — **not** Studio World HQ; separate spatial product on same host app.

**Current evolved thesis (founder + canon):** persistent **organizational life simulation** wrapped around a **real operating system** — a lived company/city/ecology, not a generic AI office or metaverse lobby (`STUDIO_WORLD_DIGITAL_TWIN_CONSTITUTION.md` explicitly rejects decorative metaverse).

**Audit finding:** The codebase **already contains** substantial **marketing/distribution**, **marketplace**, **B2B partner onboarding**, **casting/talent**, **multi-tenant governance**, and **89+ named physical route mappings** in `src/studio-os-core/studio-world/route-registry.ts`. These are **easy to under-represent** if discovery stops at resident-life branches.

---

## Product ownership map (firewall)

| Product | Role | Primary evidence |
|---------|------|------------------|
| **SITE 00** | Creation / inception — brands, identities, sites, expressions | `src/site00/`, `docs/site00/BIBLE.md`, `Site00Routes.tsx` |
| **Studio OS** | Machinery — orchestration, memory, compilers, permissions, pipelines | `src/studio-os-core/application/`, `event-bus`, `workflow-engine`, `model-orchestrator`, `/admin/studio-os/*` |
| **Studio World** | Lived digital company world — HQ spatial interface, tenancy, residents, B2B presence | `docs/studio-world/`, `/admin/studio/*`, `/admin/studio/world/*`, `studio-world-residents/`, `route-registry.ts` |
| **Frontal Slayer** | Customer commerce + mansion lobby | Customer routes in `App.tsx`, `/lobby/lounge` |
| **Studio Institute / Expert Capture** | Education / capture (adjacent; routes in debug tree) | `/studio-institute/*`, `/expert-capture/*`, `StudioDebugRoutes.tsx` |

**Rule used:** classify by **purpose**, not folder name. Many `/admin/studio/*` “rooms” are **spatialized Studio OS** (Systems Dock: event bus, workflow, permission engine — `route-registry.ts` L141–148).

Detail: **`STUDIO_WORLD_SITE00_STUDIOOS_FIREWALL_AUDIT.md`**.

---

## Historical world summary (evidence-based eras)

| Era | Character | Evidence |
|-----|-----------|----------|
| **E1 — HQ campus canon** | Single connected headquarters; zones; founder walks | `docs/studio-world/002_WORLD_ARCHITECTURE.md`, `001_STUDIO_WORLD_MANIFESTO.md` |
| **E2 — City / civilization expansion** | Districts, atlas, knowledge graph, master plan | `STUDIO_WORLD_MASTER_PLAN.md`, `STUDIO_ATLAS_BIBLE.md`, `STUDIO_WORLD_CIVILIZATION_BIBLE.md` |
| **E3 — Digital twin correction** | Real orgs, not fictional city of fake businesses | `STUDIO_WORLD_DIGITAL_TWIN_CONSTITUTION.md`, `docs/studio-world/README.md` |
| **E4 — Multi-company routes + Grand Atrium** | Company-scoped URLs, tenancy in DB | `src/studio-os-core/company-routes/`, `CompanyGrandAtriumPage.tsx`, `studio_world_*` governance migration |
| **E5 — Experience Lab / World Compiler spine** | Production validation, scene stack, immersive partial | `experience-lab-runtime/`, `scene-stack/world-compiler/`, `repo-audit/studio-world/13_completion_report.md` |
| **E6 — Resident life + runtime simulation** | Persistent residents, life OS, offline tick (feature branches) | `studio-world-residents/`, migrations `20261002143000`–`20261002210000`, PRs #32–#34 |

Dates are **not** invented per sprint rule; ordering follows doc + migration + branch evidence.

---

## Current implemented systems (high signal)

| System | Source type | Status | Evidence |
|--------|-------------|--------|----------|
| World route → place registry | IMPLEMENTED_CURRENT | **89 mappings** | `src/studio-os-core/studio-world/route-registry.ts` |
| World path resolver / redirects | IMPLEMENTED_CURRENT | Active | `src/pages/admin/studio/world/page.tsx`, `company-routes/redirects.ts` |
| Multi-tenant org + entitlements | SCHEMA + API | Partial UI | `20260820180000_*.sql`, `api/_lib/productionGovernance/` |
| Production governance debug | IMPLEMENTED_CURRENT | Debug | `/__studio-world/production-governance` |
| Partner / agency onboarding | IMPLEMENTED_CURRENT | Debug + API | `/__studio-world/partner-agency`, `api/_lib/partnerOnboarding/` |
| Resident Season 1 + Life OS | IMPLEMENTED_CURRENT (branch) | Debug + tests | `studio-world-residents/`, `/__studio-world/residents` |
| Distribution / campaigns / social | IMPLEMENTED_LEGACY/PARTIAL | HQ rooms + core modules | `distribution-engine/`, routes in registry L108–127 |
| Marketplace / creator / ecosystem | PARTIAL | Pavilion metaphor | `marketplace/`, `creator-marketplace/`, `ecosystem-marketplace/` |
| Canonical department generator | SCHEMA + API | Spatial dept packs | `20260713200000_canonical_department_generator.sql` |
| Global atlas / world graph | PARTIAL | Compiled artifacts | `public/studio-os/world-graph/graph.json`, `global-atlas/` |
| Character Lab / VP | PARTIAL | Routes + config | `character-lab/`, `virtual-production/` |
| Presence engine | PARTIAL | Module + route | `presence-engine/`, `progressive-presence/` |
| Studio Institute | IMPLEMENTED_CURRENT | Public routes | `studio-institute/`, expert capture tree |

Full concept index: **`studio-world-concept-registry.json`**.

---

## Branches searched

| Branch | Relevance |
|--------|-----------|
| `master` | Host app + full Studio OS / partial SW |
| `origin/cursor/studio-world-residents-season1-2885` | Resident Season 1 foundation |
| `origin/cursor/studio-world-resident-life-os-foundation2` | Life OS canon + schema |
| `origin/cursor/studio-world-resident-life-runtime-simulation1` | Runtime persistence + tick |

**Note:** Audit working tree for doc generation: `cursor/studio-world-world-architecture-forensic-audit1` @ includes runtime commit `de8155fd0` (superset of master for resident work).

---

## Codebase areas searched

- `docs/studio-world/` (34 files), `docs/studio-os/` (architecture, world-compiler, department-generator, guild-halls, etc.)
- `STUDIO_OS_BIBLE/` (spatial review canon)
- `repo-audit/studio-world/` (23 inventory files)
- `src/studio-os-core/` (282 top-level modules)
- `src/components/admin/studio/` (rooms, halls, districts)
- `src/pages/admin/studio/` (~262 pages)
- `src/routes/StudioDebugRoutes.tsx`, `src/App.tsx`
- `src/site00/`, `docs/site00/`
- `supabase/migrations/*studio_world*`
- `src/assets/studio-world/` (442 assets)
- `src/features/studio-world/`

---

## Cross-cutting reports (by deliverable)

| Topic | Document |
|-------|----------|
| Concept registry (machine-readable) | `studio-world-concept-registry.json` |
| Places | `STUDIO_WORLD_PLACE_INVENTORY.md` |
| Marketing / B2B | `STUDIO_WORLD_BUSINESS_MARKETING_AUDIT.md` |
| Firewall | `STUDIO_WORLD_SITE00_STUDIOOS_FIREWALL_AUDIT.md` |
| Spatial requirements | `STUDIO_WORLD_SPATIAL_REQUIREMENT_MATRIX.md` |
| Orphans | `STUDIO_WORLD_ORPHANED_CONCEPTS.md` |
| Founder decisions | `STUDIO_WORLD_WORLD_ARCHITECTURE_FOUNDER_DECISIONS.md` |

---

## Collisions (summary)

See **`STUDIO_WORLD_ORPHANED_CONCEPTS.md`** and firewall audit. Highlights:

- **Mission Control vs World Atlas** naming collision in registry (`world-atlas` former name Mission Control — `route-registry.ts` L151).
- **Memory Engine™** (org intelligence module) vs **resident memory** (life OS) — different domains, similar language.
- **Experience Lab v1/v2/v3/test** parallel routes — `repo-audit/studio-world/03_routes.md`.
- **Studio OS portfolio** (`/admin/studio-os/*`) vs **org HQ** (`/admin/studio/*`) — boundary documented in `application/routes.ts`.
- **Customer lounge** vs **Studio World HQ** — both “spatial,” different products.

---

## Open questions

1. Which **marketplace** module is canonical for B2B discovery — `marketplace/`, `ecosystem-marketplace/`, or `creator-marketplace/`?
2. Should **Systems Dock** rooms remain spatialized long-term or become invisible substrate only?
3. **Grand Atrium** per company vs global campus — single world or federated company properties?
4. Production **entitlements** → which buildings/districts are gated in future immersive nav?
5. **Resident homes/workplaces** — logical-only (runtime) vs canonical department locations from seed (`life-os-seed.ts` LOCATIONS)?

Full queue: **`STUDIO_WORLD_WORLD_ARCHITECTURE_FOUNDER_DECISIONS.md`**.

---

## Recommendation classification totals (registry)

Counts from `studio-world-concept-registry.json` (Audit1 snapshot):

| Class | Count (approx.) |
|-------|-----------------|
| KEEP | 18 |
| KEEP_BUT_EVOLVE | 22 |
| MERGE_WITH_CURRENT_CONCEPT | 8 |
| CONNECT_TO_SITE00 | 7 |
| MOVE_TO_STUDIO_OS | 14 |
| POTENTIALLY_DEPRECATE | 4 |
| HISTORICAL_REFERENCE_ONLY | 6 |
| NEEDS_FOUNDER_DECISION | 11 |

---

## Spatial requirement totals (matrix)

| Requirement | Count (approx.) |
|-------------|-----------------|
| REQUIRES_LITERAL_SPACE | 24 |
| BENEFITS_FROM_SPACE | 31 |
| SPATIAL_METAPHOR | 28 |
| UI_ONLY | 19 |
| INVISIBLE_SYSTEM | 22 |
| UNKNOWN | 8 |

---

## Visual assets

**442 files** under `src/assets/studio-world/` (Experience Lab icons, navigation icons, environment stills). Index in place inventory + registry entries `sw-assets-*`. **Not authority** — reference only.

---

## Next step (sprint)

Founder creative-direction session using this audit + decision queue **before** OpenArt / world visualization. No map/city plan generated in Audit1 (per sprint §41).
