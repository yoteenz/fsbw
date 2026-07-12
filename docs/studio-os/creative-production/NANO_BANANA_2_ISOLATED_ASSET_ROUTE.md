# Nano Banana 2 — Isolated Asset Route

**Founder decision:** 2026-07-12  
**Status:** Production default for isolated Scene Stack layers

## Endpoints

| Mode | Endpoint | When |
|------|----------|------|
| Text-to-image | `fal-ai/nano-banana-2` | No brand material images required |
| Material-grounded edit | `fal-ai/nano-banana-2/edit` | Approved brand textures/finishes supplied |

## Verified schema parameters

- `resolution`: `"0.5K"` | `"1K"` | `"2K"` | `"4K"` — production uses `"4K"`
- `thinking_level`: `"high"` (production)
- `aspect_ratio`, `output_format`, `num_images`
- Edit only: `image_urls` (max 14) — **material references only**

## Prohibited

- Full shell / room images as `image_urls`
- Generic marble when `primary-marble-texture` exists
- Claiming native 4K for upscaled outputs

## Resolution truth

If native 4K unavailable at provider:

1. Generate at highest native quality
2. Complete verified pipeline
3. Upscale via approved `image-upscale` route
4. Label `post-upscaled-4k`

## Previous vs new

| Layer | Previous | New |
|-------|----------|-----|
| Isolated landmark/furniture | `fal-ai/nano-banana-pro` t2i | `fal-ai/nano-banana-2` (+ `/edit` when brand refs) |
| Environment shell | `fal-ai/nano-banana-pro/edit` | **Unchanged** |

## Qualification

Founder controlled comparison selected NB2 for Studio World dimensionality, architectural believability, and premium material treatment without sterile CAD detachment.

Generic marble in qualification test → fixed by brand asset grounding sprint.
