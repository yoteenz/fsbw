# Studio World — Orphaned Concepts (Audit1)

**Definition:** Exists in code/docs/old pages but **no clear current home** in the evolved product firewall, or **abandoned during evolution** but potentially valuable.

---

## ORPHANED_CONCEPTS

### 1. Legacy Campus Map / Hub (`studio-hub`)

- **What it was:** Earlier HQ navigation hub before world canonical paths.
- **Evidence:** `route-registry.ts` L66 `studio-hub`, slug `hub`.
- **Why it may matter:** Historical IA; may confuse with Mission Control / Campus Map Atrium.
- **Possible fit:** HISTORICAL_REFERENCE or merge into **Campus Map Atrium™**.

### 2. Parallel Experience Lab routes (v1/v2/v3/test)

- **What it was:** Engine validation forks.
- **Evidence:** `App.tsx`, `repo-audit/studio-world/03_routes.md`.
- **Why it matters:** Engineering debt; founder may not know which is “the lab.”
- **Possible fit:** STUDIO_OS diagnostics — **not** founder-facing world places.

### 3. Chief Officer room fleet (~30% complete)

- **What it was:** Demo executive personas as pages.
- **Evidence:** `pages/admin/studio/chief-*`, completion report.
- **Why it matters:** Spatial clutter vs Executive Council consolidation.
- **Possible fit:** Merge into **Executive Council Chamber** or archive as demo.

### 4. World Atlas vs Mission Control naming split

- **What it was:** Same registry entry notes former name Mission Control (`route-registry.ts` L151).
- **Why it matters:** Atlas canon vs command center metaphor collision.
- **Possible fit:** Single **observatory** concept — founder naming.

### 5. `repo-audit/studio-world/` full inventory (23 files)

- **What it is:** Sep 2026 separation audit — not linked from main SW README until Audit1.
- **Why it matters:** Rich route/system inventory may be **unknown to new agents**.
- **Possible fit:** Permanent **audit appendix** — keep updated.

### 6. Public `api/studio-world/v1/campaigns.ts`

- **What it was:** API stub for campaigns.
- **Evidence:** file exists; verify callers (grep shows limited use).
- **Why it matters:** Potential external B2B hook without UI story.
- **Possible fit:** Distribution HQ backend or **remove from world namespace** (founder decision — no action in Audit1).

### 7. Innovation Lineage Gallery / Constellations / Expeditions

- **What it was:** Immersive-partial innovation sub-destinations.
- **Evidence:** route-registry L98–100.
- **Why it matters:** May be pretty shells without live data loops.
- **Possible fit:** Innovation District sub-rooms or **archive wing**.

### 8. Character Lab vs Resident system

- **What it was:** VP/character tooling parallel to Season 1 residents.
- **Evidence:** `character-lab/` vs `studio-world-residents/`.
- **Why it matters:** Creative direction for “who appears in world.”
- **Possible fit:** Character Lab = **fabrication**; Residents = **coworkers** — firewall (founder decision).

### 9. Old world webpages / OpenArt-era assets

- **What it was:** Generated environments/icons under `src/assets/studio-world/`.
- **Evidence:** 442 files, generation summaries in `generated-v*/_generation-summary.json`.
- **Why it matters:** Visual reference for OpenArt session — **not canon**.
- **Possible fit:** Reference library in **Archives** — do not delete.

### 10. Expert Capture / Living Worker (public routes)

- **What it was:** Knowledge capture product with confessional/mirror flows.
- **Evidence:** `StudioDebugRoutes.tsx` expert-capture tree.
- **Why it matters:** Overlaps Profession Brain / Institute — not SW HQ daily life.
- **Possible fit:** STUDIO_OS + Institute — **connect** to world, not duplicate rooms.

---

## OUTDATED_WORLD_CONCEPT_REPORT (summary)

| Older model | Evidence of shift | What evolved |
|-------------|-------------------|--------------|
| Generic AI office / dashboard HQ | Living HQ + anti-dashboard canon | Executive **lobby** not SaaS grid |
| Simulated city of fake businesses | Digital Twin Constitution | Real orgs + residents |
| Single-company assumption | company-routes, multi-tenant SQL | Multi-company campus |
| Metaverse lobby | Constitution rejects decorative metaverse | Operational twin |
| Menu navigation vs walk | 002_WORLD_ARCHITECTURE, route-registry | Physical addresses |
| Pre-resident “AI specialists only” | 004_AI_SPECIALISTS + residents S1 | Residents + life OS |
| Creation inside SW | SITE00 firewall | Creation on SITE00 |

No mockery — these are **stepping stones** visible in docs and legacy routes.
