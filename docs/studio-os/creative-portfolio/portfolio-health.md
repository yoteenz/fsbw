# Portfolio Health™

**Module:** `studio.creative-portfolio.v1.health`  
**Status:** Overall creative ecosystem health score

---

## Principle

> **Portfolio Health™** is the headline metric of [Creative Portfolio™](./creative-portfolio.md) — a 0–100 score evaluating the whole creative ecosystem.

Not a dollar amount. Not a file count. **Health.**

---

## Overall Health Score

```
Portfolio Health™: 0–100
```

Displayed prominently on Portfolio Overview — above individual dimension scores.

---

## Evaluation Inputs

| Input | Weight (v1) | Source |
|-------|-------------|--------|
| **Blueprint Reuse™** | 12% | [Blueprint Strength™](./blueprint-strength.md) |
| **System Reuse™** | 10% | Blueprint · system adoption |
| **Asset Quality™** | 12% | Certification · validation scores |
| **Generation Efficiency™** | 10% | [Creative Efficiency™](./creative-efficiency.md) |
| **Design Consistency™** | 14% | [design-consistency.md](./design-consistency.md) |
| **Marketplace Adoption™** | 8% | [marketplace-influence.md](./marketplace-influence.md) |
| **Founder Satisfaction™** | 8% | Approvals · collections · pins |
| **Long-Term Maintainability™** | 10% | Deprecated ratio · upgrade backlog |
| **Creative Evolution™** | 8% | [Portfolio Evolution™](./portfolio-roadmap.md) |
| **Asset Health™** | 8% | [asset-health.md](./asset-health.md) |

```
portfolioHealth = round(Σ (weight × subScore))
```

Each subScore normalized 0–100.

---

## Health Bands

| Score | Label | Orb tone |
|-------|-------|----------|
| 90–100 | **Thriving** | Celebrate ecosystem maturity |
| 75–89 | **Healthy** | Reinforce strengths |
| 60–74 | **Developing** | Coach consistency · reuse |
| 40–59 | **Building** | Normalize early portfolio |
| < 40 | **Emerging** | Investment framing · no shame |

---

## Orb Examples

> *"Your Creative Portfolio has become healthier this month."*

> *"Portfolio Health improved from 81 to 87 — driven by Blueprint reuse and design consistency."*

---

## Health Decay Signals (Soft)

Portfolio Health™ does not punish deprecation — but flags:

| Signal | Effect |
|--------|--------|
| Rising deprecated asset ratio | Maintainability subScore down |
| Low reuse after 90 days | Efficiency subScore down |
| Inconsistent new departments | Consistency subScore down |
| Stalled marketplace presence | Adoption subScore flat |

Recommendations route to Orb · Optimization — not automatic penalties.

---

## Relationship to Company Health Index™

[M97 Company Health Index™](../company-health-index.md) measures **organizational** health.

**Portfolio Health™** measures **creative ecosystem** health specifically.

Complementary — Portfolio Health feeds Creative strand of Company Genome™.

---

_Portfolio Health™ — how alive is your creative ecosystem?_
