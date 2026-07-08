# Internal Creative Budget™

**Module:** `studio-alpha.production-dashboard.v1.internal-budget`  
**Status:** Operator-facing budget truth

---

## Distinction from Founder Creative Budgets™

| System | Audience | Shows |
|--------|----------|-------|
| [Creative Budgets™](../../studio-os/creative-budgets/README.md) | Founders | Abstract monthly capacity |
| **Internal Creative Budget** | Studio Alpha™ operators | Actual spend · burn rate · forecast |

Same name family — **different planes**. Never merge UIs.

---

## Internal Budget Panel

```
INTERNAL CREATIVE BUDGET
────────────────────────────────────
Budget Remaining          $12,400.00
Monthly Spend             $4,218.44
Weekly Spend              $1,082.16
Today's Spend             $186.42
────────────────────────────────────
Avg Cost / Department     $1,024.56
Avg Cost / Scene          $207.18
Avg Cost / Layer          $0.38
────────────────────────────────────
Budget Forecast           On track
Projected Completion      $59,642.18
```

---

## Field Definitions

| Field | Definition |
|-------|------------|
| **Budget Remaining** | Internal allocation − actual spend to date |
| **Monthly Spend** | Calendar month GPU + attributed production cost |
| **Weekly Spend** | Rolling 7-day spend |
| **Today's Spend** | UTC day spend |
| **Avg Cost Per Department** | `totalSpend / activeDepartments` |
| **Avg Cost Per Scene** | `totalSpend / scenesWithGeneration` |
| **Avg Cost Per Layer** | `totalSpend / layerGenerationJobs` |
| **Budget Forecast** | On track · at risk · over budget |
| **Projected Completion Cost** | Matches [Main Dashboard](./main-dashboard.md) total estimate |

---

## Forecast Logic

```yaml
BudgetForecast:
  status: on_track | at_risk | over_budget
  burnRateWeeklyUsd: number
  weeksToDepletion: number | null
  projectedOverrunUsd: number | null
  recommendation: string
```

| Status | Trigger |
|--------|---------|
| **On track** | Spend within 10% of plan |
| **At risk** | Burn rate exceeds plan · 2+ weeks |
| **Over budget** | Remaining < estimated remaining production |

---

## Relationship to Production Estimates™

Founder-facing estimates use abstract production dollars.

Internal budget reconciles estimates against **actual GPU cost** from [Generation Analytics](./generation-analytics.md).

```
variance = actualGpuCost - founderEstimateProductionCost
```

Variance visible to operators only — feeds estimate calibration.

---

_Internal Creative Budget™ — operators see truth, founders see capacity._
