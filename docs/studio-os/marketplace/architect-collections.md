# Architect Collections™

**Entire ecosystems — not isolated downloads**

**Version:** 1.0.0  
**Status:** Canonical collection architecture (docs only)  
**Parent:** [Studio Architects™](./studio-architects.md)

---

## Purpose

Define **Architect Collections™** — curated bundles of complete headquarters environments published by Studio Architects™.

Collections are **entire ecosystems** — coordinated architectural visions across multiple Headquarters™ and Living Sets™.

---

## Core Law

```
A COLLECTION IS A DESIGN MOVEMENT — NOT A FOLDER OF FILES
```

---

## Canonical Collection Examples

| Collection | Character | Contents |
|------------|-----------|----------|
| **Editorial Collection™** | Magazine atelier · pin walls · gallery drama | Creative Studios™ · Editorial HQ™ · Reception |
| **Luxury Marble Collection™** | White marble · chrome · editorial luxury | Luxury HQ™ · CDS Living Sets™ · Founder Office™ |
| **Minimal Technology Collection™** | Apple restraint · prototype walls | Innovation Labs™ · Minimal HQ™ · Conference Wings™ |
| **Hollywood Collection™** | Production energy · screening · media | Creative Studios™ · Production Floors™ · Reception |
| **Hospitality Collection™** | Warmth · service · CX | Customer Experience Centers™ · Reception · Founder Office™ |
| **Modern Retail Collection™** | Product display · brand floors | Brand Worlds™ · Innovation Labs™ |
| **Founder Essentials™** | Day-one complete founder wing | Founder Office™ · Reception · Creative Studio™ |
| **Innovation Collection™** | R&D · museum · prototypes | Innovation Campus™ · Labs™ · Conference Wings™ |

Each collection ships multiple **Headquarters Packages™** with shared design DNA.

---

## Collection Structure

```json
{
  "architectCollection": {
    "id": "collection/editorial-kateena-v1",
    "displayName": "Editorial Collection™",
    "architectId": "kateena-armstrong",
    "studioCertified": true,
    "designManifesto": "Magazine craft for modern founders.",
    "sharedDna": {
      "materials": ["editorial-plaster", "brass", "glass"],
      "lighting": "warm-editorial-drama",
      "mood": "inspired"
    },
    "packages": [
      { "packageId": "hq-editorial-loft", "role": "headquarters" },
      { "packageId": "living-set-creative-atelier", "role": "creative-studio" },
      { "packageId": "reception-editorial", "role": "arrival" }
    ],
    "installModes": ["entrepreneur", "creator"],
    "seasonalVariant": null
  }
}
```

---

## Collection vs Single HQ

| Single HQ | Collection |
|-----------|------------|
| One install | Coordinated multi-install |
| One case study | Curated portfolio narrative |
| Individual price | Bundle value |
| Standalone genre | Design movement |

Founders collecting **Editorial Collection™** build a coherent wing — not mismatched rooms.

---

## Seasonal Collections

Architects may release **seasonal** collection variants:

| Seasonal | Example |
|----------|---------|
| Launch Season™ | Campaign-forward atmospheres |
| Winter Atelier™ | Material · light shift |
| Anniversary Edition™ | Patina · milestone props |

Seasonal collections notify **followers** on release.

---

## Certification

| Tier | Requirement |
|------|-------------|
| Community™ Collection | Valid packages · coherent manifesto |
| **Studio Certified™ Collection** | All packages certified · architect certified |

Certified collections eligible for **Featured Collection™** spotlight.

---

## Founder Experience

| Action | Experience |
|--------|------------|
| Browse collection | Unified walkthrough preview |
| Install full collection | Topology merges coherently |
| Install subset | Compatible with collection DNA |
| Collect over time | Headquarters History™ tracks collection ownership |

---

## Revenue (Philosophy)

| Model | Description |
|-------|-------------|
| Collection bundle | Discount vs individual HQ |
| Certified premium | Higher trust · price floor |
| Seasonal limited | Scarcity · follower notify |
| Expansion pack | Add rooms to owned collection |

**No payment implementation this sprint.**

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| Unrelated HQ bundled | No shared DNA |
| Asset folder collection | Not complete environments |
| Collection without manifesto | Feels like discount bin |

---

## Implementation Status

**Docs only.** Collection spec — no bundle UI this sprint.
