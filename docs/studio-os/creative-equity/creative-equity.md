# Creative Equity™ — Master Specification

**Engine ID:** `studio.creative-equity.v1`  
**Status:** Lifetime creative wealth system

---

## The Problem

Founders using creative tools see **expenses** — generations consumed, budgets spent, outputs forgotten.

Studio OS must show **wealth** — a growing portfolio of Blueprints™, Landmarks™, Systems™, and certified assets that compound over years.

> *"My company didn't just spend money on creativity. It built a creative asset portfolio."*

---

## The Solution

**Creative Equity™** represents the total creative value a company has accumulated over its **lifetime**.

Unlike [Creative Budgets™](../creative-budgets/README.md):

| Creative Budgets™ | Creative Equity™ |
|-------------------|------------------|
| Monthly capacity | Lifetime net worth |
| Resets each period | **Never resets** |
| Measures spend | Measures accumulation |
| "What can I create today?" | "What have I built forever?" |

---

## Core Laws

### Law 1 — Investment Not Expense

> Every approved generation should become an investment.

Assets are not line items on a bill — they are entries in a **Creative Portfolio™**.

### Law 2 — Never Reset

> Creative Equity™ never resets. It grows.

Monthly budgets refresh. Creative wealth compounds.

### Law 3 — Nothing Forgotten

> Nothing valuable should disappear after generation.

Registry · certification · reuse history · marketplace attribution preserve value permanently.

### Law 4 — Reward Intelligence

> The Equity Engine™ never rewards unnecessary generation.

Reuse · longevity · quality · consistency increase equity. Redundant generation does not.

### Law 5 — Headquarters as IP

> The headquarters itself becomes intellectual property.

Departments · Landmarks™ · Living Sets™ · Blueprints™ are equity-bearing assets.

### Law 6 — Genome Integration

> Creative Equity™ becomes part of [Company Genome™](../company-genome.md).

Studio OS learns which creative investments created lasting value — recommendations grow smarter over time.

---

## Creative Equity™ Snapshot

```yaml
CreativeEquitySnapshot:
  orgId: string
  asOf: ISO8601
  equityScoreUsd: number              # headline Creative Equity™
  metrics:
    creativeAssets: number
    blueprintSystems: number
    reusableSystems: number
    marketplaceProducts: number
    studioCertified: number
    averageAssetReuse: number
    creativeRoiPercent: number
  contributors: EquityContributor[]
  portfolioSummary: PortfolioSummary
  orbNarration:
    headline: string
    insights: string[]
  lifetimeOnly: true                  # never period-reset
```

---

## Equity Contributors

Creative Equity™ increases through:

| Category | Examples |
|----------|----------|
| **Production milestones** | Approved Golden Builds™ · Studio Certified™ Assets™ |
| **Reusable IP** | Blueprints™ · Systems™ · High Compatibility Assets™ |
| **Architectural identity** | Landmark Creation™ · Living Set™ Collections™ |
| **Creative infrastructure** | Departments™ · Studio Originals™ |
| **Reuse compounding** | Asset Reuse™ · Blueprint Reuse™ · Long-Term Asset Usage™ |
| **Marketplace influence** | Publications™ · Sales™ · Community Adoption™ · Positive Ratings™ |
| **Founder curation** | Founder Collections™ |

Full engine rules: [equity-engine.md](./equity-engine.md).

---

## Relationship to Creative Budgets™

```
Creative Budget™ (monthly)
  fuels → new production
              ↓
  intelligent approval + reuse
              ↓
Creative Equity™ (lifetime)
  accumulates → portfolio value
```

A company may spend budget efficiently **without** growing equity if outputs are discarded.

A company may spend modestly and grow equity rapidly through reuse · Blueprints · certification.

---

## Relationship to Studio Alpha™ Asset ROI™

[Studio Alpha™ Asset ROI™](../../studio-alpha/production-dashboard/asset-roi.md) tracks internal manufacturing ROI.

**Creative ROI™** ([creative-roi.md](./creative-roi.md)) is the **founder-facing** lifetime investment view — abstract production dollars, never raw GPU.

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| Equity increases on every generation | Rewards waste |
| Equity resets monthly | Confuses with budget |
| Uncertified drafts count fully | Inflates without quality |
| Deleted assets remove equity history | Violates "nothing forgotten" |
| GPU cost in founder equity UI | Wrong plane |

---

## Long-Term Vision

Years later, a founder looks back:

- Editorial Luxury Blueprint™ adopted across departments
- Story Table™ Landmark™ reused in nine scenes
- Marketplace Blueprint licensed by three headquarters
- Creative Equity™ $12,480 — and climbing

The headquarters is not decoration. It is **intellectual property**.

---

## Final Philosophy

Most software tracks expenses.

Studio OS tracks **creative wealth**.

Every Blueprint · Landmark · Living Set · System · Department · Golden Build should increase Creative Equity™ and strengthen long-term creative legacy.

---

_See also: [equity-engine.md](./equity-engine.md) · [creative-portfolio.md](./creative-portfolio.md) · [creative-investments.md](./creative-investments.md)_
