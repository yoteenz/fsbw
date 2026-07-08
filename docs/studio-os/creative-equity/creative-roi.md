# Creative ROI™

**Module:** `studio.creative-equity.v1.roi`  
**Status:** Per-asset investment performance — founder plane

---

## Principle

> Assets become **investments**. Not expenses.

Every generated asset calculates **Creative ROI™** — proving whether production spend compounded into lasting value.

---

## Creative ROI Schema

```yaml
CreativeRoiRecord:
  assetId: string
  assetLabel: string
  generationCostUsd: number           # abstract production cost (founder plane)
  reuseCount: number
  departmentsUsing: number
  scenesUsing: number
  companiesUsing: number              # cross-org reuse / marketplace adoption
  marketplaceDownloads: number
  revenueGeneratedUsd: number | null  # marketplace attribution (spec — no ledger impl)
  totalSavingsUsd: number
  lifetimeValueUsd: number
  effectiveCostPerUseUsd: number
  creativeRoiPercent: number
  equityContributionUsd: number
  certificationStatus: draft | approved | golden | studio_certified
```

---

## Required Fields

Every generated asset tracks:

| Field | Definition |
|-------|------------|
| **Generation Cost** | Original approved production cost |
| **Reuse Count** | Times asset reused without full regeneration |
| **Departments Using It** | Distinct departments referencing asset |
| **Scenes Using It** | Distinct scenes |
| **Companies Using It** | Orgs via marketplace · license · template |
| **Marketplace Downloads** | External acquisition count |
| **Revenue Generated** | Attributed marketplace revenue (future ledger) |
| **Total Savings** | Cumulative savings vs regenerate |
| **Lifetime Value** | Composite investment worth |
| **Effective Cost Per Use** | `generationCost / max(reuseCount, 1)` |

---

## Formulas

```
totalSavingsUsd = Σ (hypotheticalRegenerateCost − actualReuseCost)

lifetimeValueUsd = totalSavingsUsd
                 + marketplaceInfluenceValue
                 + certificationPremium
                 + longevityBonus

effectiveCostPerUseUsd = generationCostUsd / max(reuseCount, 1)

creativeRoiPercent = min(100, (lifetimeValueUsd / max(generationCostUsd, ε)) × 100)
```

---

## Canonical Example

```
Editorial Luxury Lighting™
────────────────────────────────────
Generation Cost           $0.18
Reuse Count               436
Departments Using         6
Scenes Using              28
Companies Using           3
Marketplace Downloads     12
Total Savings             $72.38
Lifetime Value            $89.20
Effective Cost Per Use    $0.0004
Creative ROI              496%
Equity Contribution       $4.12
```

---

## Org-Level Creative ROI

Headline metric on [Creative Equity™](./creative-equity.md) scorecard:

```
Creative ROI = weighted average of top asset ROI records
             + blueprint portfolio ROI
             + certified asset premium
```

Example scorecard: **Creative ROI 94%**

---

## What Increases ROI

| Signal | Effect |
|--------|--------|
| Cross-department reuse | High |
| Marketplace adoption | High |
| Studio Certified™ | Premium multiplier |
| Long active life | Longevity bonus |
| Blueprint anchoring | System dependency value |

## What Does Not

| Signal | Effect |
|--------|--------|
| Single-use generation | ROI ≈ generation cost only |
| Uncertified draft | Excluded from headline ROI |
| Redundant duplicate | Low · consolidation recommended |

---

## Distinction from Studio Alpha™ Asset ROI™

| Plane | System | Audience |
|-------|--------|----------|
| Internal | [Asset ROI™](../../studio-alpha/production-dashboard/asset-roi.md) | Operators · GPU truth |
| Founder | **Creative ROI™** | Abstract production $ · wealth narrative |

Same asset · different presentation · one underlying registry history.

---

## Forbidden Founder Exposure

Creative ROI™ uses **production studio dollars** — never FAL invoices · tokens · per-model pricing.

---

_Creative ROI™ — prove the asset was worth creating._
