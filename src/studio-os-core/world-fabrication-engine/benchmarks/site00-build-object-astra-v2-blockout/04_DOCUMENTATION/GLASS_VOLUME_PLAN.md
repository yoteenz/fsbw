# Glass volume reconstruction plan

## Reference requirement

Multiple **distinct** transparent enclosures with white framing, varied heights, readable interior floors.

## Blockout approach

1. Model **3–5 separate glass shells** with different footprints (not one unified cube).
2. Each shell: explicit **frame thickness** (simple white edge cubes) + **pane planes** with slight offset for depth.
3. Align shells to **floor plate stack** — floors visible through at least central volume.
4. **Right wing** lower/stepped vs **left marble fin** — preserve asymmetry.
5. Stage 01 material: simple glass (transmission 1, roughness ~0.05, light IOR) — reuse V1 node logic in Stage 02 only after architecture approval.

## Preserve from V1 (Stage 02+, not blockout)

- Transmission + IOR export pattern from `site00-build-object-astra-v1/01_SOURCE/build_astra_v1.py` glass material block.

## Anti-patterns

- Identical repeated `pavilion()` modules on a grid.
- One merged transparent hull with no interior subdivisions.
