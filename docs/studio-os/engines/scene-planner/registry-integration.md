# Registry Integration™

**Engine Module:** `studio.scene-planner.v1.registry`  
**Status:** Remember-first at plan phase

---

## Law

> Scene Planner™ queries [Asset Registry™](../studio-asset-registry/README.md) **per layer** during inventory — before Production Estimates™ and before Prompt Composer™.

> Planning and generation share the same remember-first discipline.

---

## Integration Points

| Phase | Registry action |
|-------|-----------------|
| **Inventory scan** | Search per layer · category · workspace · blueprint |
| **Reuse classification** | Populate `reusableAssets` |
| **Gap detection** | Populate `missingAssets` |
| **Dependency edges** | Load [Dependency Graph](../studio-asset-registry/dependency-graph.md) |
| **Post-approval** | Auto-register new assets (downstream) |

Scene Planner does **not** write Registry — it reads and classifies.

---

## Per-Layer Registry Query

```yaml
LayerRegistryQuery:
  orgId: string
  layerId: string
  category: AssetCategory
  workspaceScene: string
  departmentId: string
  blueprintId: string
  genomeHash: sha256
  reuseCategory: string | null
  materials: string[]
  lightingProfile: string | null
  tags: string[]
  minCompatibilityScore: number   # default 70
```

Extends [Generation Gate™ query](../studio-asset-registry/generation-gate.md) with layer-specific context.

---

## Search Dimensions

| Dimension | Source |
|-----------|--------|
| Category | LayerPlan.category |
| Workspace | SceneBlueprint.workspaceScene |
| Department | SceneBlueprint.departmentId |
| Blueprint | Creative Blueprint Engine™ |
| Genome | Company Genome™ snapshot |
| Reuse category | Blueprint System™ · Design Registry™ |
| Style tags | Founder intent · Visual DNA™ |

---

## Outcome → LayerPlan

| Registry outcome | LayerPlan.reuseResolution | Bucket |
|------------------|---------------------------|--------|
| Exact Match™ ≥95 | `exact-match` | reusableAssets |
| Close Match™ 85–94 | `close-match` or `modify` | reusableAssets or missingAssets |
| Can Be Modified™ 70–84 | `modify` | missingAssets |
| Generate New™ <55 | `generate-new` | missingAssets |

Founder Control Gate™ may override at estimate presentation — Planner records choice in `LayerPlan`.

---

## Prompt Library Fragments

Registry [Prompt Library](../studio-asset-registry/prompt-library.md) informs planning:

| Fragment role | Planner use |
|---------------|-------------|
| `prompt.recipe` | Suggest assembly path for layer |
| `prompt.template` | Golden template exists → higher reuse confidence |
| `prompt.fragment` | Style anchor for missing asset description |

Fragments do **not** become prompts here — Prompt Composer™ consumes later.

---

## Generation Gate™ Relationship

| Engine | Gate timing |
|--------|-------------|
| Scene Planner™ | Plan-phase inventory (this doc) |
| Generation Gate™ | Pre-enqueue hard block |
| Asset Intelligence Engine™ | Founder-facing explain + control |

Planner inventory **feeds** Generation Gate — duplicate search is cached by `registrySearchId`.

```yaml
RegistrySearchCache:
  searchId: uuid
  layerId: string
  results: RegistrySearchResult[]
  cachedAt: ISO8601
  ttlSeconds: 3600
```

Generation Gate reuses cache if `planHash` unchanged.

---

## Cross-Workspace Reuse

Planner may recommend asset from sibling workspace:

```yaml
CrossWorkspaceReuse:
  registryId: registry:lighting-editorial-rig-v3
  sourceWorkspace: mood-wall
  targetWorkspace: story-table
  compatibilityScore: 91
  orbExplanation: "Same editorial lighting rig used in Mood Wall™ — compatible."
```

[Compatibility Engine™](../../asset-intelligence-engine/compatibility-engine.md) scores cross-context reuse.

---

## Pack Entitlement

Registry Pack™ items included in search when org entitled:

```yaml
PackSearchScope:
  entitledPacks: string[]
  includeMarketplacePreview: boolean   # suggest only — not auto-use
```

Unentitled pack matches → `packSuggestionId` on missingAssets — not auto-reuse.

---

## Audit

```yaml
PlannerRegistryAudit:
  sceneBlueprintId: uuid
  searchesRun: number
  totalCandidates: number
  reuseRate: number
  searchesByLayer: Record<layerId, RegistrySearchSummary>
```

Studio Alpha™ internal — supports ROI analytics.

---

_Registry Integration™ — the library consulted before the blueprint is signed._
