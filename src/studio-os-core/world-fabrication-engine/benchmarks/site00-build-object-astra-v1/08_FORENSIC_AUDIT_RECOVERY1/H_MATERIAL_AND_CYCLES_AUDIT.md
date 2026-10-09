# H — Material and Cycles render audit

**Source:** `build_astra_v1.py`, `material-manifest.json`, `technical-art-audit.json`.

## Glass (`Low iron architectural glass`)

- Principled **Transmission Weight = 1**, IOR **1.46**, low roughness **0.045**.
- **CONFIRMED:** real transmission/refraction in Cycles; **GLB** exports `KHR_materials_transmission` + `KHR_materials_ior`.
- **Limitation:** thin **single-surface** cubes — no solid **glass thickness** mesh (physical glass needs shell volume for best caustics).

## Red acrylic (`Scarlet optical acrylic`)

- Transmission **1**, saturated base color; revision narrative claims tint tweak — hero still reads **coral/light** vs reference **deep crimson** (qualitative, see comparison PNG).

## Marble

- Source texture: **`public/assets/marble-half.png`** copied to package (`material-manifest.json`).
- UV: planar per-face; script applies **gamma power 2.4** on pixels — veins remain **subtle** at hero scale.

## Lighting

- World background **(0.92, 0.95, 1)** strength **0.7** + three **AREA** disk lights (Key/Rim/Fill).
- **Cycles 32 samples**, denoise on, AgX view transform, exposure **0.85**.
- **Not** reference high-key white seamless; studio floor **200×200** gray-white cyclorama mesh.

## GLB vs Cycles

**GLB_RENDERER_LIMITATION — LIKELY:** web viewers may show glass better/worse than Cycles; founder viewed GLB — ** judge Cycles PNGs for art direction** (`03_RENDERS/*`).

**MATERIAL_FIDELITY:** **Technically valid PBR transmission stack; artistically under reference on marble contrast and red saturation.**  
**GLASS_QUALITY:** **Strongest element vs prior V2 export — CONFIRMED by founder feedback and shader setup.**
