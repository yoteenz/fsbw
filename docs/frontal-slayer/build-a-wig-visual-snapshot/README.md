# Build-A-Wig Visual Snapshot System

Configured product imagery for cart, wishlist, checkout, and orders — Milestone 21.5.

| Document | Topic |
|----------|-------|
| [01-overview.md](./01-overview.md) | Goals and architecture |
| [02-variant-lookup.md](./02-variant-lookup.md) | baseUnit + color lookup and fallbacks |
| [03-commerce-integration.md](./03-commerce-integration.md) | Cart, wishlist, checkout, orders |
| [04-asset-factory.md](./04-asset-factory.md) | Generation queue hooks |

**Code:** `src/utils/bawVisualSnapshot/`  
**Variants root:** `studio-os/product-photography/visual-snapshots/`  
**Public publish path:** `/assets/baw-visual-snapshots/{unitSlug}_{colorSlug}_{suffix}.png`

Inherits master assets from Product Photography Bible / Derivative Engine (Milestone 21).
