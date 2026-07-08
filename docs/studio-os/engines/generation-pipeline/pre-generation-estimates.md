# Pre-Generation Estimates™

**Engine Module:** `studio.generation-pipeline.v1.estimates`  
**Status:** Mandatory quote before Generation Queue™

---

## Law

> The pipeline must estimate **generation cost · generation time · provider usage · reusable asset savings** before generation begins.

> **No provider execution until founder approves the estimate.**

---

## Estimate Gate Position

```
Missing Assets™ (resolved)
         ↓
★ PRE-GENERATION ESTIMATE ★
         ↓
Founder Approve / Reject
         ↓
Provider Optimizer™ → Generation Queue™
```

---

## Estimate Object

```yaml
PreGenerationEstimate:
  estimateId: uuid
  pipelineRunId: uuid
  sceneBlueprintId: uuid
  workspaceScene: string

  # Founder-facing (required)
  generationCost: ProductionCostEstimate
  generationTime: ProductionTimeEstimate
  reusableSavings: SavingsEstimate

  # Internal (Studio Alpha™ only)
  providerUsage: ProviderUsageEstimate

  # Summary
  complexity: low | medium | high | signature
  reuseRate: number               # 0–1
  newLayers: number
  modifiedLayers: number
  reusedLayers: number
  orbNarration: string
```

---

## generationCost

Abstract production dollars — **never** API tokens or GPU pricing.

```yaml
ProductionCostEstimate:
  totalEstimatedCost: number      # e.g. 2.48
  newGenerationCost: number
  modificationCost: number
  reuseSavings: number            # duplicated in savings block
  breakdownByLayer: Record<layerId, number>
  currency: production-dollar
```

Rolls up from [Scene Planner production-estimate-handoff](../scene-planner/production-estimate-handoff.md).

---

## generationTime

```yaml
ProductionTimeEstimate:
  totalSeconds: number
  display: string                 # "2m 12s"
  criticalPathSeconds: number
  breakdownByLayer: Record<layerId, number>
  parallelReductionSeconds: number
```

Critical path respects layer-by-layer dependencies.

---

## providerUsage (Internal)

Founder **never** sees provider details. Studio Alpha™ operators see:

```yaml
ProviderUsageEstimate:
  byLayer:
    - layerId: string
      preferredFamilies: string[]
      selectedProvider: string | null    # post-optimizer
      selectedModel: string | null
      estimatedCredits: number | null
      estimatedUsd: number | null
  totalProviders: string[]
  primaryProvider: string
  fallbackProviders: string[]
```

Populated after Provider Optimizer™ dry-run (no execution).

---

## reusableSavings

```yaml
SavingsEstimate:
  totalSavings: number            # e.g. 4.86
  assetsReused: number            # e.g. 8
  assetsModified: number          # e.g. 3
  assetsGenerated: number         # e.g. 2
  blueprintSystemsReused: number
  byLayer: Record<layerId, number>
  orbExplanation: string
```

Orb: *"Eight compatible assets reused — saving $4.86 in production value."*

---

## CDS Story Table™ Reference

```
Estimated Production Cost     $2.48
Estimated Production Time     2m 12s
Assets Reused                 8
Assets Modified               3
New Assets Generated          2
Estimated Savings             $4.86
Complexity                    Medium
Reuse Rate                    62%
```

---

## Approval Flow

```yaml
EstimateApproval:
  estimateId: uuid
  approved: boolean
  approvedAt: ISO8601 | null
  rejectedReason: string | null
  budgetReservationId: string   # Creative Budgets™
```

| approved | Pipeline action |
|----------|-----------------|
| `true` | Unlock Provider Optimizer™ + Generation Queue™ |
| `false` | Return to Missing Assets™ or Scene Planner™ |

---

## Partial Estimate (Layer Regen)

Single-layer regeneration produces reduced estimate:

```yaml
partialEstimate:
  totalEstimatedCost: 0.18
  totalSeconds: 22
  scopeLabel: "Lighting layer regeneration"
  reusableSavings: 0.00
```

Same gate rules apply — approve before re-queue.

---

## Creative Budgets™ Integration

Before approval display:

```yaml
BudgetContext:
  monthlyRemaining: number
  thisEstimateCost: number
  pendingReserve: number
  sufficient: boolean
```

Insufficient → Orb coaching · no queue unlock.

---

## Re-Estimate Triggers

| Event | Re-estimate required |
|-------|---------------------|
| Founder Reuse Existing override | Yes |
| Create Variation | Yes |
| Scene Planner revision | Yes |
| Regenerate with new scope | Yes |
| Provider health failover (pre-queue) | Optional internal |

---

_Pre-Generation Estimates™ — know the production before the cameras roll._
