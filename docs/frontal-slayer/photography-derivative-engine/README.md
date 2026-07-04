# Photography Derivative Engine

Automatic derivative asset pipeline for every approved Product Hero Portrait. The **Product Photography Bible** remains the single source of truth; this engine prepares derivative **slots** (not generated images) when a hero is approved.

| Document | Topic |
|----------|-------|
| [01-overview.md](./01-overview.md) | Goals, trigger, and inheritance chain |
| [02-crop-templates.md](./02-crop-templates.md) | Reusable normalized crop definitions |
| [03-derivative-slots.md](./03-derivative-slots.md) | 18 derivative slots per unit |
| [04-asset-replacement.md](./04-asset-replacement.md) | Site bindings and future asset resolver |
| [05-future-product-lines.md](./05-future-product-lines.md) | Bundles, closures, frontals, accessories, brands |

**Admin:** `/admin/studio/brand-assets/photography-bible` → **DERIVATIVES** tab  
**Code:** `src/studio-os/product-photography/`  
**Derivatives root:** `studio-os/product-photography/derivatives/`  
**Service:** `photographyDerivativeEngineStudioService` in `STUDIO_SERVICE_REGISTRY`

## Milestone 21 scope

- Infrastructure only — no AI generation, no image processing, no customer-facing UI changes.
- On hero approval: prepare 18 derivative records with name, purpose, dimensions, aspect ratio, crop coordinates, version, status, generated date, last updated.
- Crop coordinates come from **reusable templates** (normalized 0–1 regions on the 4096×4096 master), never hardcoded per product.
