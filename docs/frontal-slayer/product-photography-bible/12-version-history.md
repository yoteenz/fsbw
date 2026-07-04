# 12 — Version History

## Photography System Version 1.0 (immutable)

- **Label:** Product Photography System V2.0 (canonical spec) stored as **Photography System V1.0**
- **Status:** Immutable baseline — do not overwrite
- **Effective:** Milestone 20.5

Captures locked: aspect 1:1, 4096×4096, pure white studio, eye-level camera, lens, crop, lighting, display bust, logo placement, color profile.

## Future versions

| Version | Policy |
|---------|--------|
| V1.1 | Minor additive changes (new export slot, clarified copy) |
| V1.2 | Minor field updates |
| V2.0 | Major system revision |

Each version is **append-only**. Previous versions remain readable for legacy assets.

## Code reference

`src/studio-os/product-photography/PhotographyVersionManager.ts`
