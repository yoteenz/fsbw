# Asset Registry™ — Searchable Creative Memory

**Module:** `studio.asset-intelligence.v1.registry-view`  
**Storage Engine:** [Studio Asset Registry™](../engines/studio-asset-registry/README.md)  
**Status:** Intelligence-facing registry contract

---

## Purpose

**Asset Registry™** is where Studio OS remembers everything it has ever created.

Every approved asset receives a permanent, searchable record. The Asset Intelligence Engine™ queries this registry before any generation.

Binary artifacts (images, meshes, layers, audio) are **referenced** — intelligence lives in metadata.

---

## Registry Principle

> Everything becomes searchable.

If an asset cannot be found by the Intelligence Engine, it does not exist for reuse purposes.

---

## Required Fields (Intelligence Plane)

Every approved asset receives:

| Field | Description | Search Role |
|-------|-------------|-------------|
| **Asset ID™** | Canonical `registry:{slug}-v{n}` | Primary key |
| **Asset Name™** | Human display name | Natural language search |
| **Department™** | Origin department | Scope · cross-dept discovery |
| **Scene™** | Scene within department | Context filter |
| **Station™** | Station within scene | Scene Stack™ alignment |
| **Category™** | Primary taxonomy | Category filter |
| **Style™** | Editorial · executive · atelier · etc. | Style matching |
| **Materials™** | Bronze · marble · glass · leather · etc. | Material DNA |
| **Lighting Profile™** | Rig type · mood · temperature | Lighting reuse |
| **Color Palette™** | Dominant colors · accents | Visual coherence |
| **Environment Tags™** | atelier · vault · library · outdoor | Semantic search |
| **Creator™** | studio · founder · pack · marketplace | Provenance |
| **Generation Prompt™** | Canonical prompt (or ref) | Modify · upgrade paths |
| **Golden Build Version™** | Pipeline version at approval | Compatibility gate |
| **Dependencies™** | Requires · used-by graph | Layer/stack safety |
| **Reuse Count™** | Times linked without regen | Popularity signal |
| **Performance Cost™** | Original gen cost (tokens · compute · time) | Savings calculation |
| **Date Created™** | ISO timestamp | Freshness |
| **Last Used™** | ISO timestamp | Recency boost |
| **Compatibility Score™** | Last computed score (contextual) | Cache hint |

---

## Mapping to Studio Asset Registry™ Schema

Intelligence fields map to canonical Registry Item:

| Intelligence Field | Registry Item Path |
|--------------------|-------------------|
| Asset ID™ | `registryId` |
| Asset Name™ | `identity.name` |
| Department™ | `compatibility.departments[]` + `provenance.originDepartment` |
| Scene™ · Station™ | `context.sceneId` · `context.stationId` |
| Category™ | `identity.category` + `identity.reuseCategory` |
| Style™ | `visual.styleTags[]` |
| Materials™ | `visual.materials[]` |
| Lighting Profile™ | `visual.lightingProfile` |
| Color Palette™ | `visual.colorPalette[]` |
| Environment Tags™ | `visual.environmentTags[]` |
| Creator™ | `identity.creator` |
| Generation Prompt™ | `prompt.canonicalRef` or `prompt.text` |
| Golden Build Version™ | `provenance.goldenBuildVersion` |
| Dependencies™ | `dependencies.*` |
| Reuse Count™ | `usageHistory.reuseCount` |
| Performance Cost™ | `usageHistory.originalGenerationCost` |
| Date Created™ | `provenance.createdAt` |
| Last Used™ | `usageHistory.lastUsedAt` |
| Compatibility Score™ | `scores.lastCompatibility` (computed cache) |

Full schema: [asset-schema.md](../engines/studio-asset-registry/asset-schema.md).

---

## Lifecycle States

| State | Intelligence Behavior |
|-------|----------------------|
| **draft** | Searchable internally · not recommended to founder |
| **approved** | Full reuse candidate |
| **generated** (pending QA) | Low-priority candidate · upgrade path only |
| **deprecated** | Suggest successor · block unless pinned |
| **archived** | Historical · DNA reference only |
| **marketplace** | Entitlement check required |

---

## Search Index

Precomputed indices for sub-100ms candidate retrieval:

```yaml
SearchIndex:
  byCategory: Map<AssetCategory, AssetId[]>
  byDepartment: Map<DepartmentId, AssetId[]>
  byMaterial: Map<string, AssetId[]>
  byLightingProfile: Map<string, AssetId[]>
  byStyle: Map<string, AssetId[]>
  byEnvironmentTag: Map<string, AssetId[]>
  byReuseCategory: Map<string, AssetId[]>
  semanticEmbeddings: AssetId[]          # v2 — vector plane
```

Natural language search spec: [search-system.md](../engines/studio-asset-registry/search-system.md).

---

## Registration Gate

Nothing enters the searchable Registry without:

1. **Approval** (founder or Creative Approval Pipeline™ gate)
2. **Complete metadata** (all required fields)
3. **Dependency resolution** (no broken requires)
4. **Golden Build Version™** stamp when from Golden Build™ / Scene Stack™

Rejected explorations may enter as **alternate branch** records (Founder Taste Engine™) — not promoted to reuse candidates until approved.

---

## Company Memory™ Link

Approved Registry assets are **Company Memory™** artifacts:

- Referenced in Expeditions™ milestones
- Cited in Founder Memory™ (*"approved at Story Table"*)
- Surfaced in Routine Memory™ when journeys reuse environments

See [company-dna.md](./company-dna.md).

---

## Org Scope vs Platform Scope

| Scope | Visibility |
|-------|------------|
| **Organization** | Default search space for founder requests |
| **Platform** | Universal assets (Orb · glass systems · typography) |
| **Marketplace licensed** | Entitled packs only |
| **Published** | Org assets shared to Marketplace (with license) |

Cross-org reuse of custom org assets is **forbidden** without explicit license.

---

_Asset Registry™ — the library Asset Intelligence Engine™ reads._
