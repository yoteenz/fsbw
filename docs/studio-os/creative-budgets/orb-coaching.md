# Orb Coaching™

**Module:** `studio.creative-budgets.v1.orb-coaching`  
**Status:** Creative Director coaching — not billing support

---

## Law

> The Orb should coach founders to think like **Creative Directors** — celebrating reuse, maturity, and genome discipline.

Never meter anxiety. Never provider blame.

---

## Coaching Structure

```yaml
OrbBudgetCoaching:
  headline: string
  coachingBullets: string[]
  savingsCallout: string | null
  efficiencyCallout: string | null
  recommendation: string
  tone: creative-director
```

---

## Canonical Examples (Sprint)

### Blueprint Reuse Savings

> *"You've saved approximately $87 this month by reusing existing Blueprints."*

**Trigger:** `creativeSavingsUsd ≥ 50` and `blueprintSystemsReused` trending up.

### Headquarters Maturation

> *"This headquarters has become significantly more efficient as it has matured."*

**Trigger:** `efficiencyScore ≥ 85` and month-over-month efficiency delta positive · [Living Company Genome™](../living-company-genome/README.md) maturity signals.

### Founder Taste Genome

> *"Your Founder Taste Genome is helping reduce unnecessary production."*

**Trigger:** High reuse rate with Founder Taste Engine™ active · declining `newAssetsGenerated` ratio.

---

## Additional Coaching Patterns

### Investment Framing

> *"Every asset you approve today becomes part of your company's permanent creative library."*

**Trigger:** First production of month · early registry.

### Consistency Win

> *"Reusing your Editorial Lighting System™ keeps Story Table™ and the Observatory visually aligned."*

**Trigger:** Cross-department blueprint reuse detected.

### Gentle Capacity Coaching

> *"You have $28.14 reserved for productions already in flight. I can help revise the next estimate to stay within this month's creative capacity."*

**Trigger:** `availableUsd` low · new estimate requested.

### Efficiency Opportunity

> *"I found compatible Material Blueprints that could reduce this production's cost by 40%. Want me to recalculate the estimate?"*

**Trigger:** Pre-estimate · Asset Intelligence high-confidence reuse.

---

## Coaching Inputs

| Signal | Orb uses |
|--------|----------|
| `creativeSavingsUsd` | Dollar wins · rounded speech |
| `efficiencyScore` | Maturity · discipline praise |
| `assetsReused` | Registry investment story |
| `blueprintSystemsReused` | Visual DNA consistency |
| Month-over-month delta | Maturation narrative |
| Genome / Taste signals | Genome coaching line |
| Pending count | In-flight awareness |

---

## Forbidden Orb Phrases

| Never say | Say instead |
|-----------|-------------|
| "API credits low" | "Creative capacity this month" |
| "FAL spend: $12" | "Production spend: $12" |
| "Token budget exhausted" | "Monthly creative budget reserved" |
| "You wasted credits" | "We can produce this more efficiently" |
| "Upgrade for more API calls" | "Expand your creative capacity" |

---

## Coaching Frequency

| Moment | Coaching |
|--------|----------|
| Headquarters open (monthly) | Efficiency + savings headline |
| Before Production Estimate™ | Capacity pill + reuse opportunity |
| After production complete | Savings increment celebration |
| Period end | Month summary · consistency note |
| Low efficiency month | Gentle Apply Existing™ suggestion |

---

## Relationship to Production Estimate Orb

[Production Estimates Orb](../studio-production-estimates/orb-narration.md) explains **WHY** for a single job.

Creative Budgets Orb explains **HOW** the headquarters is compounding monthly — savings · maturity · genome.

Both may appear in sequence:

1. Estimate Orb: *"63% savings on this Story Table production"*
2. Budget Orb: *"That brings your monthly reuse savings to $137."*

---

_Orb Coaching™ — Creative Director in the Orb, not a billing bot._
