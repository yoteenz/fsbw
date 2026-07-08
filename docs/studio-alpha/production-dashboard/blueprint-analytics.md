# Blueprint Analytics™

**Module:** `studio-alpha.production-dashboard.v1.blueprints`  
**Status:** Blueprint intellectual property tracking

---

## Principle

> Every Blueprint is intellectual property. Blueprint Analytics™ tracks creation cost · reuse · compatibility · ROI.

---

## Blueprint Analytics Schema

```yaml
BlueprintAnalyticsRecord:
  blueprintId: string
  blueprintLabel: string
  generationCostUsd: number         # cost to author + seed systems
  reuseCount: number
  compatibleDepartments: string[]
  companiesUsing: number              # orgs inheriting blueprint
  averageCompatibilityScore: number # 0–100
  mostCommonVariants: string[]
  visualDnaId: string
  visualDnaLabel: string
  roiUsd: number                    # total savings attributed to blueprint reuse
  systemsIncluded: string[]
  marketplaceStatus: internal | published | licensed | deprecated
```

---

## Tracked Fields

| Field | Definition |
|-------|------------|
| **Generation Cost** | Cost to create blueprint + initial system assets |
| **Reuse Count** | Times blueprint applied (Apply Existing™) |
| **Compatible Departments** | Department types with high compatibility |
| **Companies Using It** | Org count inheriting blueprint |
| **Average Compatibility** | Mean compatibility score from Asset Intelligence |
| **Most Common Variants** | Top inherited variant labels |
| **Visual DNA™** | Parent design language |
| **ROI™** | Cumulative savings from blueprint-driven reuse |

---

## Blueprint Systems™ Leaderboard

Answer: *Which Blueprint Systems™ are reused most often?*

```
Blueprint / System                    Reuse    ROI       Companies
Editorial Lighting System™            842      $1,240    12
Luxury Materials System™              614      $890      11
Architectural Language System™        388      $520      8
Glass & Reflection System™            291      $410      7
```

---

## Savings Attribution

```
blueprintRoi = Σ estimate.estimatedSavingsUsd
  where estimate.breakdown.blueprintsReused includes blueprintId
```

Cross-ref [Creative Blueprint Engine™](../../studio-os/creative-blueprint-engine/README.md).

---

## Compatibility Score

Derived from [Compatibility Engine™](../../studio-os/asset-intelligence-engine/compatibility-engine.md):

| Score band | Meaning |
|------------|---------|
| 90–100 | Exact / near-exact inheritance |
| 70–89 | Close match · minor modify |
| 50–69 | Modify path recommended |
| < 50 | Generate new · blueprint gap |

---

## Drill-Down

Blueprint row → systems list → assets using blueprint → [Asset ROI™](./asset-roi.md) filtered.

---

_Blueprint Analytics™ — intellectual property with measurable return._
