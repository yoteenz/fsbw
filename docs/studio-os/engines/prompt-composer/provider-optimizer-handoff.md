# Provider Optimizer™ Handoff

**Engine Module:** `studio.prompt-composer.v1.optimizer-handoff`  
**Status:** Composer → Optimizer → Generation Manager contract

---

## Position

**Provider Optimizer™** is the dedicated optimization layer between Prompt Composer™ and Generation Manager™.

It is **not** part of Prompt Composer™ — but this document defines the handoff contract both engines share.

---

## Handoff Flow

```
Prompt Composer™
  emit: ProductionPrompt™
         ↓
Provider Optimizer™
  select provider + model
  translate → OptimizedProviderPayload™
         ↓
Generation Manager™
  enqueue job with payload
  execute via ProviderAdapter
```

---

## Input: ProductionPrompt™

Full object per [production-prompt-schema.md](./production-prompt-schema.md).

Optimizer **must not** re-fetch Genome or Blueprint — all context is in `provenance` and `layers`.

---

## Output: OptimizedProviderPayload™

```yaml
OptimizedProviderPayload:
  $schema: studio.provider-optimizer.v1/optimized-payload.json

  # Links
  composeId: uuid
  promptVersion: string
  promptHash: sha256
  optimizedAt: ISO8601
  optimizerVersion: string

  # Selection
  selectedProvider: string          # fal | openai-images | flux | imagen | ...
  selectedModel: string
  selectionReason: string
  fallbacks: ProviderFallback[]

  # Provider-native payload
  payload:
    providerFamily: string
    endpoint: string | null         # internal routing only
    parameters: Record<string, unknown>
    positivePrompt: string
    negativePrompt: string
    structuredInput: object | null

  # Estimates (for Production Estimates™ reconciliation)
  costEstimate: CostEstimate
  durationEstimateMinutes: number

  # Audit
  routingFactors:
    providerHintsWeight: number
    healthWeight: number
    orgPolicyWeight: number
    costWeight: number
```

---

## Routing Decision

Optimizer applies factors from [Generation Manager provider-abstraction](../generation-manager/provider-abstraction.md):

| Factor | Weight |
|--------|--------|
| `providerHints` from ProductionPrompt™ | 40% |
| Asset type capability | 25% |
| Provider health | 20% |
| Org policy | 10% |
| Cost optimization | 5% |

---

## Provider Family Translation

### FAL

```yaml
payload:
  model: string                     # from modelRouteRef or golden route
  prompt: positivePrompt
  negative_prompt: negativePrompt
  image_size: derived from rendering.resolution
  num_inference_steps: from quality tier
```

### OpenAI Images

```yaml
payload:
  model: gpt-image-1 | dall-e-3
  prompt: positivePrompt
  size: mapped from aspectRatio
  quality: hd | standard from qualityTier
  response_format: url | b64_json
```

### Flux (BFL)

```yaml
payload:
  prompt: positivePrompt
  structured: structuredPrompt
  guidance: providerHints.parameters.guidanceScale
  aspect_ratio: rendering.aspectRatio
```

### Imagen

```yaml
payload:
  prompt: positivePrompt
  aspectRatio: IMAGEN_ENUM from rendering.aspectRatio
  safetySetting: from org policy
  numberOfImages: 1
```

---

## Generation Manager™ Consumption

Generation Manager **never** receives `ProductionPrompt™` directly.

| Manager reads | From |
|---------------|------|
| `OptimizedProviderPayload™` | Provider Optimizer™ |
| `composeId` · `promptVersion` | For Registry + Build Report |
| `selectedProvider` | Routing · retry · failover |

Per [Generation Manager README](../generation-manager/README.md):

> Generation Manager consumes optimized payloads — never re-expands or re-composes.

---

## Failover

| Event | Optimizer action |
|-------|------------------|
| Primary provider down | Select `fallbacks[0]` · new payload |
| Cost budget exceeded | Downgrade model · re-optimize |
| Capability mismatch | Route to next `preferredFamily` |

Retry execution owned by Generation Manager [retry-engine](../generation-manager/retry-engine.md).

---

## Skip Path — Registry Reuse

When Scene Planner™ marks `reuseResolution: exact-match`:

```
Prompt Composer™ → skipped (no ProductionPrompt™)
Provider Optimizer™ → skipped
Generation Manager™ → registry attach job only
```

---

## Build Report Fields

```yaml
BuildReportPromptSection:
  composeId: uuid
  promptVersion: string
  promptHash: sha256
  selectedProvider: string
  selectedModel: string
  optimizerVersion: string
  composeDurationMs: number
  optimizeDurationMs: number
```

Written to [build-report-schema](../generation-manager/build-report-schema.md).

---

## Studio Alpha™ Visibility

| Plane | Sees |
|-------|------|
| **Founder / Studio OS** | Progress labels only |
| **Studio Alpha™ internal** | Full ProductionPrompt™ + OptimizedProviderPayload™ |

---

_Provider Optimizer™ Handoff — neutral brief in, routed payload out._
