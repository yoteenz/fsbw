# BCF product hero video batch generation

Permanent workflow for **Bundles, Closures, Frontals (BCF)** PDP hero videos: each product still (from `bcfPdpHeroAssets.ts`) gets a matching **MP4 + WebM** loop generated via **Fal Kling v3 image-to-video**.

## Prerequisites

- `FAL_KEY`
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- `STORAGE_BUCKET=live-preview` (default)
- Optional: **ffmpeg** on PATH for WebM conversion (`SKIP_WEBM=1` to skip)

Copy env from `.env.wig-preview.example.txt` or `.env.local`.

## Quick start

```bash
# 1) Scan catalog + detect missing assets (writes batch manifest)
npm run bcf:videos:manifest

# 2) Generate missing videos (Fal → Supabase)
npm run bcf:videos:batch

# Or step-by-step:
npm run bcf:videos:generate
npm run bcf:videos:sync
```

Dry run (no API / no uploads):

```bash
DRY_RUN=1 npm run bcf:videos:batch
LIMIT=2 npm run bcf:videos:generate
```

## What gets scanned

- **75 hero products** parsed from `src/utils/bcfPdpHeroAssets.ts`
  - 9 texture defaults (bundles / closures / frontals × straight / wavy / curly)
  - Per-color PNG heroes (bundles: full palette; closures/frontals: platinum trio)
- **Source image:** each row’s existing hero still (`sourcePhotoStoragePath`)
- **Skip if ready:** new MP4 at `BCF/videos/v1/{productKey}.mp4`, or legacy Kling `.mov` for the 9 texture defaults

## Output layout (Supabase)

| Asset | Path |
|-------|------|
| MP4 | `BCF/videos/v1/{category}-{texture}-{color-slug}.mp4` |
| WebM | `BCF/videos/v1/{category}-{texture}-{color-slug}.webm` |

Examples:

- `bundles-straight-default.mp4`
- `bundles-wavy-platinum.mp4`
- `closures-curly-golden.mp4`

## Fal model & prompt

- **Model:** `fal-ai/kling-video/v3/pro/image-to-video` (override with `BCF_VIDEO_FAL_MODEL`)
- **Aspect:** `9:16`
- **Duration:** `5` seconds default (`BCF_VIDEO_DURATION=4` … `6`)
- **Prompt:** `scripts/bcf/bcfVideoPrompt.mjs` — subtle 2–4° side sway, locked camera, pure white `#FFFFFF` background, preserve hair exactly

## Manifest files

| File | Purpose |
|------|---------|
| `scripts/bcf/manifests/bcf-videos-v1.json` | Batch working manifest (status per product) |
| `public/assets/bcf/videos/manifest.json` | Storefront manifest (synced) |
| `src/utils/bcfPdpHeroVideos.generated.ts` | Auto-generated TS map for the app |

## Storefront wiring

- `src/utils/bcfPdpHeroVideos.ts` — resolves video by category + texture + color (manifest → legacy `.mov` fallback)
- `src/pages/shop/texture-category-product/page.tsx` — PHOTO/VIDEO toggle uses manifest-backed URLs

After each successful batch run, **`npm run bcf:videos:sync`** updates the app manifest. Commit the synced files with your batch results.

## Safe reruns

- Idempotent: existing MP4/WebM in storage are skipped
- Legacy `.mov` skips regeneration for the 9 texture defaults unless `FORCE=1`
- `LIMIT`, `SLEEP_MS`, `DRY_RUN` for testing

## Env reference

| Variable | Default | Notes |
|----------|---------|-------|
| `BCF_VIDEO_FAL_MODEL` | `fal-ai/kling-video/v3/pro/image-to-video` | Kling v3 Pro I2V |
| `BCF_VIDEO_DURATION` | `5` | 4–6 seconds |
| `BCF_VIDEO_PREFIX` | `BCF/videos/v1` | Storage folder |
| `STORAGE_BUCKET` | `live-preview` | Supabase bucket |
| `FORCE=1` | off | Regenerate even when MP4 exists |
| `SKIP_WEBM=1` | off | MP4 only |
