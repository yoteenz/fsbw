# Calculation Engine™

**Module:** `studio.production-estimates.v1.calculator`  
**Status:** Estimate computation without provider exposure

---

## Mission

Calculate Production Estimates™ from intelligence signals — **never** from raw provider price tables shown to founders.

---

## Input Signals

```yaml
EstimateRequest:
  orgId: string
  productionLabel: string
  departmentId: string
  stationId: string | null
  layerIds: string[] | null
  blueprintContext: BlueprintContextResponse      # Creative Blueprint Engine™
  intelligenceResponse: IntelligenceResponse      # Asset Intelligence Engine™
  sceneStackManifest: SceneStackManifest | null
  goldenBuildStage: string | null
```

---

## Calculation Pipeline

```
① Resolve production unit scope (station · layer set · department)
         ↓
② Load active Blueprint™ + Systems™
         ↓
③ Run Asset Intelligence reuse classification per item
         ↓
④ Classify each unit:
     reuse | modify | generate
     blueprint inherit | system inherit
         ↓
⑤ Assign production cost units (internal table — abstract)
         ↓
⑥ Sum time from action types + complexity
         ↓
⑦ Compute full-regen hypothetical for savings
         ↓
⑧ Score Production Complexity™
         ↓
⑨ Generate Orb narration from diff + reuse wins
         ↓
⑩ Present Production Estimate™
```

---

## Action → Cost Unit (Internal)

Founder never sees this table. Production studio abstraction:

| Action | Relative Cost Unit | Time Weight |
|--------|-------------------|-------------|
| **System inherit** | 0 | ~0s |
| **Blueprint reuse** | 0.05 | ~2s assembly |
| **Asset reuse** | 0.08 | ~3s link |
| **Asset modify** | 0.35 | ~25–45s |
| **Layer generate** | 0.55 | ~35–70s |
| **Asset generate** | 0.45 | ~30–60s |
| **Landmark generate** | 0.85 | ~60–120s |

Units map to **Estimated Production Cost™** via org-agnostic production rate card (internal config).

**No provider names. No per-model multipliers in founder path.**

---

## Savings Calculation

```yaml
fullRegenScope:
  assume: all items Generate New™
  no blueprint reuse
  no asset intelligence

hypotheticalCost: sum(generate units for full scope)
actualCost: sum(classified line items)
estimatedSavings: hypotheticalCost - actualCost
savingsPercent: estimatedSavings / hypotheticalCost
```

Orb uses `savingsPercent` for narration: *"reduced production cost by 63%"*.

---

## Time Calculation

```
estimatedProductionTimeSeconds =
  sum(lineItem.productionTimeSeconds)
  + queueBuffer(complexity)
  + validationBuffer(complexity)
```

Reuse-heavy estimates → sub-minute times common.

---

## Scene Stack™ Layer Estimates

Per-station estimate iterates layers 01–10:

| Layer | Default action source |
|-------|----------------------|
| environment-shell | Intelligence search |
| signature-landmark | Intelligence + landmark rules |
| lighting-systems | System reuse priority |
| ... | per layer catalog |

Only **failed or missing** layers add generate cost.

---

## Reconciliation (Post-Production)

After Generation Manager™ completes:

```yaml
ProductionActual:
  estimateId: string
  actualProductionCostUsd: number      # internal reconcile
  actualProductionTimeSeconds: number
  variancePercent: number
  founderSummary: string               # "Completed in 2m 08s — on estimate"
```

Founder sees summary — not provider line items.

---

## Forbidden in Calculator Output

| Field | Founder visibility |
|-------|-------------------|
| `providerId` | **Never** |
| `modelRoute` | **Never** |
| `tokenEstimate` | **Never** |
| `apiCostUsd` | **Never** |
| `falJobId` | **Never** |

See [forbidden-exposure.md](./forbidden-exposure.md).

---

_Calculation Engine™ — abstract production math, private routing._
