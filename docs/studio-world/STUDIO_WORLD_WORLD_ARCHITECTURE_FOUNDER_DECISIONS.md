# Studio World — Founder Decision Queue (Audit1)

Non-trivial decisions only. Options are **not** final recommendations unless evidence strongly favors one.

---

## D1 — Single world vs federated company properties

**Why it matters:** Determines whether Grand Atrium is **the** world entry or one **property per tenant**.

**Evidence:** `company-routes/`, `CompanyGrandAtriumPage.tsx`, `002_WORLD_ARCHITECTURE.md` single campus vs multi-org SQL.

| Option | Description |
|--------|-------------|
| A | One shared **city/campus**; companies hold **leases** on wings |
| B | Each company = **separate HQ instance**; public city connects them |
| C | Hybrid: shared **public district** + private **HQ instances** |

**What changes:** Navigation graph, marketing discovery, resident movement rules.

---

## D2 — Marketplace canonical surface

**Why it matters:** Three marketplace modules exist (`marketplace`, `creator-marketplace`, `ecosystem-marketplace`).

**Evidence:** `studio-os-core/*marketplace*`, route-registry Marketplace Pavilion.

| Option | Description |
|--------|-------------|
| A | One **Marketplace Pavilion** UI merging all three |
| B | Separate **internal packs** vs **external B2B** markets |
| C | Keep modules; **no** single world location yet |

---

## D3 — Systems Dock spatialization

**Why it matters:** Event bus / workflow / state as **rooms** vs invisible OS.

**Evidence:** `route-registry.ts` L141–148, firewall audit.

| Option | Description |
|--------|-------------|
| A | Keep **basement Systems Dock** for founder power users |
| B | Move to **Studio OS command** only; remove from world map |
| C | **Metaphor only** in tutorials, not in default nav |

---

## D4 — Character Lab vs Studio World Residents

**Why it matters:** Who appears spatially as “people” in world.

**Evidence:** `character-lab/` vs `studio-world-residents/`, casting contracts.

| Option | Description |
|--------|-------------|
| A | Residents = staff; Character Lab = **VP/client fabrication** only |
| B | Unified **character system** with type discriminator |
| C | Residents only in SW; VP stays in **virtual production** silo |

---

## D5 — Resident places: logical vs canonical department map

**Why it matters:** Runtime uses logical locations (`life-os-seed`); 002 defines wings/floors.

**Evidence:** seed LOCATIONS vs `002_WORLD_ARCHITECTURE.md`.

| Option | Description |
|--------|-------------|
| A | Map every logical location → **registry place ID** |
| B | Keep logical until 3D; **UI shows labels only** |
| C | Residents free-float; departments are **human staff** only |

---

## D6 — Marketing layer primary metaphor

**Why it matters:** B2B discovery is under-represented in recent resident sprints.

**Evidence:** `STUDIO_WORLD_BUSINESS_MARKETING_AUDIT.md`, Distribution HQ routes.

| Option | Description |
|--------|-------------|
| A | **Market district** (public) + company showrooms |
| B | **Directory / atlas** first; markets later |
| C | **UI-only** CRM-style; no public spatial market |

---

## D7 — SITE00 handoff authority

**Why it matters:** What materializes automatically when a SITE00 project goes operational.

**Evidence:** `NDXBOOK_SITE00_HANDOFF.md`, site00 production API.

| Option | Description |
|--------|-------------|
| A | Explicit **manifest** consumed by SW org bootstrap |
| B | Manual founder **promote to world** action |
| C | SITE00 stays parallel; **links only** |

---

## D8 — Experience Lab vs World environment

**Why it matters:** Is validated environment **the** company space or a **factory**?

**Evidence:** Experience Lab + World Compiler spine, department generator.

| Option | Description |
|--------|-------------|
| A | Lab = **factory**; deployed environments = **tenant spaces** |
| B | Lab = **preview** of same space residents use |
| C | Merge into **Studio Warehouse** only |

---

## D9 — Entitlements → spatial unlocks

**Why it matters:** `studio_world_entitlements` exists without immersive gating story.

**Evidence:** migration `20260820180000`, production governance API.

| Option | Description |
|--------|-------------|
| A | Entitlements unlock **districts/buildings** |
| B | Entitlements **capability-only** (no map change) |
| C | Hybrid: **visible but locked** places |

---

## D10 — Frontal Slayer lounge relationship to SW

**Why it matters:** Both spatial; risk of product confusion.

**Evidence:** `/lobby/lounge` vs `/admin/studio/*`.

| Option | Description |
|--------|-------------|
| A | **No connection** — separate customer world |
| B | **Portal** from FS to founder HQ (founder only) |
| C | Shared **asset pipeline** only |

---

## D11 — Chief officer pages disposition

**Evidence:** Low completion estimate, many routes.

| Option | Merge to Executive Council · Archive · Keep as RPG-style easter eggs |

---

## D12 — OpenArt / visual generation scope for next sprint

**Evidence:** Sprint forbids generation in Audit1; 442 assets indexed.

| Option | Founder selects **canon places first** from inventory · subset pilot · defer |
