# BCF closure/frontal color photo batch generation

Permanent workflow for **Closures** and **Frontals** PDP hero stills: each supported hair color gets a matching **PNG** on pure white `#FFFFFF`, generated via **Fal** from the existing black product reference image.

**Bundles are excluded** — bundle color PNGs are already complete.

## Prerequisites

- `FAL_KEY`
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- `STORAGE_BUCKET=live-preview` (default)

Copy env from `.env.wig-preview.example.txt` or `.env.local`.

## Quick start

```bash
# 1) Scan catalog + detect missing assets (writes batch manifest)
npm run bcf:cf-photos:manifest

# 2) Generate missing PNGs (Fal → Supabase) + sync storefront manifest
npm run bcf:cf-photos:batch

# Or step-by-step:
npm run bcf:cf-photos:generate
npm run bcf:cf-photos:sync
```

Dry run (no API / no uploads):

```bash
DRY_RUN=1 npm run bcf:cf-photos:batch
LIMIT=2 npm run bcf:cf-photos:generate
```

## What gets scanned

- **108 closure/frontal color rows** (2 categories × 3 textures × 18 colors)
- **Source image:** each row’s black default hero still from `BCF_CF_PHOTO` in `bcfPdpHeroAssets.ts`
- **Skip if ready:** PNG already in Supabase at the row’s `photoStoragePath`, or legacy platinum trio (`IMG_20xx.png`) already mapped in `bcfPdpHeroAssets.ts`
- **OFF BLACK** is not generated — shoppers use the default black hero JPEG

## Output layout (Supabase)

| Asset | Path pattern |
|-------|----------------|
| Noir palette | `Closures Color/{Straight\|Wavy\|Curly}/{color-slug}.png` |
| Noir palette | `Frontals Color/{Straight\|Wavy\|Curly}/{color-slug}.png` |
| Blonde trio (legacy) | `Closures Color/Platinum/IMG_20xx.png` (existing — skip) |

Examples:

- `Closures Color/Straight/espresso.png`
- `Frontals Color/Wavy/cherry.png`

## Fal model & prompt

- **Model:** `fal-ai/nano-banana-pro/edit` (override with `BCF_CF_PHOTO_FAL_MODEL`)
- **Resolution:** `2K` (`BCF_CF_PHOTO_RESOLUTION`)
- **Output:** PNG, `aspect_ratio: auto` (preserves source crop)
- **Prompt:** `scripts/bcf/bcfCfPhotoPrompt.mjs` — recolor hair to `[COLOR_NAME] [HEX_CODE]`, preserve product structure

## Manifest files

| File | Purpose |
|------|---------|
| `scripts/bcf/manifests/bcf-cf-photos-v1.json` | Batch working manifest (status per product) |
| `public/assets/bcf/photos/manifest.json` | Storefront manifest (synced) |
| `src/utils/bcfPdpCfHeroPhotos.generated.ts` | Auto-generated TS map for the app |

## Storefront wiring

- `src/utils/bcfPdpHeroAssets.ts` — merges manifest-backed closure/frontal color URLs before legacy hardcoded maps
- `bcfPdpHeroHasColorSpecificPhoto()` — true when manifest or legacy map has a color PNG

After each successful batch run, **`npm run bcf:cf-photos:sync`** updates the app manifest. Commit the synced files with your batch results.

## Safe reruns

- Idempotent: existing PNGs in storage are skipped
- `FORCE=1` — regenerate even when PNG exists
- `ONLY_PRODUCT_KEYS=closures-curly-ginger,frontals-wavy-espresso` — regenerate specific rows only (use with `FORCE=1`)
- `LIMIT=N` — process at most N missing rows (testing)
