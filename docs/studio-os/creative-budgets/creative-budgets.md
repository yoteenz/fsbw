# Creative Budgets™ — Master Specification

**Engine ID:** `studio.creative-budgets.v1`  
**Status:** Monthly creative capacity governance

---

## The Problem

Founders using AI tools think in:

- API credits
- Token meters
- Per-call surprise costs
- Disposable generations

Studio OS must feel like running a **creative studio with a monthly production allocation** — where reuse compounds, Blueprints strengthen the company, and every approved production is a long-term investment.

---

## The Solution

Every organization receives a **monthly Creative Budget™** — abstract creative production capacity expressed in production dollars founders understand.

Creative Budgets™ roll up:

- What was spent (completed productions)
- What is reserved (pending productions)
- What was saved (reuse intelligence)
- How efficiently the headquarters produced
- How reuse is maturing the visual language

The Orb coaches founders toward **Creative Director thinking** — not API optimization.

---

## Core Laws

### Law 1 — Capacity Not Calls

> Founders never think in API calls.

Monthly Budget™ = creative production capacity. Internal systems may route to providers. Founders see **studio economics only**.

### Law 2 — Estimate Feeds Budget

> Every approved Production Estimate™ reserves budget.

Pending productions appear as **Estimated Pending™** before execution completes.

### Law 3 — Reuse Rewards Efficiency

> Every reused asset increases efficiency. Every Blueprint strengthens the company.

Creative Savings™ and Efficiency Score™ make intelligent production visible and celebrated.

### Law 4 — Consistency Follows Efficiency

> The most efficient headquarters should also become the most visually consistent.

High reuse → inherited Blueprints → fewer one-off generations → stronger Company Visual DNA™.

### Law 5 — Orb Coaches — Never Scolds

> The Orb coaches founders like a Creative Director — savings wins, maturity wins, genome wins.

Never meter anxiety. Never provider blame.

### Law 6 — Investment Mindset

> Every approved generation becomes a long-term investment in the Asset Registry™.

Budget spend that creates reusable assets is **productive** — not waste.

---

## Monthly Creative Budget™ Output

```yaml
CreativeBudgetSnapshot:
  orgId: string
  period:
    month: string                    # YYYY-MM
    periodStart: ISO8601
    periodEnd: ISO8601
  capacity:
    monthlyBudgetUsd: number         # e.g. 250
    spentUsd: number                 # completed productions
    estimatedPendingUsd: number      # approved · in-flight
    availableUsd: number             # budget − spent − pending
  savings:
    creativeSavingsUsd: number       # reuse value this month
    savingsPercentOfHypothetical: number
  efficiency:
    efficiencyScore: number          # 0–100
    assetsReused: number
    blueprintSystemsReused: number
  productionCounts:
    monthlyProduction: number        # completed this month
    pendingProductions: number
    completedProductions: number   # cumulative or period — config
  orbCoaching:
    headline: string
    coachingBullets: string[]
  internalOnly:
    providerRouting: never-founder-facing
    tokenBurn: never-founder-facing
```

---

## Dashboard Example (Canonical)

| Metric | Value |
|--------|-------|
| Monthly Budget™ | **$250** |
| Spent | **$41.72** |
| Estimated Pending™ | **$28.14** |
| Saved Through Reuse | **$137.55** |
| Efficiency Score™ | **94%** |
| Assets Reused™ | **482** |
| Blueprint Systems Reused™ | **118** |

---

## Relationship to Production Estimates™

| System | Role |
|--------|------|
| **Production Estimate™** | Per-job scope before execution |
| **Creative Budget™** | Monthly capacity envelope |

A founder approves an estimate → **Estimated Pending™** increases.

Production completes → **Spent** increases, **Pending** decreases, **Savings** may increase.

See [integration-map.md](./integration-map.md).

---

## Relationship to Billing

| System | Role |
|--------|------|
| **Creative Budget™** | Founder-facing capacity metaphor |
| **Platform billing** (if any) | Separate · never itemizes FAL/OpenAI per call |
| **Headquarters License** | May inform default Monthly Budget™ tier |

Creative Budget ≠ API invoice.

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| "12,400 tokens remaining" | Meter anxiety |
| "FAL credits: 847" | Provider exposure |
| Budget shown only after overage | No informed capacity |
| Efficiency hidden when low | Discourages learning |
| Savings omitted when reuse occurred | Hides intelligence value |
| Scolding Orb on spend | Violates coaching law |

---

## Final Philosophy

Studio OS should reward intelligent creative production.

Founders think like Creative Directors. Reuse compounds. Blueprints strengthen. Approved generations invest in the company's visual future.

The most efficient headquarters becomes the most visually consistent.

---

_See also: [budget-model.md](./budget-model.md) · [efficiency-score.md](./efficiency-score.md) · [orb-coaching.md](./orb-coaching.md) · [forbidden-exposure.md](./forbidden-exposure.md)_
