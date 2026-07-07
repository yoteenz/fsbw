# 14 — Future AI Providers

**Engine Module:** `studio.asset-compiler.v1.providers`  
**Status:** Provider abstraction layer specification  
**Philosophy:** The compiler never depends on one model — providers change without changing Studio OS

---

## Definition

The **Provider Abstraction Layer** decouples the Studio Asset Compiler™ from any specific AI provider. The compiler outputs **standardized generation requests**; providers implement adapters that fulfill those requests.

> Providers can change. Models can change. Studio OS remains stable.

---

## Architecture

```
Prompt Compiler (03)
    │
    ▼
Generation Request (standardized)
    │
    ▼
┌─────────────────────────────────────────┐
│       PROVIDER ABSTRACTION LAYER         │
│                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   FAL   │ │ OpenAI  │ │   BFL   │   │
│  │ Adapter │ │ Adapter │ │ Adapter │   │
│  └────┬────┘ └────┬────┘ └────┬────┘   │
│       │           │           │         │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐   │
│  │ Runway  │ │  Luma   │ │ Future  │   │
│  │ Adapter │ │ Adapter │ │ Adapter │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                          │
│  Router · Fallback · Cost · Rate Limit   │
└─────────────────────────────────────────┘
    │
    ▼
Provider Response (standardized)
    │
    ▼
Post-Processing → Asset Package (05)
```

---

## Standardized Generation Request

Every provider receives the same request format:

```yaml
GenerationRequest:
  id: string
  promptStackId: string
  assetId: string
  category: AssetCategory

  # Prompt (from Prompt Compiler)
  prompt:
    positive: string
    negative: string
    variables: PromptVariableMap

  # Output specification
  output:
    format: enum                # gltf | glb | json | ogg | wav | hdr | webp | mp4
    resolution: string          # e.g., "1024x1024", "2048x2048"
    aspectRatio: string | null
    duration: number | null     # for audio/video
    seed: number | null

  # Routing
  priority: enum                # draft | standard | premium
  timeout: number                 # seconds
  retryPolicy: RetryPolicy

  # Audit
  organizationId: string
  departmentId: string
  compileRequestId: string
```

---

## Standardized Provider Response

```yaml
GenerationResponse:
  requestId: string
  status: enum                    # success | failed | timeout | rejected
  provider: string
  model: string

  # Output
  artifacts:
    - format: string
      data: bytes | url
      sizeBytes: number
      checksum: string

  # Audit
  duration: number                # milliseconds
  cost: number | null
  seed: number | null             # actual seed used
  metadata: ProviderMetadata

  # Error
  error: string | null
  retryable: boolean
```

---

## Provider Adapter Interface

Every provider implements:

```yaml
ProviderAdapter:
  id: string                      # e.g., "fal", "openai", "bfl", "runway", "luma"
  name: string
  version: string
  status: enum                      # active | deprecated | beta

  capabilities:
    categories: AssetCategory[]     # which asset categories supported
    formats: string[]               # output formats supported
    maxResolution: string
    supportsSeed: boolean
    supportsNegativePrompt: boolean
    supports3D: boolean
    supportsAudio: boolean
    supportsVideo: boolean

  methods:
    generate(request) → GenerationResponse
    estimateCost(request) → CostEstimate
    healthCheck() → HealthStatus

  config:
    apiKey: secret
    baseUrl: string
    rateLimit: RateLimit
    timeout: number
    retryPolicy: RetryPolicy
```

---

## Supported Providers

### FAL

| Field | Value |
|-------|-------|
| **ID** | `fal` |
| **Categories** | environment, furniture, glass, decor, mood-wall, particles, audio, previews |
| **Models** | Flux Pro, SDXL, audio generation models |
| **Strengths** | Fast image/3D generation, good for iterative drafts |
| **Golden models** | `motherboard/golden-models/fal-*` |

### OpenAI Image Generation

| Field | Value |
|-------|-------|
| **ID** | `openai` |
| **Categories** | mood-wall, previews, decor, thumbnails |
| **Models** | GPT Image, DALL-E |
| **Strengths** | High-quality 2D imagery, preview renders |
| **Golden models** | `motherboard/golden-models/openai-*` |

### Black Forest Labs (BFL)

