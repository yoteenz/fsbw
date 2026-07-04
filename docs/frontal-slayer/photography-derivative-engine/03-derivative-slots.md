# Derivative Slots

Each approved hero prepares **18 derivative slots**. Slots map to a crop template and a storage folder.

## Slot list

| ID | Name | Crop template |
|----|------|---------------|
| `hero-portrait` | Hero Portrait | master-hero-full |
| `transparent-master` | Transparent Master | master-transparent-full |
| `wishlist-crop` | Wishlist Crop | wishlist-standard |
| `mini-wishlist-crop` | Mini Wishlist Crop | wishlist-mini |
| `cart-dropdown-crop` | Cart Dropdown Crop | cart-dropdown |
| `product-card-crop` | Product Card Crop | product-card |
| `product-page-crop` | Product Page Crop | product-page |
| `collection-grid-crop` | Collection Grid Crop | collection-grid |
| `search-result-crop` | Search Result Crop | search-result |
| `email-crop` | Email Crop | email-signature |
| `desktop-crop` | Desktop Crop | desktop-hero |
| `mobile-crop` | Mobile Crop | mobile-pdp |
| `studioos-crop` | studio os Crop | studioos-preview |
| `social-square` | Social Square | social-square |
| `story-portrait` | Story Portrait | story-portrait |
| `thumbnail` | Thumbnail | thumbnail-standard |
| `holographic-display-crop` | Holographic Display Crop | holographic-display |
| `marketing-composite-placeholder` | Marketing Composite Placeholder | marketing-composite-slot |

## Folder path pattern

```
studio-os/product-photography/derivatives/{productLine}/{unitSlug}/{derivativeId}/
```

Example:

```
studio-os/product-photography/derivatives/signature-collection/noir/wishlist-crop/
```

## Signature Collection

Placeholder folders exist for all six units (001–006): `noir`, `blanco`, `soft-wave`, `beach-wave`, `soft-curl`, `ocean-curl`.

## Status lifecycle

1. **slot-prepared** — Milestone 21 default on hero approval
2. **pending-generation** — queued for crop/export pipeline
3. **generated** — file written to folder
4. **approved** — QA approved for site use
5. **replaced** — live on website via asset resolver

## Code reference

`src/studio-os/product-photography/DerivativeAssetRegistry.ts` — `DERIVATIVE_SLOT_DEFINITIONS`
