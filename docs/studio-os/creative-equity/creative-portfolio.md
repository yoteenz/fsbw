# Creative Portfolio™

**Module:** `studio.creative-equity.v1.portfolio`  
**Status:** Founder's creative asset library — collections schema

> **Expanded multidimensional dashboard:** [Creative Portfolio™ system](../creative-portfolio/README.md) — Portfolio Health™ · maturity · consistency · influence. This file defines **collections structure** only.

---

## Principle

> Every founder owns a **Creative Portfolio™**. Creative Equity™ is the portfolio's total value.

---

## Portfolio Structure

```yaml
CreativePortfolio:
  orgId: string
  founderId: string
  portfolioValueUsd: number           # = Creative Equity™ headline
  collections:
    blueprintLibrary: BlueprintLibrary™
    landmarkCollection: LandmarkCollection™
    livingSets: LivingSet[]
    departments: DepartmentAsset[]
    marketplaceProducts: MarketplaceProduct[]
    architecturalSystems: SystemCollection™
    materialSystems: SystemCollection™
    lightingSystems: SystemCollection™
    atmosphereSystems: SystemCollection™
    transitionSystems: SystemCollection™
    founderCollections: FounderCollection™
    studioOriginals: StudioOriginal[]
  summary:
    totalAssets: number
    certifiedCount: number
    averageReuse: number
    topPerformingAssets: CreativeRoiRecord[]
```

---

## Portfolio Collections

| Collection | Contents |
|------------|----------|
| **Blueprint Library™** | Creative Blueprints™ · Visual DNA™ variants |
| **Landmark Collection™** | Signature Landmarks™ per department/HQ |
| **Living Sets™** | Certified persistent environments |
| **Departments™** | Golden Build™ department packages |
| **Marketplace Products™** | Published licensable creative IP |
| **Architectural Systems™** | Language · proportion · structure systems |
| **Material Systems™** | Surface · finish · texture systems |
| **Lighting Systems™** | Editorial · ambient · accent systems |
| **Atmosphere Systems™** | Mood · haze · environmental tone |
| **Transition Systems™** | Movement · journey · arrival language |
| **Founder Collections™** | Curated founder-selected asset sets |
| **Studio Originals™** | Proprietary first-party creative works |

---

## Portfolio Value Calculation

```
portfolioValueUsd = Σ collection.intrinsicValue
                  + Σ asset.lifetimeValueUsd
                  + marketplaceInfluencePremium
                  - (none — equity never subtracts on reset)
```

Collections overlap — deduplication via entity graph (Blueprint contains Systems contains Assets).

---

## Founder Experience (Spec)

| View | Purpose |
|------|---------|
| **Portfolio Overview** | Creative Equity™ + collection counts |
| **Collection drill-down** | Assets · blueprints · certification status |
| **Top performers** | Highest Creative ROI™ |
| **Recent equity events** | What increased wealth this month |
| **Founder Collections™** | Personal curation — pins increase satisfaction signals |

**No UI this sprint** — structure and value rules only.

---

## Headquarters as Portfolio

The physical/digital headquarters is not separate from the portfolio — it **is** the portfolio expressed in space:

- Departments = infrastructure holdings
- Landmarks™ = signature architectural assets
- Living Sets™ = environment holdings
- Blueprints™ = design language IP

> *"The headquarters itself becomes intellectual property."*

---

## Relationship to Legacy Vault™

[Legacy Vault™](../legacy-vault.md) preserves story.

Creative Portfolio™ preserves **valued creative holdings** with ROI · equity · lifetime metrics.

Complementary — not duplicate.

---

_Creative Portfolio™ — your company's creative balance sheet._