| Field | Value |
|-------|-------|
| **ID** | `bfl` |
| **Categories** | environment, furniture, mood-wall, previews |
| **Models** | Flux Pro, Flux Dev |
| **Strengths** | High-fidelity image generation, material textures |
| **Golden models** | `motherboard/golden-models/bfl-*` |

### Runway

| Field | Value |
|-------|-------|
| **ID** | `runway` |
| **Categories** | animations, previews, tour-clips |
| **Models** | Gen-3, motion models |
| **Strengths** | Video and motion generation |
| **Golden models** | `motherboard/golden-models/runway-*` |

### Luma

| Field | Value |
|-------|-------|
| **ID** | `luma` |
| **Categories** | environment, furniture, orb-pedestal |
| **Models** | Luma Genie, Dream Machine |
| **Strengths** | 3D object and environment generation |
| **Golden models** | `motherboard/golden-models/luma-*` |

### Future Providers

| Field | Value |
|-------|-------|
| **ID** | `future-{name}` |
| **Registration** | Implement ProviderAdapter interface |
| **Testing** | Golden model + golden prompt QA before production |
| **Promotion** | Prompt Registry™ approval |

---

## Provider Routing

```yaml
ProviderRouter:
  rules:
    - category: environment
      preferred: luma
      fallback: [fal, bfl]
    - category: furniture
      preferred: luma
      fallback: [fal]
    - category: mood-wall
      preferred: bfl
      fallback: [openai, fal]
    - category: audio
      preferred: fal
      fallback: []
    - category: animations
      preferred: runway
      fallback: [fal]
    - category: previews
      preferred: bfl
      fallback: [openai]
    - category: particles
      preferred: deterministic
      fallback: []
    - category: interactions
      preferred: deterministic
      fallback: []
    - category: lighting
      preferred: deterministic
      fallback: []
    - category: camera
      preferred: deterministic
      fallback: []
    - category: materials
      preferred: deterministic
      fallback: []
```

**Deterministic** = no AI provider; generated from templates and rules.

---

## Fallback Chain

```
Primary provider attempt
    ↓ (fail)
Fallback provider #1
    ↓ (fail)
Fallback provider #2
    ↓ (fail)
SDK default fallback asset
    ↓
Log warning + continue pipeline
```

| Failure Type | Action |
|-------------|--------|
| Timeout | Retry same provider (max 2) |
| Rate limit | Queue + retry with backoff |
| Model error | Route to fallback provider |
| Content policy rejection | Adjust negative prompt + retry |
| All providers fail | Use SDK fallback asset |
| Cost exceeded | Halt; request approval |

---

## Cost Management

```yaml
CostManager:
  organizationBudget: number | null
  compileBudget: number | null
  perAssetBudget: number | null

  tracking:
    - requestId: string
      provider: string
      model: string
      cost: number
      category: string

  gates:
    - estimate before compile plan approval
    - track during generation
    - halt if budget exceeded (unless approved)
```

---

## Provider Health

```yaml
HealthCheck:
  provider: string
  status: enum                    # healthy | degraded | unavailable
  latency: number                 # ms
  successRate: number             # last 100 requests
  lastChecked: datetime
```

Unhealthy providers are automatically removed from routing until recovery.

---

## Adding a New Provider

```
Step 1: Implement ProviderAdapter interface
Step 2: Register in provider registry
Step 3: Map supported categories
Step 4: Create golden model entries (motherboard/golden-models/)
Step 5: Create golden prompt entries (motherboard/golden-prompts/)
Step 6: QA test per category with 3+ Genome profiles
Step 7: Add to routing rules (beta status)
Step 8: Promote to production after product owner approval
```

**No changes to:** Prompt Compiler, Pipeline, Package Spec, Runtime, or SDK.

---

## Model Orchestrator Integration

Studio OS **Model Orchestrator™** consults provider health, cost, quality, and organization settings when routing:

```
GenerationRequest
    → Model Orchestrator.resolve(request)
    → Provider Router.select(provider, model)
    → Provider Adapter.generate(request)
```

Model selection considers: task type, quality requirement, cost budget, data sensitivity, org preferences, provider availability.

---

_Next: [15 — Implementation Guide](./15_IMPLEMENTATION_GUIDE.md)_
