# Asset ROI™

**Module:** `studio-alpha.production-dashboard.v1.asset-roi`  
**Status:** Long-term asset investment tracking

---

## Principle

> Every asset is an investment. Asset ROI™ proves whether that investment compounded.

---

## Asset ROI Schema

```yaml
AssetRoiRecord:
  assetId: string
  assetLabel: string
  generationCostUsd: number         # original production cost
  reuseCount: number
  departmentsUsing: string[]
  scenesUsing: string[]
  blueprintDependencies: string[]
  totalSavingsGeneratedUsd: number  # savings vs regenerate across all uses
  effectiveCostPerUseUsd: number    # generationCost / max(reuseCount, 1)
  creator: string                   # operator or pipeline
  dateCreated: ISO8601
  performanceImpact: low | medium | high | critical
  registryStatus: draft | approved | golden | deprecated | archived
```

---

## Canonical Example

```
Editorial Luxury Lighting™
────────────────────────────────────
Generation Cost           $0.18
Reuse Count               436
Effective Cost Per Use    $0.0004
Total Savings             $72.38
────────────────────────────────────
Departments Using         6
Scenes Using              28
Blueprint Dependencies    Editorial Lighting System™
Performance Impact        Critical
Creator                   Studio Alpha Pipeline
Date Created              2026-03-14
```

---

## Formula

```
effectiveCostPerUse = generationCostUsd / max(reuseCount, 1)

totalSavingsGenerated = Σ (hypotheticalRegenerateCost − actualReuseCost)
  across all reuse events company-wide and platform-wide
```

---

## Performance Impact

| Level | Criteria |
|-------|----------|
| **Critical** | High reuse · multi-department · blueprint anchor |
| **High** | Strong reuse · department-scoped |
| **Medium** | Moderate reuse |
| **Low** | Single-use or low adoption — candidate for archive |

---

## ROI Leaderboard

Operators sort assets by:

| Rank | Metric |
|------|--------|
| Highest ROI | `totalSavingsGeneratedUsd` |
| Best efficiency | Lowest `effectiveCostPerUseUsd` |
| Widest adoption | `departmentsUsing.length` |
| Underperforming | High `generationCostUsd` · `reuseCount < 2` |

Feeds [Optimization Center](./optimization-center.md).

---

## Relationship to Asset Registry™

[Studio Asset Registry™](../../studio-os/engines/studio-asset-registry/README.md) stores assets.

Asset ROI™ **computes** investment metrics from registry + generation history.

---

_Asset ROI™ — prove every asset was worth creating._
