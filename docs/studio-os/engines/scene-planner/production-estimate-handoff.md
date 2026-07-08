# Production Estimate Handoff™

**Engine Module:** `studio.scene-planner.v1.estimate-handoff`  
**Status:** Cost · time · complexity rollup contract

---

## Law

> Scene Planner™ supplies the **scope** — [Production Estimates™](../../studio-production-estimates/README.md) presents the **quote**.

> No generation until founder **Approve Production™**.

---

## Handoff Flow

```
Scene Planner™ completes inventory
         ↓
Rollup estimatedCost + estimatedGenerationTime
         ↓
Emit SceneBlueprint (planStatus: estimate-ready)
         ↓
Production Estimates™ formats founder-facing quote
         ↓
Creative Budgets™ reserves capacity
         ↓
Founder Approve Production™
         ↓
SceneBlueprint.planStatus: approved
         ↓
Prompt Composer™ + Generation Manager™
```

---

## Input to Production Estimates™

```yaml
EstimateRequest:
  sceneBlueprintId: uuid
  orgId: string
  departmentId: string
  workspaceScene: string
  founderIntentId: uuid | null

  scope:
    layerCount: number
    generatableLayerCount: number
    reuseLineItems: ReuseLineItem[]
    generationLineItems: GenerationLineItem[]
    missingAssets: MissingAssetRef[]

  cost:
    totalEstimatedCost: number
    newGenerationCost: number
    modificationCost: number
    reuseSavings: number
    breakdownByLayer: Record<layerId, number>

  time:
    totalSeconds: number
    criticalPathSeconds: number
    display: string
    breakdownByStage: Record<stageIndex, number>

  complexity: low | medium | high | signature
  reuseRate: number
```

---

## Cost Rollup Rules

| Line item type | Cost formula (abstract) |
|----------------|-------------------------|
| `exact-match` reuse | $0.00 new gen · savings = golden asset value |
| `modify` | 40–60% of full layer cost |
| `generate-new` | Full layer cost from complexity table |
| Cursor tasks | Internal cost · often $0 founder-facing |

**Never** expose GPU tokens · API pricing · provider invoices.

---

## Complexity Derivation

```yaml
ComplexityRules:
  low:
    maxNewLayers: 1
    maxModifyLayers: 2
    noSignatureBlueprint: true
  medium:
    maxNewLayers: 3
    maxModifyLayers: 5
  high:
    maxNewLayers: 6
    fullStackRegen: false
  signature:
    fullWorkspaceGoldenBuild: true
    heroLandmarkNew: true
```

Story Table™ example: 2 new · 3 modify · 8 reuse → **Medium**.

---

## Time Rollup Rules

```yaml
TimeRollup:
  perLayerSeconds:
    Environment Shell™: 45
    Lighting™: 22
    Architecture™: 35
    Furniture™: 28
    Hero Landmark™: 30
    Atmosphere™: 18
    Materials™: 20
    Particles™: 12
    Interactive Objects™: 25
    Audio™: 15
    Camera™: 5
  parallelReduction: min(stageTimes) per parallel stage
  criticalPath: longest dependent chain
```

`estimatedGenerationTime.display` = human-readable (e.g. `"2m 12s"`).

---

## Founder-Facing Estimate (Output)

Production Estimates™ transforms Scene Blueprint into:

```
Production Estimate™ — Story Table™

Estimated Cost        $2.48
Estimated Time        2m 12s
Assets Reused         8
Assets Modified       3
Assets Generated      2
Estimated Savings     $4.86
Complexity            Medium

Orb: "We already own compatible lighting and materials.
     Only atmosphere and furniture need new production."
```

---

## Approval Callback

```yaml
EstimateApproval:
  productionEstimateId: string
  sceneBlueprintId: uuid
  approvedAt: ISO8601
  approvedBy: founder
  budgetReservationId: string     # Creative Budgets™
```

Sets `SceneBlueprint.planStatus: approved` · attaches `productionEstimateId` to all `GenerationLineItem`s.

---

## Rejection / Revision

| Founder action | Planner response |
|----------------|------------------|
| Reject estimate | `planStatus: inventory-complete` — revise scope |
| Request fewer layers | Partial replan — remove layers |
| Force Generate New™ | Override reuseResolution · re-rollup cost |
| Acquire pack | Re-run inventory · new estimate |

---

## Creative Budgets™ Gate

Before enqueue, Creative Budgets™ verifies:

```yaml
BudgetCheck:
  monthlyRemaining: number
  pendingReserve: number
  thisEstimateCost: number
  approved: boolean
```

Insufficient budget → pause · Orb coaching — not provider failure.

---

## Downstream IDs

After approval, every downstream job carries:

```yaml
ProductionContext:
  sceneBlueprintId: uuid
  productionEstimateId: string
  planHash: sha256
  workspaceScene: string
```

Prompt Composer™ · Generation Manager™ · Registry auto-register all reference these IDs.

---

_Production Estimate Handoff™ — scope planned, quote approved, then cameras roll._
