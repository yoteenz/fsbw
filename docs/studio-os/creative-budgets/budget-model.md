# Creative Budget™ Model

**Module:** `studio.creative-budgets.v1.budget-model`  
**Status:** Founder-facing schema

---

## Creative Budget™ Card (Founder-Facing)

Primary surface: Mission Control strip · Headquarters financial wing · pre-production gate.

```
┌─────────────────────────────────────────┐
│  CREATIVE BUDGET™          March 2026   │
├─────────────────────────────────────────┤
│  Monthly Budget™        $250.00         │
│  Spent                  $41.72          │
│  Estimated Pending™     $28.14            │
│  Available              $180.14         │
├─────────────────────────────────────────┤
│  Saved Through Reuse    $137.55         │
│  Efficiency Score™      94%             │
├─────────────────────────────────────────┤
│  Assets Reused™         482             │
│  Blueprint Systems™     118             │
├─────────────────────────────────────────┤
│  Completed (month)      12                │
│  Pending                3               │
└─────────────────────────────────────────┘
```

---

## Field Definitions

### Capacity Fields

| Field | Type | Definition |
|-------|------|------------|
| **Monthly Budget™** | `usd` | Total creative production capacity allocated for the period |
| **Spent** | `usd` | Sum of `estimatedProductionCostUsd` from **completed** approved productions |
| **Estimated Pending™** | `usd` | Sum of approved estimates for productions not yet complete |
| **Available** | `usd` | `monthlyBudget − spent − estimatedPending` (floor 0 for display) |

### Savings Fields

| Field | Type | Definition |
|-------|------|------------|
| **Creative Savings™** | `usd` | Cumulative `estimatedSavingsUsd` from completed productions this month |
| **Saved Through Reuse** | `usd` | Founder-facing label for Creative Savings™ on dashboard |
| **Savings %** | `percent` | `creativeSavings / hypotheticalFullCost` for the month |

### Efficiency Fields

| Field | Type | Definition |
|-------|------|------------|
| **Efficiency Score™** | `0–100` | Composite reuse + blueprint + savings performance |
| **Assets Reused™** | `count` | Registry exact + modify reuse events (month) |
| **Blueprint Systems Reused™** | `count` | Blueprint + System™ inheritance applications (month) |

### Production Count Fields

| Field | Type | Definition |
|-------|------|------------|
| **Monthly Production™** | `count` | Productions completed in period |
| **Pending Productions™** | `count` | Productions approved · queued · in progress |
| **Completed Productions™** | `count` | Same as monthly in period view; lifetime in history view |

---

## Tracked Metrics (Engine Inventory)

Per sprint mission, Creative Budgets™ explicitly tracks:

| Track | Maps To |
|-------|---------|
| Estimated Production Spend™ | `spentUsd` |
| Creative Savings™ | `creativeSavingsUsd` |
| Blueprint Reuse™ | `blueprintSystemsReused` (blueprint + system events) |
| Asset Reuse™ | `assetsReused` |
| Monthly Production™ | `monthlyProduction` |
| Pending Productions™ | `pendingProductions` + `estimatedPendingUsd` |
| Completed Productions™ | `monthlyProduction` (period) |

---

## Per-Production Ledger Entry

Each approved estimate creates a budget ledger row:

```yaml
CreativeBudgetLedgerEntry:
  entryId: string
  orgId: string
  periodMonth: string
  productionEstimateId: string
  productionLabel: string
  status: reserved | in_progress | completed | cancelled | revised
  estimatedCostUsd: number
  actualCostUsd: number | null
  estimatedSavingsUsd: number
  assetsReused: number
  blueprintSystemsReused: number
  completedAt: ISO8601 | null
```

### Status Transitions

```
reserved        → founder approved estimate
in_progress     → Generation Manager™ started
completed       → production certified · Spent += actualCost
cancelled       → founder cancelled · Pending released
revised         → new estimate supersedes · old entry closed
```

---

## Budget Gate Rules

| Condition | Behavior |
|-----------|----------|
| `available ≥ estimate.cost` | Allow approval |
| `available < estimate.cost` | Soft gate — Orb suggests reuse revision or scope reduction |
| `available = 0` | Hard gate — no new approvals until period reset or budget increase |
| Over-budget historical | Never retroactive penalty — coach forward |

---

## Display Precision

| Field | Format |
|-------|--------|
| USD amounts | 2 decimal places · no provider breakdown |
| Efficiency Score™ | Whole percent · no decimals in primary card |
| Counts | Integer · no fractional assets |

---

_Budget Model™ — one card, studio economics._
