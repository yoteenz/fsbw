# Creative Blueprints™ — Reusable Design Languages

**Module:** `studio.creative-blueprint.v1.blueprints`  
**Status:** Canonical blueprint catalog

---

## Definition

A **Creative Blueprint™** is a complete, reusable design language — not a single room, not a mood board image, not one asset.

Blueprints contain coordinated **Systems™** that travel together across departments.

---

## Blueprint vs Asset

| | Asset™ | Creative Blueprint™ |
|---|--------|---------------------|
| **Granularity** | One object | Entire language |
| **Reuse unit** | Chair · light rig · floor tile | Material + lighting + motion + audio systems |
| **Founder manages** | Via approval | Via blueprint choice · system evolution |
| **Cross-department** | Possible but fragmented | **Designed for inheritance** |
| **Marketplace product** | Object / pack | **Complete design language** |

---

## Canonical Blueprint Types

| Blueprint | Systems Bundled |
|-----------|-----------------|
| **Editorial Lighting System™** | Indirect · accent · practical · volumetrics · reflections · color temp · shadows · bloom · ambient glow |
| **Luxury Material System™** | Stone · metal · glass · leather · wood families |
| **Executive Furniture System™** | Desk · seating · shelving · proportions |
| **Orb Interaction System™** | Host light · proximity · presentation · reduced-motion |
| **Glass Language™** | Smoked · frosted · partition · display case rules |
| **Architectural Language™** | Proportion · ceiling · column · threshold vocabulary |
| **Atmospheric Language™** | Haze density · depth · particle philosophy |
| **Motion Language™** | Idle drift · transition timing · reduced-motion |
| **Audio Language™** | Ambient bed · UI · celebration · focus |
| **Transition Language™** | Walk · elevator · arrival character |
| **Environmental FX™** | Vignette · state glow · milestone effects |
| **Color Language™** | Dominant · accent · forbidden combinations |
| **Typography Language™** | Display · label · accent number rules |

---

## Composite Blueprints (Products)

Marketplace and org defaults ship **composite** blueprints bundling multiple systems:

| Composite Blueprint | Primary Use |
|--------------------|-------------|
| **Editorial Luxury Blueprint™** | CDS · creative departments · Frontal Slayer archetype |
| **Executive Modern Blueprint™** | Finance · Legal · Executive Command |
| **Luxury Hospitality Blueprint™** | CX · lounge · welcome |
| **Modern Agency Blueprint™** | Marketing · pitch rooms |
| **Creator Studio Blueprint™** | Content · recording sets |
| **Medical Blueprint™** | Clinical calm · trust materials |
| **Restaurant Blueprint™** | Warm hospitality · practical flow |
| **Salon Blueprint™** | Beauty · mirror light · product display |
| **Law Office Blueprint™** | Formal · wood · restrained light |

---

## Blueprint Structure

```yaml
CreativeBlueprint:
  blueprintId: blueprint:editorial-luxury-v1
  name: Editorial Luxury Blueprint™
  visualDnaId: visual-dna:editorial-luxury
  version: semver
  status: draft | active | deprecated | marketplace
  systems:
    - systemId: system:luxury-materials-v1
      role: materials
      required: true
    - systemId: system:editorial-lighting-v1
      role: lighting
      required: true
    - systemId: system:architectural-atelier-v1
      role: architecture
      required: true
    # ... all bundled systems
  departmentBindings:
    creative-direction: { variant: full }
    marketing: { variant: accent-open }
    finance: { variant: executive-formal }
  assetManifestRef: manifest://blueprint/editorial-luxury-v1/assets
```

---

## Department Binding Variants

Same blueprint · department-appropriate expression:

| Department | Variant | Difference |
|------------|---------|------------|
| CDS | `full` | Maximum editorial expression |
| Marketing | `accent-open` | Brighter accent · open shelving |
| Finance | `executive-formal` | Darker stone · restrained bloom |

Variants share Systems™ — tune parameters · not separate languages.

---

## Blueprint Lifecycle

```
draft → founder review → active → (evolve) → v2 active → v1 deprecated
                              ↓
                         marketplace publish
```

Active blueprint version pins to **Golden Build Version™** at certification.

---

## Relationship to Production Lifecycle Blueprint™

| Production Lifecycle Blueprint™ | Creative Blueprint™ |
|--------------------------------|---------------------|
| Stage 1 · creative conception | Ongoing design language |
| Outputs genome · manifests · briefs | **Inputs** those outputs with system definitions |
| Per-project / per-department intent | Cross-department reusable language |

Production Blueprint captures **what we're building now**. Creative Blueprint defines **how this company always builds**.

---

_Creative Blueprints™ — languages, not rooms._
