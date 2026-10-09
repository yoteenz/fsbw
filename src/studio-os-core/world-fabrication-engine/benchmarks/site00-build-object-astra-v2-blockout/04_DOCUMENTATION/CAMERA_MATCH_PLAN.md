# Camera match plan — Stage 01 blockout

## Reference imaging

| Property | Value |
|----------|--------|
| File | `03_COMPARISONS/approved-reference.jpg` |
| Resolution | **1672 × 941** (render blockout comparisons at this aspect or scaled pair) |
| Projection | **Perspective** (architectural viz) |

## V1 failure (do not repeat)

Astra V1 hero used **ORTHOGRAPHIC** `ortho_scale` 19.8 (`site00-build-object-astra-v1/05_DOCUMENTATION/camera-manifest.json`). Filename `01_HERO_REFERENCE_MATCH` was misleading.

## Target hero camera (`01_REFERENCE_CAMERA_BLOCKOUT`)

| Parameter | Starting solve (estimate — refine in Blender against overlay) |
|-----------|----------------------------------------------------------------|
| Type | **PERSP** |
| Sensor width | 36 mm (Blender default) |
| Focal length | **32–38 mm** (start **35 mm**) |
| Azimuth | Camera on **front-right**: ~**35–42°** from world +Y toward +X |
| Elevation | **12–18°** above horizon relative to plinth center |
| Target | Center of mass ≈ `(0, 0, plinth_top + 0.45 * building_height)` |
| Distance | Adjust until plinth width matches ~**88–92%** of frame width at 1672×941 |
| Clip | Near 0.1 m, far 500 m |

## Validation procedure (mandatory before founder Gate 02)

1. Render `01_REFERENCE_CAMERA_BLOCKOUT.png` at **1672×941** (or 1280×720 with same aspect).
2. Produce `03_COMPARISONS/blockout-vs-reference-hero.png` (side-by-side).
3. Produce `03_COMPARISONS/landmark-overlay-hero.png` (50% blend or edge overlay on **silhouette landmarks**: plinth lip, left marble fin, red portal peak, roof step).
4. Document residual error in `camera-match-report.json` — do **not** label MATCH unless overlay review passes.

## Secondary inspection cameras (same `.blend`, perspective)

| Render | Intent |
|--------|--------|
| `02_LEFT_THREE_QUARTER` | Mirror-side validation of asymmetry |
| `03_RIGHT_THREE_QUARTER` | Portal + right glass wing |
| `04_ELEVATED_INSPECTION` | Floor plate stack + interior hierarchy |
| `05_REFERENCE_OVERLAY` | Hero blockout 50% over reference JPEG |

**Forbidden:** orthographic projection on `01_REFERENCE_CAMERA_BLOCKOUT`.
