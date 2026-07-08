# Asset Inventory™

**Engine Module:** `studio.scene-planner.v1.inventory`  
**Status:** Reusable · required · missing classification

---

## Law

> Before generation, Scene Planner™ must know **what the company already owns**, **what the scene requires**, and **what is still missing**.

---

## Three Inventory Buckets

| Bucket | Meaning | Provider job? |
|--------|---------|---------------|
| **reusableAssets** | Registry match — attach existing | No |
| **requiredAssets** | Must exist for assembly — source agnostic | Maybe |
| **missingAssets** | Gap — must generate · modify · or acquire | Yes (when generate) |

Every required asset ends in exactly one resolution path.

---

## Inventory Scan (Per Layer)

```
For each LayerPlan in manifest:
         ↓
Query Asset Registry™ (category + workspace + blueprint + genome)
         ↓
Apply Compatibility Engine™ scores
         ↓
Classify:
  ≥95  → reusableAssets (exact-match)
  85–94 → reusableAssets (close-match) OR missingAssets (modify)
  70–84 → missingAssets (modify)
  <55  → missingAssets (generate-new)
         ↓
Emit requiredAssets for every layer slot
```

Aligns with [Generation Gate™](../studio-asset-registry/generation-gate.md) and [Asset Intelligence generation-order](../../asset-intelligence-engine/generation-order.md).

---

## reusableAssets

Assets the org **already owns** that satisfy a layer slot:

```yaml
ReusableAssetRef:
  registryId: registry:lighting-editorial-rig-v3
  name: Editorial Lighting Rig v3
  category: Lighting™
  layerId: lighting-systems
  role: primary
  compatibilityScore: 97
  matchType: exact-match
  usageCount: 247
  estimatedSavings: 0.42
```

### Reuse Line Item

Exact-match assets become `ReuseLineItem` — no `GenerationLineItem`.

```yaml
ReuseLineItem:
  lineItemId: uuid
  layerId: lighting-systems
  registryId: registry:lighting-editorial-rig-v3
  attachOnly: true
  estimatedSavings: 0.42
```

---

## requiredAssets

Every layer declares **required slots** from Blueprint + workspace template:

```yaml
RequiredAssetRef:
  requirementId: req-furniture-executive-table
  layerId: furniture-story-table
  category: Furniture™
  description: Executive strategy table — holographic card surface
  fulfilledBy: registry-id | generation-line-item | cursor-task | pending
  registryId: registry:story-table-executive-v2 | null
  lineItemId: gen-li-abc | null
  status: fulfilled | pending | blocked
```

| fulfilledBy | When |
|-------------|------|
| `registry-id` | reusableAssets match |
| `generation-line-item` | missingAssets resolved to generate |
| `cursor-task` | Runtime FX™ · Interaction Layer™ |
| `pending` | Inventory scan incomplete |

**Invariant:** When `planStatus: inventory-complete`, no `required` severity slot remains `pending`.

---

## missingAssets

Gaps that require action:

```yaml
MissingAssetRef:
  missingId: miss-atmosphere-editorial-haze
  layerId: atmosphere-editorial
  category: Atmosphere™
  description: Editorial volumetric haze — warm luxury
  severity: required
  resolution: generate-new
  parentRegistryId: null
  lineItemId: gen-li-7d4e9f2a
  packSuggestionId: null
```

### Resolution Types

| resolution | Effect |
|------------|--------|
| `generate-new` | Full GenerationLineItem |
| `modify-parent` | Fork Registry parent · delta job |
| `purchase-pack` | Marketplace Pack™ suggestion — founder acquires |
| `inherit-blueprint` | Blueprint System™ provides asset — no generation |

---

## Inventory Summary (Scene Blueprint root)

```yaml
inventorySummary:
  totalRequired: 13
  totalReusable: 8
  totalMissing: 2
  totalModify: 3
  totalCursorTasks: 2
  reuseRate: 0.62                 # reusable / required
  fulfillmentRate: 1.0            # must be 1.0 before estimate-ready
```

---

## Story Table™ Inventory Example

| Layer | Reusable | Missing | Resolution |
|-------|----------|---------|------------|
| Environment Shell™ | ✓ `registry:env-shell-editorial-v1` | — | reuse |
| Lighting™ | close-match | modify delta | modify-parent |
| Architecture™ | ✓ | — | reuse |
| Furniture™ | — | ✓ | generate-new |
| Hero Landmark™ | ✓ | — | reuse |
| Atmosphere™ | — | ✓ | generate-new |
| Materials™ | ✓ | — | reuse |
| Particles™ | ✓ | — | reuse |
| Interactive Objects™ | modify | — | modify-parent |
| Runtime FX™ | — | — | cursor-task |
| Audio™ | ✓ | — | reuse |
| Camera™ | ✓ | — | reuse (metadata) |

**Totals:** 8 reusable · 3 modify · 2 generate-new · 2 cursor

---

## Pack Suggestions

When `missingAssets` has no Registry match but Pack™ contains candidate:

```yaml
packSuggestion:
  packId: registry:pack-luxury-office-v1
  itemRegistryId: registry:atmosphere-warm-haze-v1
  entitlementRequired: true
  estimatedSavings: 0.31
```

Founder may acquire pack instead of generating — Planner re-runs inventory.

---

## Orb Narration

| Inventory state | Orb says |
|-----------------|----------|
| High reuse | *"Eight compatible assets already in your library — significant savings."* |
| Missing required | *"Two layers need new production — atmosphere and furniture."* |
| Pack available | *"A Marketplace pack includes a matching atmosphere system."* |

---

_Asset Inventory™ — own it, need it, or make it — before a single generation job._
