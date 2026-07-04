# Crop Templates

Each template stores:

| Field | Description |
|-------|-------------|
| aspectRatio | e.g. `1:1`, `10:13` |
| outputWidth / outputHeight | Export pixels |
| cropRegion | Normalized `{ x, y, width, height }` on master |
| cropAnchor | `center`, `top`, `attention` |
| padding | Normalized padding around region |
| scale | Output scale multiplier |
| transparency | PNG alpha vs opaque |
| exportFormat | `png` or `webp` |

**Code:** `src/studio-os/product-photography/FactoryCropTemplates.ts` (client)  
**Server:** `api/_lib/productAssetFactory/factoryCropTemplates.ts`

Coordinates are **never hardcoded per product** — same templates apply to all future units.
