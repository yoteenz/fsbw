# Layer Plan Spec™

**Engine Module:** `studio.scene-planner.v1.layer-plan`  
**Status:** Per-layer planning unit

---

## Purpose

Each production layer receives one **`LayerPlan™`** inside the Scene Blueprint™. Layer plans are the atomic units of independent generation and regeneration.

---

## LayerPlan Schema

```yaml
LayerPlan:
  layerId: string
  layerIndex: number              # 01–12 canonical order
  category: AssetCategory         # Environment Shell™ · Lighting™ · etc.
  displayName: string

  # Planning state
  planStatus: pending | inventory-complete | blocked | ready
  generatable: boolean            # false for Cursor-only layers
  owner: provider | cursor | metadata

  # Registry resolution (per layer)
  reuseResolution: exact-match | close-match | modify | generate-new | skip
  registrySearchId: string | null
  registryItemId: string | null   # if reuse
  parentRegistryId: string | null # if modify fork

  # Asset slots
  requiredAssetIds: string[]      # must resolve
  assignedAssetIds: string[]      # resolved refs
  missingAssetSlots: MissingAssetSlot[]

  # Dependencies
  dependsOnLayers: string[]       # layerIds — hard
  recommendsLayers: string[]      # layerIds — soft
  blockedBy: string[]             # unresolved layerIds

  # Generation
  generationLineItemId: string | null
  parallelGroup: number           # same group = may run concurrently
  estimatedLayerCost: number    # abstract production $
  estimatedLayerTimeSeconds: number

  # Blueprint
  blueprintSystemId: string | null
  workspaceRuleRef: string | null

  # Quality
  qualityTier: draft | standard | editorial-luxury | golden-build
  layerIsolation: boolean         # must not bleed
```

---

## reuseResolution Values

| Value | Meaning | Downstream |
|-------|---------|------------|
| `exact-match` | Registry asset satisfies layer | No GenerationLineItem · link only |
| `close-match` | Modify path | Partial GenerationLineItem |
| `modify` | Duplicate & Modify™ | Fork + delta job |
| `generate-new` | No suitable asset | Full GenerationLineItem |
| `skip` | Cursor layer or not applicable | No provider job |

Set after per-layer [Registry integration](./registry-integration.md) search.

---

## MissingAssetSlot

```yaml
MissingAssetSlot:
  slotId: string
  category: AssetCategory
  description: string
  severity: required | recommended | optional
  suggestedReuseCategory: string | null
  resolution: generate | purchase-pack | inherit-blueprint | defer
```

Feeds `missingAssets` on Scene Blueprint™ root.

---

## GenerationLineItem (Emitted)

When `reuseResolution` ∈ `{close-match, modify, generate-new}`:

```yaml
GenerationLineItem:
  lineItemId: uuid
  layerPlanId: string             # layerId
  category: AssetCategory
  reuseResolution: string
  blueprintId: string
  workspaceScene: string
  sceneId: string
  registryRefs: RegistryRef[]
  productionEstimateId: string    # set after estimate approval
  modifySpec: ModifySpec | null
```

Handoff → [Prompt Composer™](../prompt-composer/README.md).

---

## Example — Story Table™ Lighting Layer

```yaml
LayerPlan:
  layerId: lighting-systems
  layerIndex: 2
  category: Lighting™
  displayName: Editorial Story Table Lighting
  planStatus: ready
  generatable: true
  owner: provider
  reuseResolution: close-match
  registryItemId: registry:lighting-editorial-rig-v3
  parentRegistryId: registry:lighting-editorial-rig-v3
  dependsOnLayers: [environment-shell]
  parallelGroup: 2
  estimatedLayerCost: 0.18
  estimatedLayerTimeSeconds: 22
  qualityTier: editorial-luxury
  layerIsolation: true
  generationLineItemId: gen-li-8f3a2b1c
```

---

## Cursor-Only LayerPlan

```yaml
LayerPlan:
  layerId: runtime-fx-story-table
  category: Runtime FX™
  generatable: false
  owner: cursor
  reuseResolution: skip
  dependsOnLayers:
    - lighting-systems
    - furniture-story-table
    - interactive-holographic-cards
  planStatus: blocked             # until visual layers approved
```

---

## Validation Rules

| Check | Fail action |
|-------|-------------|
| `dependsOnLayers` unresolved | `planStatus: blocked` |
| Required slot missing + no resolution | Block Scene Blueprint™ |
| `generatable: true` + no line item when generate-new | Plan error |
| Circular layer dependency | **Compose error** — reject plan |

---

_Layer Plan Spec™ — one layer, one plan, one independent future._
