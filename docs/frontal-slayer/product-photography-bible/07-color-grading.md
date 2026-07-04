# 07 — Color Science

## Color profile (locked — V1.0)

- **Working space:** sRGB for web deliverables
- **Master archive:** sRGB or Adobe RGB per export template — locked in V1.0
- **Skin/mannequin:** Neutral grey plaster reference (NOIR) / unit-accurate tones (BLANCO, textures)

## Grading rules

- Texture truth over saturation.
- Cherry red (#EB1C24) appears only in **logo placement** layers, never baked into hair.
- No cross-unit LUT swaps — one grade chain for all Signature masters.

## Code reference

`src/studio-os/product-photography/PhotographySpecifications.ts` → `colorProfile`
