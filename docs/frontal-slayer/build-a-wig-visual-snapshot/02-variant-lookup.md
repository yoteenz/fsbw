# Variant Lookup

## Key formula

```
baseUnit + color → configured image
```

Examples:

- SOFT WAVE + CHERRY → `soft-wave_cherry_cart`
- NOIR + JET BLACK → `noir_jet-black_cart`
- BLANCO + PLATINUM → `blanco_platinum_cart`

## Resolution order

1. **Approved variant registry** — `BAW_APPROVED_VARIANT_URLS` / published `/assets/baw-visual-snapshots/`
2. **Live preview storage** — existing Fal/Supabase color previews when stored (`resolveWigPreviewLiveColorTripleIfStored`)
3. **Fallback** — closest approved base unit thumb + status `FALLBACK_USED` + Asset Factory generation queue entry

## Color palette

Uses approved Frontal Slayer colors only — `APPROVED_HAIR_COLORS` in `src/utils/bawVisualSnapshot/colorPalette.ts` (mirrors `api/_lib/bawCatalogHairColors.ts` + BLANCO GOLDEN/PLATINUM/ASH).

Do not invent colors.

## Crop contexts

| Surface | Crop suffix |
|---------|-------------|
| Cart dropdown / bag | `cart` |
| Wishlist | `wishlist` |
| Checkout / confirm | `checkout` |
| Order history | `order` |
| Admin order detail | `admin` |

Resolver: `resolveCommerceLineThumbnailSrc(item, context, legacyFallback)`.
