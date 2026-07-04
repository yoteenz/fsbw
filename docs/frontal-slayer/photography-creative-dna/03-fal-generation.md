# 03 — Fal Master Hero Generation

Creative DNA v1.0 now drives **live Fal generation** for the SOFT WAVE proof of concept.

## API

`POST /api/admin/product-photography-generate`

### Actions

| Action | Description |
|--------|-------------|
| `generate-variants` | Creative DNA package + Display Bust + product ref + SOFT WAVE benchmark → Fal `nano-banana-pro/edit` → Supabase master |
| `replace-reference` | Same pipeline with a new `productReferenceImageSrc` |

### Body

```json
{
  "action": "generate-variants",
  "unitSlug": "soft-wave",
  "productReferenceImageSrc": "/assets/2D WAVY FRONT.png",
  "runAssetFactory": true
}
```

### Chain (default)

1. Load Creative DNA v1.0 (approved prompt v2.0, editorial reference, locked rules)
2. Upload Display Bust v1.0 + product reference (+ benchmark for generate-variants) to Fal
3. Generate 1:1 Master Hero PNG via `fal-ai/nano-banana-pro/edit` (4K)
4. Upload to Supabase `products/signature-collection/soft-wave/v1/generated-master-*.png`
5. **Asset Factory** runs automatically on the generated master (Ideogram cutout → derivatives → registry)

## Admin UI

**Photography Bible → Signature Collection → SOFT WAVE (Unit 003)**

- **GENERATE VARIANTS** — full DNA + benchmark pipeline + Asset Factory chain
- **REPLACE REFERENCE** — prompt for new product ref path/URL, regenerate + chain

Other units show disabled buttons until POC expands beyond SOFT WAVE.

## Requirements

- `FAL_KEY`
- `SUPABASE_URL` + storage creds, admin auth

## Ideogram 422 / large masters

Fal-generated 4K PNG masters may exceed Ideogram's **10MB** limit. Asset Factory **normalizes** images before Ideogram and **falls back** to pure-white studio keying (Creative DNA locked background) if Ideogram still rejects the input.

## Code

- `api/_lib/productPhotographyGeneration/`
- `api/admin/product-photography-generate.ts`
- `src/hooks/useAdminStudioProductPhotographyGenerate.ts`
