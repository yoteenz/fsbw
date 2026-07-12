# Layer Model Routing Matrix™

**Version:** `layer-model-routing.v2`

## Routing classes

| Asset type | Layer IDs | FAL model | Mode | References |
|------------|-----------|-----------|------|------------|
| Environment shell | `environment-shell` | `fal-ai/nano-banana-pro/edit` | img2img | marble genesis or shell URL |
| Isolated landmark | `signature-landmark` | `fal-ai/nano-banana-2` (+ `/edit` when brand refs) | text-to-image / material edit | brand materials + placement metadata |
| Isolated furniture group | `furniture-objects` | `fal-ai/nano-banana-2` (+ `/edit` when brand refs) | text-to-image / material edit | brand materials + placement metadata |
| Blend overlays | lighting, atmosphere, materials, motion | `fal-ai/nano-banana-2` | text-to-image | none |
| Background removal | verified pipeline cleanup | `fal-ai/birefnet/v2` | dedicated | none |

## Founder decision (2026-07-12)

Isolated assets promoted to **Nano Banana 2** after controlled visual comparison. Environment shell **unchanged** on `nano-banana-pro/edit`.

Brand-grounded isolated assets with required marble use `nano-banana-2/edit` with **material-only** `image_urls` — never shell screenshots.

## Governance

Routing resolved via **Model Registry** (`creative-production/model-registry/`) → `layer-model-routing.ts` → `legacy-adapters.ts` → `studioBuilderGeneration.ts`. Brand materials via `brand-asset-grounding/`.
