# Layer Model Routing Matrix™

**Version:** `layer-model-routing.v1`

## Routing classes

| Asset type | Layer IDs | FAL model | Mode | References |
|------------|-----------|-----------|------|------------|
| Environment shell | `environment-shell` | `fal-ai/nano-banana-pro/edit` | img2img | marble genesis or shell URL |
| Isolated landmark | `signature-landmark` | `fal-ai/nano-banana-pro` | text-to-image | placement metadata only |
| Isolated furniture group | `furniture-objects` | `fal-ai/nano-banana-pro` | text-to-image | placement metadata only |
| Blend overlays | lighting, atmosphere, materials, motion | `fal-ai/nano-banana-pro` | text-to-image | none |

## Why landmark no longer uses `/edit`

`nano-banana-pro/edit` is img2img-only. When shell reference was stripped, the server fell back to **marble-half.png** as img2img input — causing full-scene repaint behavior even with isolated prompts.

**Repair:** isolated object layers use `nano-banana-pro` (text-to-image) with **zero** `image_urls`.

## Model suitability matrix (compile run `run-1783893880377-6ymov2`)

| Scenario | Model | Reference | Tendency | Classification |
|----------|-------|-----------|----------|----------------|
| A. Legacy prompt + edit + shell | `nano-banana-pro/edit` | shell img2img | full-scene | COMBINED |
| B. Strict prompt + edit + shell | `nano-banana-pro/edit` | shell img2img | full-scene | REFERENCE-DOMINANT |
| C. Strict prompt + edit + metadata | `nano-banana-pro/edit` | marble img2img | full-scene | MODEL-DOMINANT |
| D. Strict prompt + t2i + metadata | `nano-banana-pro` | none | isolated-capable | **SHIPPED** |
| E. Strict prompt + t2i + masked guide | `nano-banana-pro` | structural guide | isolated-capable | Planned |

**Root cause classification:** **COMBINED** (prompt + reference + model)

## Governance

Routing resolved in `layer-model-routing.ts` → passed through `legacy-adapters.ts` → `studioBuilderGeneration.ts`. No ungoverned side path.
