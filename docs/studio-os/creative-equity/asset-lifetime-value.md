# Asset Lifetime Value™

**Module:** `studio.creative-equity.v1.lifetime-value`  
**Status:** How creative assets appreciate over time

---

## Principle

> Nothing valuable should disappear after generation. Lifetime Value™ measures how an asset **appreciates** from approval through reuse · certification · marketplace influence.

---

## Lifetime Value Model

```yaml
AssetLifetimeValue:
  assetId: string
  createdAt: ISO8601
  phases:
    - phase: creation
      timestamp: ISO8601
      valueUsd: number              # generation cost (baseline investment)
    - phase: first_reuse
      timestamp: ISO8601
      valueUsd: number              # savings event 1
    - phase: certification
      timestamp: ISO8601
      valueUsd: number              # studio_certified premium
    - phase: cross_department
      timestamp: ISO8601
      valueUsd: number
    - phase: marketplace_publish
      timestamp: ISO8601
      valueUsd: number
    - phase: external_adoption
      timestamp: ISO8601
      valueUsd: number
  currentLifetimeValueUsd: number
  projectedValueUsd: number         # forecast from reuse velocity
  equityContributionUsd: number
```

---

## Value Components

| Component | Description |
|-----------|-------------|
| **Base investment** | Approved generation cost |
| **Reuse savings** | Cumulative avoided regeneration |
| **Adoption breadth** | Departments · scenes · companies |
| **Certification premium** | Golden Build™ · Studio Certified™ |
| **Marketplace influence** | Downloads · licenses · ratings |
| **Longevity accrual** | Time-active bonus (capped) |
| **Blueprint anchoring** | Part of high-value System™ |

---

## Lifetime Value Timeline

```
Creation ($0.18)
    ↓ reuse × 50
First cross-department ($12 savings)
    ↓ Studio Certified™
Certification premium (+$2.40)
    ↓ marketplace publish
External adoption (+$8.20)
    ↓ 12 months active
Longevity bonus (+$1.10)
────────────────────────
Current Lifetime Value: $89.20
```

---

## Appreciation vs Depreciation

| Appreciates | Depreciates (soft) |
|-------------|-------------------|
| Reuse growth | Superseded by better certified asset |
| External adoption | Deprecated (history preserved) |
| Certification upgrade | Low adoption after 90 days |
| Blueprint merge into system | — |

**Deprecation** marks asset inactive — **lifetime value and equity history remain**.

---

## Long-Term Asset Usage™

Milestone events feed [Equity Engine™](./equity-engine.md):

| Milestone | Example |
|-----------|---------|
| 100 reuses | Long-Term Usage™ tier 1 |
| 1 year active | Longevity event |
| 10 departments | Adoption breadth event |
| 3 external companies | Community Adoption™ |

---

## Integration with Asset Registry™

[Studio Asset Registry™](../engines/studio-asset-registry/README.md) stores asset versions.

Lifetime Value™ service reads:

- Generation history
- Reuse events
- Certification state
- Marketplace attribution (spec)

Writes:

- `lifetimeValueUsd` on asset profile
- Equity events on milestones

---

## Founder Visibility

Founders see:

- Lifetime Value on asset detail (portfolio drill-down)
- Top appreciating assets in Orb briefings
- **Not** internal GPU cost curves

---

_Asset Lifetime Value™ — investments that appreciate, not expenses that vanish._
