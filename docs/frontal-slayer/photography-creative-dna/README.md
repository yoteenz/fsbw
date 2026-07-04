# Photography Creative DNA

Creative DNA is the **permanent source of truth** for Frontal Slayer product photography. It stores the approved photography system, production prompt, mannequin assets, editorial reference prompt, output rules, and future generation requirements.

## Hierarchy

```
Brand Assets
  └── Photography Bible
        └── Creative DNA v1.0
              └── Asset Factory (reads Creative DNA before processing)
```

## What v1.0 contains

| Component | Description |
|-----------|-------------|
| **Approved Prompt** | Frontal Slayer Signature Collection Master Product Photography System · v2.0 |
| **Editorial Reference Prompt** | Lighting/composition quality lock only — never replaces mannequin identity |
| **Official Display Bust v1.0** | Existing `/assets/` background-removed mannequin PNGs (no re-upload) |
| **Benchmark Output** | SOFT WAVE 003 Master Hero Portrait |
| **Locked Specifications** | 20 immutable composition/lighting/prohibition rules |
| **Generation Package** | Auto-built from DNA + per-unit variables only |

## Per-unit variables (only fields that change)

- Unit name
- Collection number
- Texture
- Product reference image

Everything else inherits Creative DNA v1.0.

## Versioning

Creative DNA v1.0 is **immutable**. Future updates append as v1.1, v1.2, v2.0 — never overwrite v1.0.

## Code reference

- `src/studio-os/product-photography/CreativeDnaRegistry.ts`
- `src/studio-os/product-photography/CreativeDnaGenerationPackage.ts`
- `src/hooks/useAdminStudioPhotographyCreativeDnaState.ts`
- `api/_lib/productAssetFactory/creativeDna.ts`

## Admin

Photography Bible → **CREATIVE DNA** tab at `/admin/studio/brand-assets/photography-bible`.

## Future units (prepared, not generated)

001 NOIR · 002 BLANCO · 003 SOFT WAVE (benchmark) · 004 BEACH WAVE · 005 SOFT CURL · 006 OCEAN CURL
