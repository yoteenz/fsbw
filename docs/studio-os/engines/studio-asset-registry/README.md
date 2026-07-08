# Studio Asset Registry™ — The Living Library (v1)

**Version:** 1.1.0  
**Status:** Canonical asset intelligence specification — architecture sprint  
**Type:** Core Studio OS Engine — not a feature, not a department  
**Engine ID:** `studio.asset-registry.v1`  
**Tagline:** *The Living Library — remember first, generate last.*

---

> **Every generated asset should become a reusable company asset. Studio OS should never generate something it already owns unless the founder explicitly requests a variation.**

---

> **Department Generator™ creates departments. Studio Asset Compiler™ manufactures them. Studio Asset Registry™ remembers everything. Department Runtime™ brings everything to life.**

Studio Asset Registry™ is the **canonical library** for every reusable resource inside Studio OS — the permanent creative memory that every future engine depends upon.

---

## Mission

The Registry is **not merely an asset database**. It is the **living memory** of everything Studio OS can build with.

| Without Registry | With Registry |
|------------------|---------------|
| Every compile regenerates from scratch | Reuse becomes the default |
| Prompts scattered across departments | Prompt intelligence is centralized |
| Pack purchases are opaque bundles | Marketplace items become first-class citizens |
| Same chair duplicated per industry | One asset · many souls via Company Genome™ |
| Generators guess what exists | Generators **ask** before they create |

**No implementation in this sprint. No React. No Three.js. No Supabase. No UI. No asset generation.**

---

## Remember-First Law

```
Every generation → ask Registry first
Reuse exists     → recommend reuse
No match         → generate → auto-register
```

See [remember-first-law.md](./remember-first-law.md) · [generation-gate.md](./generation-gate.md) · [auto-registration.md](./auto-registration.md).

---

## What This Engine Does

| Does | Does Not |
|------|----------|
| Define canonical **Registry Item** schema | Store binary meshes or textures |
| Catalog every reusable Studio OS resource type | Execute AI generation |
| Power **Smart Reuse** before Compiler runs | Replace Department Generator™ |
| Track Pack™ ownership + Marketplace injection | Build Marketplace checkout UI |
| Hold prompt templates · fragments · recipes | Expand prompts (Compiler does) |
| Model dependency graphs + usage history | Assemble runtime scenes |
| Support Company Genome™ + Room DNA™ compatibility | Bake brand visuals into assets |
| Enable natural-language search (spec) | Implement vector DB in v1 |

---

## Engine Position

```
Every creation path
         ↓
STUDIO ASSET REGISTRY™ (this engine)
  Register · Version · Relate · Score · Search · Reuse
         ↑                    ↓
Department Generator™    Studio Asset Compiler™
(creates definitions)    (manufactures packages)
         ↓                    ↓
Marketplace Packs™       Department Runtime™
(inject items)           (consumes registry refs)
```

---

## Relationship to Design Registry™

**Studio Asset Registry™ supersedes and absorbs Design Registry™** (`studio.design-registry.v1`).

| Legacy (Compiler v1 input) | Canonical (Registry v1) |
|----------------------------|-------------------------|
| `DesignRegistrySnapshot` | `RegistrySnapshot` |
| `registeredAssets` | `items[]` with full metadata |
| `reuseLibrary` | `reuse-engine` resolution |
| `goldenModels` | `generatorCompatibility.modelRoutes` |

Compiler `designRegistryRef` migrates to `registrySnapshotRef`. See [runtime-integration.md](./runtime-integration.md).

---

## Document Index

| Document | Contents |
|----------|----------|
| [remember-first-law.md](./remember-first-law.md) | **Core law** — reuse before generate |
| [canonical-asset-record.md](./canonical-asset-record.md) | UUID · workspace · cost · every field |
| [scene-stack-categories.md](./scene-stack-categories.md) | Environment Shell™ · Lighting™ · … |
| [generation-gate.md](./generation-gate.md) | Mandatory pre-generation query |
| [auto-registration.md](./auto-registration.md) | Auto-save every generated asset |
| [registry-overview.md](./registry-overview.md) | Philosophy · living memory · platform role |
| [asset-schema.md](./asset-schema.md) | Registry Item — every required field |
| [category-system.md](./category-system.md) | Taxonomy · subcategories · reuse categories |
| [versioning.md](./versioning.md) | Draft · Approved · Marketplace · lifecycle |
| [dependency-graph.md](./dependency-graph.md) | Belongs-to · depends-on · used-by |
| [reuse-engine.md](./reuse-engine.md) | Smart Reuse — generation is last resort |
| [prompt-library.md](./prompt-library.md) | Templates · fragments · recipes |
| [pack-support.md](./pack-support.md) | Pack ownership · Marketplace injection |
| [company-genome-adaptation.md](./company-genome-adaptation.md) | One asset · many company souls |
| [search-system.md](./search-system.md) | Natural language · filters · ranking |
| [runtime-integration.md](./runtime-integration.md) | Generator · Compiler · Runtime contracts |
| [future-roadmap.md](./future-roadmap.md) | v2+ evolution |

---

## Cross-References

| System | Path |
|--------|------|
| **Creative Blueprint Engine™** | [`../../creative-blueprint-engine/`](../../creative-blueprint-engine/README.md) — Visual DNA™ · design languages · Systems™ scope |
| **Asset Intelligence Engine™** | [`../../asset-intelligence-engine/`](../../asset-intelligence-engine/README.md) — founder-facing remember-first · Compatibility Engine™ |
| **Creative Intelligence Engine™** | [`../../creative-intelligence-engine/`](../../creative-intelligence-engine/README.md) — auto-register · generation gate on Scene Planner™ |
| Studio Asset Compiler™ | [`../studio-asset-compiler/`](../studio-asset-compiler/README.md) |
| Studio Department Generator™ | [`../../department-generator/`](../../department-generator/README.md) |
| Department Generator engine | [`../../engine/department-generator/`](../../engine/department-generator/README.md) |
| Creative Direction Studio™ (golden dept) | [`../../departments/creative-direction-studio/`](../../departments/creative-direction-studio/README.md) |
| Asset Compiler engine (deep spec) | [`../../engine/asset-compiler/`](../../engine/asset-compiler/README.md) |

---

## Success Criteria (v1.1)

- [ ] Remember-First Law™ canonical
- [ ] Canonical Asset Record™ fields complete
- [ ] Scene Stack™ category alignment documented
- [ ] Generation Gate™ mandatory before provider
- [ ] Auto-Registration™ on every generation
- [ ] Registry functions as **permanent creative memory** of Studio OS
- [ ] Supports unlimited industries · departments · Packs™ · assets · generators
- [ ] Every Registry Item has complete metadata schema
- [ ] Smart Reuse spec gates Compiler before generation
- [ ] Pack ownership + Marketplace injection defined
- [ ] Company Genome™ adaptation without asset duplication
- [ ] Prompt Library integrated with Compiler expansion
- [ ] Dependency graph + search system specified
- [ ] Runtime integration contracts documented

---

_Studio Asset Registry™ — The Living Library._
