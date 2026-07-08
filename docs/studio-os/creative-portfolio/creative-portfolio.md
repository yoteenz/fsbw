# Creative Portfolio™ — Master Specification

**Engine ID:** `studio.creative-portfolio.v1`  
**Status:** Multidimensional creative ecosystem health

---

## The Problem

A single **Creative Equity™** dollar figure tells founders *how much* — not *how healthy · cohesive · influential · or mature* their creative ecosystem is.

Founders need a **Creative Net Worth Dashboard** — multidimensional intelligence about the creative capital they have accumulated over years.

---

## The Solution

Every company receives a **Creative Portfolio™** — a permanent, maturing evaluation of creative ecosystem strength across ten dimensions.

```
Portfolio Overview
├── Estimated Portfolio Value™
├── Portfolio Health™          (0–100)
├── Creative Maturity™
├── Creative Efficiency™
├── Design Consistency™
├── Marketplace Influence™
├── Visual DNA Stability™
├── Blueprint Strength™
└── Asset Health™
```

[Creative Equity™](../creative-equity/README.md) appears in the overview as **one signal among many** — never the sole representation of creative wealth.

---

## Core Laws

### Law 1 — Multidimensional Wealth

> Creative Equity™ should never be represented as a single dollar amount alone.

Portfolio dimensions explain the story behind the number.

### Law 2 — Intellectual Property Mindset

> A founder is building intellectual property — not collecting images.

Portfolio tracks Blueprints™ · Landmarks™ · Systems™ · departments — not file counts.

### Law 3 — Never Reset

> Creative Portfolios never reset. They mature.

[Portfolio Evolution™](./portfolio-roadmap.md) — every Expedition™ · Routine™ · Golden Build™ strengthens the portfolio.

### Law 4 — One Cohesive World

> The company should feel like one cohesive world.

[Design Consistency™](./design-consistency.md) is a first-class dimension.

### Law 5 — Orb as Portfolio Advisor

> The Orb becomes the portfolio advisor — health · upgrades · influence · efficiency wins.

Not a billing bot. Not a file manager.

### Law 6 — Equity Feeds Portfolio

> Creative Portfolio™ consumes [Creative Equity™](../creative-equity/README.md) data — does not replace or redesign it.

Collections schema remains in [creative-equity/creative-portfolio.md](../creative-equity/creative-portfolio.md).

---

## Portfolio Snapshot Schema

```yaml
CreativePortfolioSnapshot:
  orgId: string
  asOf: ISO8601
  lifetimeOnly: true
  overview:
    creativeEquityIndex: number           # normalized equity signal — not sole headline
    estimatedPortfolioValueIndex: number    # composite 0–100 or indexed value
    portfolioHealth: number                 # 0–100
    creativeMaturity: MaturityStage
    creativeEfficiency: number              # 0–100
    designConsistency: number               # 0–100
    marketplaceInfluence: number            # 0–100
    visualDnaStability: number              # 0–100
    blueprintStrength: number               # 0–100
    assetHealth: number                     # 0–100
  collections: PortfolioCollections       # see creative-equity/creative-portfolio.md
  orbAdvisor:
    headline: string
    insights: string[]
    recommendations: PortfolioRecommendation[]
  evolution:
    milestones: PortfolioMilestone[]
    neverResets: true
```

---

## Portfolio Overview (Canonical Display)

```
CREATIVE PORTFOLIO™
────────────────────────────────────────
Portfolio Health™              87
Creative Maturity™               Established
Creative Efficiency™             94
Design Consistency™              91
Blueprint Strength™              88
Asset Health™                    82
Marketplace Influence™           64
Visual DNA Stability™            93
────────────────────────────────────────
Estimated Portfolio Value™       Index 124
Creative Equity™ (signal)      $12,480
```

**Headline metric:** Portfolio Health™ — not dollar equity alone.

---

## What Portfolio Holds

| Holding type | Collection |
|--------------|------------|
| Blueprint™ | Blueprint Library™ |
| Landmark™ | Landmark Collection™ |
| Living Set™ | Living Sets™ |
| Department™ | Departments™ |
| Studio Original™ | Studio Originals™ |
| Marketplace Product™ | Marketplace Products™ |
| Asset™ | Registry holdings |
| System™ | Architectural · Material · Lighting · Atmosphere · Transition |

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| Single dollar as only portfolio UI | Violates multidimensional law |
| Monthly portfolio reset | Violates maturity law |
| Redesign Creative Equity™ engine | Out of sprint scope |
| Financial P&L dashboard | Wrong product |
| File-count as health | Tracks files not capital |

---

## Long-Term Vision

Years later, founders view Studio OS as where they accumulated **decades of creative capital**:

- Headquarters™
- Blueprint Library™
- Landmark Collection™
- Design Language™
- Marketplace Products™
- Creative Equity™ (as one signal in a rich portfolio)

Lasting business assets — not disposable creative output.

---

## Final Philosophy

Most software tracks files.

Some software tracks finances.

**Studio OS tracks creative capital.**

Every generation becomes an investment. Every Blueprint becomes intellectual property. Every Landmark becomes part of a legacy.

Creative Portfolio™ is the living record of everything the company has imagined, built, refined, shared, and preserved.

---

_See also: [portfolio-health.md](./portfolio-health.md) · [visual-dna.md](./visual-dna.md) · [portfolio-roadmap.md](./portfolio-roadmap.md)_
