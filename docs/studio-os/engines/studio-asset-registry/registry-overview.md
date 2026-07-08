# Registry Overview — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.overview`  
**Status:** Foundational asset intelligence philosophy

---

## Definition

Studio Asset Registry™ is the **single source of truth** for reusable creation inside Studio OS.

Every department, every company, every experience, every Pack™, every Marketplace purchase, every generated object, and every reusable interaction ultimately **originates from or resolves through** the Registry.

The Registry is the **living memory** — not a static file dump.

---

## The Four-Engine Foundation

| Engine | Role | Memory |
|--------|------|--------|
| **Studio Department Generator™** | Creates departments | Writes definitions |
| **Studio Asset Compiler™** | Manufactures departments | Reads + writes packages |
| **Studio Asset Registry™** | Remembers everything | **Permanent library** |
| **Studio Department Runtime™** | Operates departments | Consumes registry refs |

```
Generator creates  →  Compiler manufactures  →  Registry remembers  →  Runtime operates
```

Together these become the foundation of every immersive business built on Studio OS.

---

## What the Registry Stores

The Registry is **category-agnostic at the schema level** — one `RegistryItem` type holds metadata for all resource kinds:

| Domain | Examples |
|--------|----------|
| **Environment** | Architecture shells · terrain · skyboxes · room envelopes |
| **Objects** | Furniture · props · glass systems · acrylic panels |
| **Materials** | Marble · brass · frosted glass · genome-tint slots |
| **Lighting** | Rigs · fixtures · HDRI · volumetric presets |
| **VFX & Particles** | Ambient dust · hologram shimmer · celebration bursts |
| **Audio & Music** | UI stingers · ambient loops · ceremony scores |
| **Animation** | Orb idle · panel reveal · walk-path choreography |
| **Cameras** | Product angles · cinematic presets · inspect rigs |
| **UI Components** | Acrylic panels · floating monitors · holographic menus |
| **Characters** | NPCs · concierges · talent portraits |
| **AI Personalities** | Concierge brains · Orb behavior profiles |
| **Motion Systems** | Easing libraries · ceremony timing |
| **Brand Systems** | Icons · typography · color systems · themes |
| **Genome Presets** | Company Genome templates · Room DNA presets |
| **Department Templates** | Full department definitions · department packages |
| **Prompt Intelligence** | Templates · fragments · recipes · negative libraries |
| **Interaction Patterns** | Verb bindings · walk paths · validation rules |
| **Marketplace Packs™** | Pack manifests · owned asset collections |

**Everything reusable belongs in the Registry.**

---

## Living Memory Principles

### 1. Register Once, Reuse Forever

An approved conference table exists once. Law firms, salons, and creative agencies **adapt** it — they do not duplicate it.

### 2. Version, Never Delete

Deprecated assets remain addressable. Runtime and historical packages resolve `registry:item-id@version`.

### 3. Relationships Are First-Class

Every item knows what it belongs to, depends on, enables, and who uses it.

### 4. Scores Compound

Quality score · performance score · usage history improve discovery and reuse confidence over time.

### 5. Prompts Are Assets

Prompt templates and fragments are Registry items — not loose markdown in department folders.

### 6. Packs Are Containers, Not Silos

Pack-owned items remain discoverable platform-wide when licensing permits.

### 7. Generation Is Last Resort

Smart Reuse asks six questions before any Compiler stage fires a provider. See [reuse-engine.md](./reuse-engine.md).

---

## Registry vs Other Registries

Studio OS has multiple registries. Each has a distinct scope:

| Registry | Scope | Relationship |
|----------|-------|--------------|
| **Studio Asset Registry™** | All reusable creative + runtime resources | **Canonical** |
| Design Registry™ (legacy) | Visual reuse + model routes | **Absorbed** into Asset Registry |
| System Registry™ (M127) | Modules · routes · services | References Asset Registry IDs |
| Component Registry™ (M128) | UI components | UI items also registered as Asset Registry entries |
| Documentation Registry™ (M126) | Help metadata | Cross-links to Asset Registry docs |

Asset Registry is the **creative memory layer**. System Registry is the **platform directory**.

---

## Data Planes (Conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│  INTELLIGENCE PLANE — metadata · schemas · relationships    │
│  (this sprint — canonical spec)                             │
├─────────────────────────────────────────────────────────────┤
│  ARTIFACT PLANE — cooked meshes · textures · audio · GLB    │
│  (future — storage backends · CDN · provider outputs)       │
├─────────────────────────────────────────────────────────────┤
│  RUNTIME PLANE — resolved refs · genome overlays · live     │
│  (Department Runtime™ consumes registry resolution)         │
└─────────────────────────────────────────────────────────────┘
```

v1 defines the **Intelligence Plane** completely. Artifact and Runtime planes integrate via [runtime-integration.md](./runtime-integration.md).

---

## Registry Operations (Conceptual API)

| Operation | Purpose |
|-----------|---------|
| `register(item)` | Introduce new Registry Item (Draft) |
| `approve(itemId, version)` | Promote to Approved |
| `deprecate(itemId, version, successorRef)` | Mark deprecated with migration path |
| `resolve(ref)` | Fetch item + dependencies + genome overlays |
| `queryReuse(criteria)` | Smart Reuse lookup for Compiler |
| `injectPack(packId, orgId)` | Marketplace purchase → org-scoped access |
| `recordUsage(itemId, context)` | Append usage history |
| `search(naturalLanguageQuery)` | Discovery (see [search-system.md](./search-system.md)) |

No implementation in this sprint — operations define **engine contracts**.

---

## Quality Tiers

Registry items carry implicit quality expectations:

| Tier | Meaning |
|------|---------|
| **Golden** | Reference implementations (e.g. Creative Direction Studio™ assets) |
| **Approved** | Production-ready · Compiler may reuse without review |
| **Internal** | Studio-only · not Marketplace-visible |
| **Experimental** | May change without deprecation notice |
| **Generated** | Provider output · subject to QA promotion |

Golden items seed the reuse library. Compiler Build Health rewards high reuse %.

---

## Boundary Law

```
Registry™                    Compiler™                    Runtime™
──────────────────────────────────────────────────────────────────
WHAT exists                  WHETHER to generate          HOW to display
Metadata + relationships     Package + expanded prompts   Live assembly
Permanent memory             Manufacturing pass           Operational session
```

The Registry **never** expands prompts or assembles scenes. It **informs** both.

---

## Success Definition

The Registry succeeds when:

1. A founder asks *"Do we already have a luxury marble conference table?"* — the answer is instant.
2. Compiler Build Health shows **>40% reuse** on mature departments without quality loss.
3. Marketplace Pack purchases appear in Registry within one injection event.
4. The same `registry:executive-chair-v3` feels like Frontal Slayer in one HQ and a law firm in another — without two chair assets.
5. Every future Studio OS generator consults Registry **before** creating.

---

_Studio Asset Registry™ — permanent creative memory._
