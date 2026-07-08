# Provider Abstraction — Studio Asset Compiler™

**Engine Module:** `studio.asset-compiler.v1.provider-abstraction`  
**Status:** Generator-agnostic manufacturing

---

## Principle

The compiler **expands prompts and packages assets**. Providers **execute generation**. Today: FAL. Tomorrow: anything.

```
Compiler (provider-agnostic)
         ↓
Provider Adapter Layer
         ↓
┌────────┬────────┬────────┬────────┐
│  FAL   │ OpenAI │ Runway │  Luma  │ …
└────────┴────────┴────────┴────────┘
```

Compiler output format **never changes** when providers change.

---

## Provider Adapter Interface (Abstract)

```yaml
ProviderAdapter:
  id: string                          # fal | openai | runway | midjourney | ...
  supportedAssetTypes: AssetType[]
  translatePrompt(expandedPrompt: ExpandedPromptStack): ProviderPayload
  submitJob(payload: ProviderPayload): JobId
  pollJob(jobId: JobId): JobStatus
  retrieveAsset(jobId: JobId): CookedAsset
  estimateMinutes(payload: ProviderPayload): number
```

Implementation deferred — v1 defines contract only.

---

## Asset Type Routing

| Asset Type | Primary (v1) | Fallback | Future |
|------------|--------------|----------|--------|
| `mesh` / GLB | FAL 3D | OpenAI image-to-mesh | CAD generators |
| `texture` / shader | FAL + procedural | OpenAI | Custom internal |
| `environment-plate` | FAL · GPT Image | OpenAI | Midjourney |
| `audio-stem` | Audio provider | ElevenLabs | Custom |
| `video-plate` | — | Runway | Luma |
| `particle-json` | Procedural (no AI) | — | — |
| `metadata` | Compiler-only | — | — |

Routing table in `14_metadata/provider-routes.json`.

---

## FAL Adapter (v1 Default)

Maps `13_prompts/{assetId}.json` → FAL API:

```json
{
  "adapter": "fal",
  "modelRoute": "design-registry/golden-models/glass-object",
  "payload": {
    "prompt": "<compiled primary prompt from layers>",
    "negative_prompt": "<layers.negative>",
    "image_size": { "width": 2048, "height": 2048 },
    "num_inference_steps": 28,
    "enable_safety_checker": true
  },
  "postProcess": ["background-removal", "mesh-reconstruction"],
  "outputPath": "05_glass/glass-panels-cds.glb"
}
```

Golden model routes from `motherboard/golden-models/` per project CORE.

---

## Provider-Agnostic Expanded Prompt

`13_prompts/` JSON is the **canonical** format. Adapters translate:

| Field | FAL | OpenAI | Runway |
|-------|-----|--------|--------|
| `layers.base` | `prompt` | `prompt` | `prompt` |
| `layers.negative` | `negative_prompt` | — | — |
| `generation.resolution` | `image_size` | `size` | `resolution` |
| `generation.aspectRatio` | derived | `size` | aspect param |
| `provider.parameters` | model-specific | model-specific | model-specific |

---

## Swapping Providers

| Change | Compiler Impact |
|--------|-----------------|
| New image model | Update Design Registry route only |
| New 3D provider | Add adapter · same 13_prompts |
| Provider deprecation | Fallback route in registry |
| Cost optimization | Per-stage provider split in handoff |

**Compiler logic unchanged.**

---

## Future Providers (Designed For)

| Provider | Use Case |
|----------|----------|
| OpenAI image generation | Environment plates · object refs |
| Midjourney | Mood reference plates |
| Runway | Motion plates · ceremony video refs |
| 3D generators | Direct GLB |
| Audio generators | Ambient · ceremony stems |
| CAD generators | Architecture shell precision |
| Custom internal models | Brand-specific fine-tunes |

See [future-roadmap.md](./future-roadmap.md) · [engine/asset-compiler/14_FUTURE_AI_PROVIDERS.md](../../engine/asset-compiler/14_FUTURE_AI_PROVIDERS.md).

---

## Provider Handoff File

`14_metadata/provider-handoff.json` — stage-ordered jobs with adapter ID per asset. Worker processes independent of compiler version once package sealed.
