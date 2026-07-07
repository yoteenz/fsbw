# 03 — Business Evolution

**Engine Module:** `studio.founder-journey.v1.business-evolution`  
**Status:** Company growth tracking and HQ correlation  
**Philosophy:** As companies evolve, Headquarters evolve.

---

## Design Principle

> Business evolution drives **operational and visual** Headquarters change — departments expand · buildings appear · AI specialists mature · automation deepens · reporting becomes strategic.

---

## Evolution Dimensions

| Dimension | Evolves |
|-----------|---------|
| **Headquarters scale** | Campus tier · building count |
| **Department inventory** | New departments · expanded zones |
| **AI workforce** | Concierge count · specialist depth |
| **Automation** | Workflow sophistication |
| **Reporting** | Operational → strategic executive lens |
| **Decision-making** | Tactical approvals → strategic gates |
| **Marketplace** | Consumer → publisher of expansions |

---

## Business Evolution Snapshot

```yaml
BusinessEvolutionSnapshot:
  companyId: string
  assessedAt: ISO8601

  maturityTier: enum               # seed · growth · scale · enterprise · portfolio
  revenueBand: string
  teamBand: string
  customerBand: string

  headquartersTier: HQEvolutionTier
  departmentCount: number
  automationScore: number
  expansionCount: number

  trajectory: enum                 # accelerating · steady · pivoting · consolidating
  complexityScore: number          # operational load
```

Feeds Founder Stage inference (02) and Headquarters Evolution (06).

---

## Visual & Operational Correlation

| Business Change | HQ Expression |
|-----------------|---------------|
| First marketing hire | Marketing building activity increases |
| Revenue milestone | Analytics Observatory upgrade · celebration |
| New product line | Production wing expansion metaphor |
| International sales | International Expansion department emerges |
| First acquisition | Acquisition Center building appears |
| Automation milestone | Visible workflow ceremonies · less manual objects |

Integrates **Campus Evolution Engine™** · **Headquarters Engine™** · Walk the Business World Evolution (10).

---

## Executive Reporting Evolution

| Maturity | Reporting Character |
|----------|---------------------|
| Early | Department status · ship progress |
| Growth | Pipeline · engagement · CX health |
| Scale | Strategic priorities · delegation queue |
| Portfolio | Cross-brand synergy · capacity |

Orb brief content adapts — not more widgets.

---

## Founder Journey Role

Business evolution **alone** does not set founder stage — but weights it:

```
High revenue + founder still approves every CTA → Scaling company · Building-stage founder behavior
→ Founder Journey: encourage delegation · Orb challenges bottleneck
```

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| HQ identical at $10K and $10M revenue | Breaks evolution promise |
| Feature unlock only by payment | Stage/evolution ≠ paywall |
| Complexity without visual HQ growth | Founder can't sense progress |

---

_Next: [04 — Founder Profile](./04_FOUNDER_PROFILE.md)_
