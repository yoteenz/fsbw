# Asset Health™

**Module:** `studio.creative-portfolio.v1.asset-health`  
**Status:** Registry vitality and lifecycle management

---

## Principle

> A portfolio is only as healthy as its **assets** — active · reused · upgraded · gracefully retired.

**Asset Health™** tracks lifecycle categories and recommends maintenance.

---

## Asset Categories

| Category | Definition |
|----------|------------|
| **Active Assets™** | In production use · approved |
| **Frequently Used™** | Reuse count above threshold |
| **Rarely Used™** | Low reuse · review candidate |
| **High ROI™** | Top quartile [Creative ROI™](../creative-equity/creative-roi.md) |
| **Low ROI™** | Bottom quartile · consolidation candidate |
| **Legacy Assets™** | Superseded but preserved · historical value |
| **Deprecated Assets™** | Marked inactive · not deleted |
| **Recommended Retirement™** | Orb/system suggests archive |
| **Recommended Upgrade™** | Certification · modify · system merge path |

---

## Asset Health Score

```
assetHealth = round(
  0.30 × activeRatioScore +
  0.25 × highRoiRatioScore +
  0.20 × frequentlyUsedScore +
  0.15 × lowDeprecatedPenalty +
  0.10 × upgradeBacklogHealth
)

deprecatedPenalty: soft — legacy preserved, but high deprecated/active hurts maintainability
```

Display: **0–100** on Portfolio Overview.

---

## Health Dashboard (Spec)

```
ASSET HEALTH™
────────────────────────────────────
Active Assets              1,284
Frequently Used              412
High ROI                     186
Rarely Used                  94
Legacy Assets                48
Deprecated Assets            22
────────────────────────────────────
Recommended Upgrade          8
Recommended Retirement       5
```

---

## Orb Examples

> *"I recommend upgrading two legacy Lighting Systems."*

> *"Five rarely-used material variants could consolidate into your Luxury Materials System™."*

---

## Nothing Deleted

Deprecated and legacy assets **remain in portfolio history** — consistent with Creative Equity™ "nothing forgotten" law.

Retirement = archive · consolidate · supersede — not erase.

---

## Relationship to Asset Intelligence™

[Asset Intelligence Engine™](../asset-intelligence-engine/README.md) drives reuse decisions.

Asset Health™ surfaces **portfolio maintenance** view for founders.

---

_Asset Health™ — tend the garden of creative investments._
