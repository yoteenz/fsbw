# H — Camera match audit

## Reference

| Property | Value |
|----------|--------|
| File | `04_COMPARISONS/approved-reference.jpg` |
| Resolution | **1672 × 941** |
| Projection (visual) | **Perspective** architectural viz |
| Framing | Three-quarter, slightly elevated; plinth + full height visible |

## Astra V1 hero (`01_HERO_REFERENCE_MATCH`)

| Property | Value (from `camera-manifest.json`) |
|----------|-------------------------------------|
| Resolution | **1280 × 720** |
| Projection | **ORTHOGRAPHIC** (`ortho_scale` 19.8) |
| Location | (13, -21, 7.4) → target (0, 0, 3.9) |

## Impact

**CAMERA_MISMATCH — CONFIRMED (major).** Orthographic hero vs perspective reference prevents pixel-aligned silhouette comparison without reprojection. Filename `01_HERO_REFERENCE_MATCH` **overstates** alignment.

**Revision note (`codex-exec.log` L9200–9207):** second pass adjusted **hero height** and **elevated ortho scale** (3 → 3.6, scale 21 → 25) — **camera/framing**, not portal tracing.

## Comparison artifact

`08_FORENSIC_AUDIT_RECOVERY1/F_CAMERA_MATCH_COMPARISON_HERO.png` (copy of `hero-vs-approved-reference.png`) — side-by-side at **960×540** each; useful for qualitative review, **not** calibrated camera solve.

**Do not** attribute all visual delta to geometry; **projection + framing** explain part of silhouette mismatch.
