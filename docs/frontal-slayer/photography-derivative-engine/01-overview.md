# Overview

## Goal

Every approved **Master Hero Portrait** becomes the single source of truth for all product imagery across the Frontal Slayer ecosystem. The website should never manually manage separate product images again — all surfaces eventually resolve through derivative assets.

## Trigger

When a Signature Collection unit (or future product line unit) has its hero portrait **approved** in the Photography Bible admin:

1. `prepareDerivativesOnHeroApproval()` runs.
2. Eighteen derivative slots are created with status `slot-prepared`.
3. Records persist to `adminStudioProductPhotographyDerivatives_v1` (localStorage in admin demo).
4. Empty folders are ready under `studio-os/product-photography/derivatives/{productLine}/{unitSlug}/{derivativeId}/`.

No pixels are generated in Milestone 21.

## Inheritance chain

```
Photography Bible V1.0 (immutable)
  → Approved Hero Portrait (4096×4096)
    → Derivative Engine (18 slots)
      → Site Asset Bindings (assetKey → derivative folder)
        → Storefront / email / studio os surfaces (future resolver)
```

## Module map

| Module | Role |
|--------|------|
| `DerivativeCropTemplates.ts` | Reusable crop definitions by category |
| `DerivativeAssetRegistry.ts` | Slot definitions and record builder |
| `PhotographyDerivativeEngine.ts` | Hero-approval pipeline |
| `DerivativeAssetReplacement.ts` | Website assetKey bindings |
| `useAdminStudioPhotographyDerivativesState.ts` | Admin persistence |
| `photographyDerivativeEngine/service.ts` | studio os service stub |

## Record fields

Each derivative record includes:

- **Name** — human label (e.g. Wishlist Crop)
- **Purpose** — surface description
- **Dimensions** — output width × height from crop template
- **Aspect Ratio** — e.g. `1:1`, `10:13`, `9:16`
- **Crop Coordinates** — normalized `{ x, y, width, height }` on master
- **Version** — Photography System version (e.g. `1.0`)
- **Status** — `slot-prepared` → `pending-generation` → `generated` → `approved` → `replaced`
- **Generated Date** — null until generation pipeline ships
- **Last Updated** — ISO date of last state change
