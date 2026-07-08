# Creative Efficiency™

**Module:** `studio.creative-portfolio.v1.efficiency`  
**Status:** How intelligently the portfolio produces and reuses

---

## Principle

> **Creative Efficiency™** measures whether the company creates **wealth** per unit of production — not whether it generates the most.

Aligns with [Creative Budgets™](../creative-budgets/README.md) monthly efficiency — but **lifetime portfolio scope**.

---

## Metrics

| Metric | Definition |
|--------|------------|
| **Generation Cost Savings™** | Lifetime cumulative reuse savings |
| **Reuse Rate™** | `reused / (reused + modified + new)` |
| **Blueprint Utilization™** | Active blueprints / total blueprints |
| **Asset Reuse™** | Average reuse per active asset |
| **Production Speed™** | Median time estimate → complete |
| **Approval Speed™** | Median complete → approved |
| **Golden Build Success™** | Departments reaching Golden Build / attempted |
| **Average Iterations™** | Regenerations per approved asset (lower = better) |

---

## Efficiency Score

```
creativeEfficiency = round(
  0.25 × reuseRateScore +
  0.20 × savingsScore +
  0.15 × blueprintUtilizationScore +
  0.15 × goldenBuildSuccessScore +
  0.10 × productionSpeedScore +
  0.10 × approvalSpeedScore +
  0.05 × iterationEfficiencyScore
)
```

Display: **0–100** on Portfolio Overview.

---

## Orb Examples

> *"You've reduced creative production costs by 68% through Blueprint reuse."*

> *"Your reuse rate is among the strongest signals in your portfolio this quarter."*

---

## Distinction from Monthly Efficiency

| Metric | Horizon |
|--------|---------|
| [Efficiency Score™](../creative-budgets/efficiency-score.md) | Monthly · Creative Budgets™ |
| **Creative Efficiency™** | Lifetime · Creative Portfolio™ |

Monthly efficiency feeds portfolio efficiency — portfolio never resets when budget does.

---

## Anti-Reward

Efficiency does **not** reward:

- Raw generation volume
- Uncertified draft accumulation
- Redundant duplicate assets

---

_Creative Efficiency™ — intelligent production compounds._
