# 02 — Generation Package

Future product generation auto-assembles:

```
Creative DNA v1.0
+ Approved Photography Prompt v2.0
+ Official Display Bust v1.0
+ Editorial Reference Prompt
+ Product Reference Image
+ Unit Metadata
```

## Builder

`buildCreativeDnaGenerationPackage()` in `CreativeDnaGenerationPackage.ts`

## Asset Factory integration

`runProductAssetFactoryPipeline()` loads Creative DNA at startup and logs locked rules. Master hero source resolves from Creative DNA benchmark for SOFT WAVE POC.

`resolveCreativeDnaForAssetFactory()` — client-side pre-flight check before API run.

## Fal generation (live)

Photography Bible **Generate Variants** and **Replace Reference** on SOFT WAVE call `POST /api/admin/product-photography-generate`, which runs the package through Fal and chains Asset Factory. See [03-fal-generation.md](./03-fal-generation.md).
