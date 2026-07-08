# Creative Investments™

**Module:** `studio.creative-equity.v1.investments`  
**Status:** Investment categories · Company Genome™ integration

---

## Principle

> Studio OS distinguishes **spending** from **investing**. Creative Investments™ are approved creative works that compound into [Creative Equity™](./creative-equity.md).

---

## Investment Categories

| Category | Equity role | Lifecycle gate |
|----------|-------------|----------------|
| **Blueprint™** | Design language IP | Blueprint approved |
| **System™** | Coordinated reusable language | System certified |
| **Landmark™** | Signature architectural identity | Landmark golden |
| **Living Set™** | Persistent certified environment | Set certified |
| **Department™** | Creative infrastructure | Golden Build™ |
| **Studio Original™** | Proprietary creative work | Studio Certified™ |
| **Marketplace Asset™** | External influence vehicle | Published |
| **Golden Build™** | Flagship production milestone | Golden Build achieved |
| **Studio Certified™ Asset™** | Quality-gated registry asset | Certification passed |
| **Founder Collection™** | Curated high-value set | Founder pinned |
| **High Compatibility Asset™** | Reuse engine champion | Compatibility ≥ 90 |
| **Transition System™** | Journey language asset | System live |

---

## Investment vs Expense

```yaml
CreativeInvestment:
  productionId: string
  classification: investment | expense | pending
  rules:
    investment:
      - approved
      - registered
      - reusePotential > threshold
      - certificationPathDefined
    expense:
      - oneOffExperimental
      - supersededAndArchived
      - neverReusedAfter90Days  # soft flag — not equity removal
    pending:
      - draft
      - awaitingApproval
```

**Expense** in this model means *failed to compound* — not accounting write-off. History preserved.

---

## Company Genome™ Integration

[Company Genome™](../company-genome.md) gains a **Creative Wealth** domain:

```yaml
CompanyGenomeCreativeWealth:
  creativeEquityUsd: number
  topInvestments: InvestmentSummary[]
  foundationalAssets: string[]        # assets that shaped identity
  influentialBlueprints: string[]
  maturityStage: emerging | developing | established | influential
  recommendationWeights:
    preferReuseOf: string[]
    avoidRedundantGenerationIn: string[]
```

### Genome Consultation

Before AI recommends new production, Studio OS consults:

1. Existing [Creative Portfolio™](./creative-portfolio.md) holdings
2. Asset reuse potential · Creative ROI™ leaders
3. Foundational investments — *"This Blueprint shaped your identity — extend it"*
4. Equity trajectory — *"Invest in certification, not duplicate materials"*

Future recommendations become **increasingly intelligent** as equity history grows.

---

## Relationship to Living Company Genome™

[Living Company Genome™](../living-company-genome/README.md) tracks evolutionary **memory**.

Creative Investments™ track evolutionary **wealth**.

| Living Company Genome™ | Creative Investments™ |
|------------------------|----------------------|
| Genome Events™ | Equity Events™ |
| World Evolution™ | Portfolio growth |
| Time Capsule™ | Lifetime value archive |
| DNA strands | ROI · certification |

Both feed Company Genome™ consultation.

---

## Foundational Investments

Studio OS identifies assets that **shaped company identity**:

| Signal | Foundational? |
|--------|---------------|
| First Golden Build™ department | Yes |
| Most-reused Blueprint | Yes |
| Signature Landmark™ | Yes |
| First Studio Certified™ system | Yes |
| Marketplace-licensed design language | Yes |

Foundational investments receive permanent genome slots — never deprioritized for novelty.

---

## Orb Investment Narration

> *"Your Editorial Luxury Blueprint™ has become one of your most valuable creative assets."*

> *"Your company's design language has become significantly more valuable over time."*

> *"Investing in Studio Certification for your Lighting System™ would increase Creative Equity™ more than generating new materials."*

---

_Creative Investments™ — know what you built, not just what you spent._
