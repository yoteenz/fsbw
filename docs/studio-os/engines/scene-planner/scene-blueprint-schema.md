# Scene Blueprint Schema™

**Engine Module:** `studio.scene-planner.v1.schema`  
**Status:** Canonical planning output object

---

## Law

> Scene Planner™ outputs **one** `SceneBlueprint™` per workspace planning session.

> No image generation occurs until this object is approved via Production Estimates™.

---

## Root Schema

```yaml
SceneBlueprint:
  $schema: studio.scene-planner.v1/scene-blueprint.json

  # Identity
  blueprintId: uuid               # Scene Blueprint instance ID (not Creative Blueprint)
  planVersion: string
  planHash: sha256
  plannedAt: ISO8601
  plannerVersion: string          # studio.scene-planner.v1

  # Scope
  orgId: string
  departmentId: string
  workspaceScene: string          # story-table | mood-wall | ...
  sceneId: string
  founderIntentId: uuid | null
  creativeBlueprintId: string     # Creative Blueprint Engine™ ref
  creativeBlueprintVersion: string

  # ─── USER-MANDATED FIELDS ───

  dependencies: LayerDependencyGraph
  reusableAssets: ReusableAssetRef[]
  requiredAssets: RequiredAssetRef[]
  missingAssets: MissingAssetRef[]
  generationOrder: GenerationStage[]
  estimatedCost: ProductionCostEstimate
  estimatedGenerationTime: ProductionTimeEstimate

  # ─── EXTENDED PLANNING ───

  layerManifest: LayerPlan[]
  generationLineItems: GenerationLineItem[]
  reuseLineItems: ReuseLineItem[]
  parallelStages: number
  planStatus: drafting | inventory-complete | estimate-ready | approved | blocked
  blockers: PlanBlocker[]

  # Handoff
  productionEstimateId: string | null
  complexity: low | medium | high | signature
```

---

## dependencies — LayerDependencyGraph

```yaml
LayerDependencyGraph:
  nodes: LayerDependencyNode[]
  edges: LayerDependencyEdge[]

LayerDependencyNode:
  layerId: string
  category: AssetCategory
  generatable: boolean

LayerDependencyEdge:
  from: string                    # dependent layerId
  to: string                      # prerequisite layerId
  type: requires | recommends | blocks-until-approved
  reason: string
```

### Story Table™ Dependency Example

```yaml
edges:
  - { from: lighting-systems, to: environment-shell, type: requires }
  - { from: furniture-story-table, to: environment-shell, type: requires }
  - { from: hero-landmark-story-table, to: architecture-structure, type: requires }
  - { from: atmosphere-editorial, to: lighting-systems, type: recommends }
  - { from: particles-ambient, to: atmosphere-editorial, type: requires }
  - { from: runtime-fx-story-table, to: lighting-systems, type: blocks-until-approved }
  - { from: camera-orbiting-strategy, to: environment-shell, type: requires }
```

---

## reusableAssets

Registry matches — **zero new generation** for these slots:

```yaml
ReusableAssetRef:
  registryId: string
  name: string
  category: AssetCategory
  layerId: string                 # which layer consumes
  role: primary | style-anchor | dependency
  compatibilityScore: number      # 0–100
  matchType: exact-match | close-match
  usageCount: number
  estimatedSavings: number        # abstract production $
```

---

## requiredAssets

Assets that **must** exist for scene assembly — whether reused or generated:

```yaml
RequiredAssetRef:
  requirementId: string
  layerId: string
  category: AssetCategory
  description: string
  fulfilledBy: registry-id | generation-line-item | cursor-task | pending
  registryId: string | null
  lineItemId: string | null
  status: fulfilled | pending | blocked
```

---

## missingAssets

Gaps requiring generation · pack purchase · or Blueprint inheritance:

```yaml
MissingAssetRef:
  missingId: string
  layerId: string
  category: AssetCategory
  description: string
  severity: required | recommended | optional
  resolution: generate-new | modify-parent | purchase-pack | inherit-blueprint
  parentRegistryId: string | null
  lineItemId: string | null       # assigned when plan completes
  packSuggestionId: string | null
```

When `missingAssets` is empty for all `required` severity → inventory complete.

---

## generationOrder

Topological stages — layers within a stage may run in parallel:

```yaml
GenerationStage:
  stageIndex: number
  stageName: string               # e.g. shell · hero · surface · ambient · cursor
  layerIds: string[]
  parallelizable: boolean
  estimatedStageCost: number
  estimatedStageTimeSeconds: number
  dependsOnStages: number[]
```

### Story Table™ Generation Order

```yaml
generationOrder:
  - stageIndex: 1
    stageName: foundation
    layerIds: [environment-shell, architecture-structure, camera-orbiting-strategy]
    parallelizable: false
    dependsOnStages: []
  - stageIndex: 2
    stageName: hero-structure
    layerIds: [hero-landmark-story-table, furniture-story-table]
    parallelizable: true
    dependsOnStages: [1]
  - stageIndex: 3
    stageName: surface-light
    layerIds: [lighting-systems, materials-surface]
    parallelizable: true
    dependsOnStages: [1]
  - stageIndex: 4
    stageName: atmosphere
    layerIds: [atmosphere-editorial, particles-ambient, audio-ambient-story-table]
    parallelizable: true
    dependsOnStages: [3]
  - stageIndex: 5
    stageName: interaction-visual
    layerIds: [interactive-holographic-cards]
    parallelizable: false
    dependsOnStages: [2, 3]
  - stageIndex: 6
    stageName: cursor-runtime
    layerIds: [runtime-fx-story-table, interaction-layer-story-table]
    parallelizable: true
    dependsOnStages: [5]
    # generatable: false — Cursor tasks only
```

---

## estimatedCost

```yaml
ProductionCostEstimate:
  totalEstimatedCost: number      # abstract production $ (founder-facing)
  newGenerationCost: number
  modificationCost: number
  reuseSavings: number
  currency: production-dollar     # never API tokens
  breakdown:
    byLayer: Record<layerId, number>
    byCategory: Record<category, number>
  confidence: high | medium | low
```

Rolls up to [Production Estimates™](../../studio-production-estimates/README.md).

---

## estimatedGenerationTime

```yaml
ProductionTimeEstimate:
  totalSeconds: number
  display: string                 # e.g. "2m 12s"
  breakdown:
    byStage: Record<stageIndex, number>
    byLayer: Record<layerId, number>
  parallelReductionSeconds: number  # saved by parallel stages
  criticalPathSeconds: number
```

---

## reuseLineItems

```yaml
ReuseLineItem:
  lineItemId: uuid
  layerId: string
  registryId: string
  matchType: exact-match
  estimatedSavings: number
  attachOnly: true                # no provider job
```

---

## Plan Status Lifecycle

```
drafting
    ↓ inventory scan per layer
inventory-complete
    ↓ cost/time rollup
estimate-ready
    ↓ founder Approve Production™
approved
    ↓ handoff to Prompt Composer™ + Generation Manager™
```

`blocked` — unresolved required missing assets or circular deps.

---

## CDS Story Table™ Reference Estimate

```yaml
estimatedCost:
  totalEstimatedCost: 2.48
  reuseSavings: 4.86
  newGenerationCost: 1.12
  modificationCost: 1.36

estimatedGenerationTime:
  totalSeconds: 132
  display: "2m 12s"

reusableAssets: 8
missingAssets: 2        # after resolution → GenerationLineItems
requiredAssets: 13      # all layers accounted
```

Matches [Production Estimates™ CDS example](../../studio-production-estimates/README.md).

---

_Scene Blueprint Schema™ — the construction document before the first commission._
