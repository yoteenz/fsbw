# Savings Rollup™

**Module:** `studio.creative-budgets.v1.savings-rollup`  
**Status:** Monthly Creative Savings™ aggregation

---

## Principle

> **Creative Savings™** proves reuse intelligence has monthly production value — rolled up from every approved Production Estimate™.

---

## Source of Truth

Each completed production contributes:

```yaml
from ProductionEstimate:
  estimatedSavingsUsd
  breakdown:
    assetsReused
    blueprintsReused
    systemsReused
```

See [Studio Production Estimates™](../studio-production-estimates/savings-model.md).

---

## Monthly Rollup

```
creativeSavingsUsd = Σ completedProduction.estimatedSavingsUsd

assetsReused = Σ completedProduction.breakdown.assetsReused
             + Σ completedProduction.breakdown.assetsModified  # partial reuse credit

blueprintSystemsReused = Σ (blueprintsReused + systemsReused)
```

**Saved Through Reuse** on dashboard = `creativeSavingsUsd`.

---

## Hypothetical Full Cost (Month)

```
hypotheticalFullCostUsd = spentUsd + creativeSavingsUsd

savingsPercent = creativeSavingsUsd / hypotheticalFullCostUsd
```

Used for Efficiency Score™ and Orb narration thresholds.

---

## Per-Category Savings (Future Display)

| Category | Rollup source |
|----------|---------------|
| **Asset Reuse™** | `action: reuse` line items |
| **Blueprint Reuse™** | blueprint inheritance line items |
| **Modify vs Generate™** | `action: modify` delta savings |
| **System Inheritance™** | coordinated Systems™ carry-over |

v1 dashboard shows aggregate **Saved Through Reuse** — category drill-down in v1.2.

---

## Orb Savings Thresholds

| Monthly savings | Orb emphasis |
|-----------------|--------------|
| ≥ $100 | Lead with dollar win |
| $25–$99 | Balanced reuse story |
| < $25 | Encourage Apply Existing™ · registry growth |

### Canonical Example

> *"You've saved approximately $87 this month by reusing existing Blueprints."*

Derived from `creativeSavingsUsd` with friendly rounding for speech.

---

## Relationship to Asset Intelligence

[Asset Intelligence Engine™](../asset-intelligence-engine/README.md) generates per-estimate savings.

Creative Budgets™ **aggregates** — never recalculates provider math.

---

## Relationship to Founder Taste Genome™

When [Founder Taste Engine™](../asset-intelligence-engine/founder-taste-engine.md) tightens reuse floors:

- More estimates classify as reuse
- Monthly Creative Savings™ increases
- Orb: *"Your Founder Taste Genome is helping reduce unnecessary production."*

---

## History Archive

At period end:

```yaml
CreativeBudgetHistoryMonth:
  month: YYYY-MM
  spentUsd
  creativeSavingsUsd
  efficiencyScore
  assetsReused
  blueprintSystemsReused
  monthlyProduction
```

Powers maturity coaching across months.

---

_Savings Rollup™ — reuse wins compound monthly._
