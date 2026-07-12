# Studio World Material Library Spec™

**Version:** `studio-world-material-library.v1`

## Law

**No AI-generated marble. No invented textures.**

All materials originate from the **Studio World Material Library** — organization-owned assets.

## Frontal Slayer materials

| Material ID | Source |
|-------------|--------|
| founder-marble | `primary-marble-texture` → `/assets/marble-half.png` |
| founder-crystal | Acrylic finish reference |
| founder-chrome | Chrome finish reference |
| founder-red-illumination | `#EB1C24` color token |

## Application phase

`material-application` — after decor generation, before lighting.

Missing library material → `MATERIAL_LIBRARY_REQUIRED_MISSING`.

## Brand enforcement

Integrates with `brand-asset-grounding/` — organization assets override model creativity.

## Module

`src/studio-os-core/studio-world-architecture-v2/material-library.ts`
