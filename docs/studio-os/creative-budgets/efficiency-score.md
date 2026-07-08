# Efficiency Score™

**Module:** `studio.creative-budgets.v1.efficiency`  
**Status:** Reuse performance index

---

## Principle

> **Efficiency Score™** rewards intelligent creative production — the most efficient headquarters should also become the most visually consistent.

---

## What Efficiency Measures

| Included | Excluded |
|----------|----------|
| Asset reuse rate | Founder review time |
| Blueprint/System inheritance | Post-production manual edits |
| Savings vs hypothetical full generate | Platform subscription fees |
| Registry investment compounding | Marketplace purchase price |

---

## Formula (v1)

```
Efficiency Score™ = round(
  0.40 × reuseRateScore +
  0.30 × savingsRateScore +
  0.20 × blueprintInheritanceScore +
  0.10 × maturityBonusScore
)

All sub-scores: 0–100
Final: 0–100 (displayed as percent)
```

### Sub-Score Definitions

#### Reuse Rate Score

```
reuseRate = assetsReused / max(assetsTouched, 1)
assetsTouched = assetsReused + assetsModified + newAssetsGenerated

reuseRateScore = min(100, reuseRate × 125)
```

Caps at 100 when reuse dominates production mix.

#### Savings Rate Score

```
savingsRate = creativeSavingsUsd / max(hypotheticalFullCostUsd, 1)
hypotheticalFullCostUsd = spentUsd + creativeSavingsUsd

savingsRateScore = min(100, savingsRate × 100)
```

Aligns with [Studio Production Estimates™ savings model](../studio-production-estimates/savings-model.md).

#### Blueprint Inheritance Score

```
inheritanceRate = blueprintSystemsReused / max(productionsCompleted, 1)
blueprintInheritanceScore = min(100, inheritanceRate × 20)
```

Rewards Blueprint discipline — each production inheriting systems raises score.

#### Maturity Bonus Score

Derived from [Living Company Genome™](../living-company-genome/README.md) + [Asset Intelligence](../asset-intelligence-engine/README.md) registry depth:

| Signal | Bonus |
|--------|-------|
| Registry asset count growth (month) | +0–40 |
| Repeat blueprint reuse across departments | +0–30 |
| Declining new-asset ratio vs prior month | +0–30 |

`maturityBonusScore = sum(bonuses)` capped at 100.

---

## Example (Canonical Dashboard)

Given:

- Spent: $41.72
- Creative Savings: $137.55
- Assets Reused: 482 (high registry leverage)
- Blueprint Systems Reused: 118
- Mature headquarters with strong genome

**Efficiency Score™: 94%**

Orb: *"This headquarters has become significantly more efficient as it has matured."*

---

## Score Bands

| Score | Label | Orb tone |
|-------|-------|----------|
| 90–100 | **Signature Efficiency** | Celebrate · cite Blueprint wins |
| 75–89 | **Strong** | Encourage more reuse paths |
| 60–74 | **Developing** | Suggest Apply Existing™ |
| 40–59 | **Building** | Coach registry investment |
| < 40 | **Early** | Normalize · show savings potential |

Never shame. Always coach.

---

## Consistency Corollary

High Efficiency Score™ correlates with:

- Fewer one-off visual decisions
- Stronger inherited Blueprint language
- Lower `newAssetsGenerated` ratio
- Higher cross-department visual coherence

Efficiency → consistency is a **design goal**, not a guaranteed metric in v1.

---

## Recalculation Triggers

| Event | Recalculate |
|-------|-------------|
| Production completed | Yes |
| Estimate cancelled | Yes (pending only) |
| Period reset | Yes (fresh baseline) |
| Registry bulk import | Maturity bonus only |

---

_Efficiency Score™ — Creative Director performance, not API optimization._
