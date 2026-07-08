# Marketplace Equity™

**Module:** `studio.creative-equity.v1.marketplace`  
**Status:** How marketplace activity increases Creative Equity™ (spec only)

---

## Principle

> Creative Equity™ should increase when the founder's design language becomes **influential** — not merely when assets exist internally.

**This sprint defines signals only.** No marketplace implementation · no financial ledger.

---

## Equity-Increasing Marketplace Events

| Event | Equity signal |
|-------|---------------|
| **Assets purchased** | External validation |
| **Blueprints licensed** | IP monetization + influence |
| **Landmarks become popular** | Architectural adoption |
| **Systems reused** | Design language spread |
| **Departments inspire derivatives** | Template influence |
| **Design language influential** | Cross-org Visual DNA™ adoption |
| **Positive marketplace ratings** | Quality confirmation |
| **Community adoption** | Organic spread |

---

## Marketplace Equity Event Schema

```yaml
MarketplaceEquityEvent:
  eventId: string
  orgId: string
  timestamp: ISO8601
  eventType:
    - asset_purchased
    - blueprint_licensed
    - landmark_popular
    - system_reused_external
    - department_derivative
    - design_language_adopted
    - positive_rating
    - community_adoption
  entityId: string
  externalOrgCount: number
  influenceScore: number              # 0–100
  equityDeltaUsd: number
  revenueAttributedUsd: number | null # future — not implemented this sprint
```

---

## Influence Score

```
influenceScore = f(
  externalOrgCount,
  downloadVelocity,
  licenseCount,
  averageRating,
  derivativeCount
)
```

High influence → larger `equityDeltaUsd` via [Equity Engine™](./equity-engine.md).

---

## Orb Examples

> *"Your Creative Equity™ increased because your Blueprint™ was adopted by three additional headquarters."*

> *"Your Editorial Luxury Blueprint™ is now one of the most licensed design languages in the Marketplace."*

---

## What Marketplace Equity Is Not

| Not | Why |
|-----|-----|
| Cash balance | Equity is creative wealth — revenue is separate |
| Real-time payment system | No financial impl this sprint |
| Automatic publication | Founder approves marketplace exposure |
| Private asset leakage | Only published surfaces count |

---

## Relationship to Ecosystem Marketplace (M50)

Future [Ecosystem Marketplace](../ecosystem-marketplace.md) may execute transactions.

Marketplace Equity™ defines **which events increase Creative Equity™** when those systems exist.

---

## Relationship to Creative Blueprint Marketplace™

[Blueprint Marketplace™](../creative-blueprint-engine/marketplace-blueprints.md) publishes design languages.

Each license · adoption · derivative feeds Marketplace Equity™ events.

---

## Privacy & Consent

External adoption counts only **published · licensed** assets.

Private org knowledge never auto-contributes to marketplace equity signals.

---

_Marketplace Equity™ — influence increases creative net worth._
