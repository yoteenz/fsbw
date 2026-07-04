# Crop Templates

Crop templates are **reusable definitions** — not per-product coordinates. All templates reference normalized regions on the 4096×4096 master hero (ratios 0–1).

## Categories

| Category | Templates | Surfaces |
|----------|-----------|----------|
| **wishlist** | Wishlist Crop, Mini Wishlist Crop | Saved looks, inline chips |
| **cart** | Cart Dropdown Crop | Cart dropdown line items |
| **search** | Search Result Crop | Shop search grid |
| **collection** | Collection Grid Crop | Signature Collection grids |
| **product** | Product Card Crop, Product Page Crop | Shop cards, unit PDP |
| **desktop** | Desktop Crop | Desktop hero modules |
| **mobile** | Mobile Crop | Mobile PDP and shop |
| **studio** | studio os Crop | Admin previews |
| **email** | Email Crop | Signature Collection email |
| **social** | Social Square, Story Portrait | Paid social, stories |
| **thumbnail** | Thumbnail | Global thumb surfaces |
| **master** | Master Hero Full, Transparent Master | Source and cutout |
| **marketing** | Holographic Display, Marketing Composite | Email exhibits, campaigns |

## Shared regions

Templates compose from shared normalized regions:

- **FULL_MASTER** — `{ x: 0, y: 0, width: 1, height: 1 }`
- **BUST_CENTER** — bust-forward framing for PDP, cards, grids
- **BUST_TIGHT** — tighter bust for thumbnails and mini surfaces
- **BUST_VERTICAL** — head-and-shoulders for 9:16 story crops

## Pixel resolution

Use `resolveCropPixels(region, masterSize)` to convert normalized regions to pixel coordinates on the 4096 master (or another size when the pipeline ships).

## Code reference

`src/studio-os/product-photography/DerivativeCropTemplates.ts` — `DERIVATIVE_CROP_TEMPLATES`

Do **not** hardcode coordinates in page components or per-unit config. Add or adjust templates in the registry only.
