# Monthly Cycle™

**Module:** `studio.creative-budgets.v1.monthly-cycle`  
**Status:** Period allocation and reset rules

---

## Principle

> Every company receives a **monthly** Creative Budget™ — aligned to creative studio planning cycles, not real-time API metering.

---

## Period Definition

```yaml
CreativeBudgetPeriod:
  month: YYYY-MM
  timezone: org.headquartersTimezone | UTC
  periodStart: first day 00:00:00
  periodEnd: last day 23:59:59
```

Founder dashboard always shows **current period** with month label.

---

## Monthly Budget™ Allocation

| Source | Default behavior |
|--------|------------------|
| **Headquarters License tier** | Base Monthly Budget™ |
| **Department Pack installs** | Optional capacity bump (production language) |
| **Founder Journey™ maturity** | Graduated increases — earned, not surprise |
| **Platform operator override** | Admin-only · never exposes provider math |

Example tiers (spec placeholders):

| Tier | Monthly Budget™ |
|------|-----------------|
| Studio Starter | $100 |
| Studio Standard | $250 |
| Studio Signature | $500 |

Tiers use **production dollars** — not API credits.

---

## Spend Accumulation

### On Estimate Approval

```
estimatedPendingUsd += estimate.estimatedProductionCostUsd
pendingProductions += 1
```

### On Production Start

```
status: reserved → in_progress
```

### On Production Complete

```
spentUsd += actualCostUsd (typically = estimate cost ± variance cap)
estimatedPendingUsd -= reserved amount
creativeSavingsUsd += estimate.estimatedSavingsUsd
assetsReused += estimate.breakdown.assetsReused
blueprintSystemsReused += estimate.breakdown.blueprintsReused + systemsReused
monthlyProduction += 1
pendingProductions -= 1
efficiencyScore → recalculate
```

### On Cancel / Revise

```
Release pending reservation
If revised → new estimate creates new ledger entry
```

---

## Period Reset

At `periodEnd`:

| Field | Reset behavior |
|-------|----------------|
| `spentUsd` | → 0 |
| `estimatedPendingUsd` | Carry in-flight to next period OR release (config: **carry pending**) |
| `creativeSavingsUsd` | → 0 (monthly) · archive to history |
| `efficiencyScore` | → recalculate from new month baseline |
| `assetsReused` | → 0 (monthly counters) |
| `monthlyProduction` | → 0 |

**Lifetime totals** preserved in Creative Budget History™ (future).

---

## Rollover Policy (v1 Default)

| Policy | v1 choice |
|--------|-----------|
| Unused budget rolls over | **No** — encourages intentional monthly production |
| Pending productions carry | **Yes** — in-flight work not penalized |
| Savings archive | **Yes** — monthly history for Orb maturity coaching |

---

## Mid-Period Budget Adjustment

Platform may increase Monthly Budget™ mid-period (upgrade · promotion):

```
monthlyBudgetUsd += delta
availableUsd recalculated immediately
Orb: "Your creative capacity increased this month."
```

Never decrease below `spent + pending` without founder acknowledgment.

---

## Relationship to Living Company Genome™

As headquarters matures ([Living Company Genome™](../living-company-genome/README.md)):

- Efficiency trends improve month-over-month
- Orb references maturation in coaching
- Optional earned budget bonuses tied to Genome Events™ (future)

---

_Monthly Cycle™ — studio planning rhythm, not a running meter._
