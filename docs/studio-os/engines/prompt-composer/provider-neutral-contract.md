# Provider-Neutral Contract™

**Engine Module:** `studio.prompt-composer.v1.provider-neutral`  
**Status:** Foundational law — never hardcode to one provider

---

## Law

> **Never hardcode to FAL.**

> Prompt Composer™ outputs a **provider-neutral** `ProductionPrompt™`.

> Provider selection and payload translation happen **downstream** in Provider Optimizer™.

---

## Separation of Concerns

| Layer | Engine | Output |
|-------|--------|--------|
| **Translation** | Prompt Composer™ | `ProductionPrompt™` |
| **Optimization** | Provider Optimizer™ | `OptimizedProviderPayload™` |
| **Execution** | Generation Manager™ | Provider job + artifact |

```
Founder Intent
      ↓
ProductionPrompt™        ← provider-neutral (Composer)
      ↓
OptimizedProviderPayload™ ← provider-specific (Optimizer)
      ↓
Provider API call          ← execution (Manager)
```

---

## What "Provider-Neutral" Means

| Allowed in ProductionPrompt™ | Forbidden in ProductionPrompt™ |
|------------------------------|--------------------------------|
| Natural language layers | `fal-ai/nano-banana-pro` slugs |
| Structured layer objects | Provider API parameter names |
| `providerHints.preferredFamilies` | `providerId: "fal"` as final selection |
| `modelRouteRef` as **hint** | Hardcoded endpoint URLs |
| Capability tags | Provider-specific JSON schemas |
| Resolution · aspect · format | FAL-only `image_size` enums |

---

## Supported Provider Families (v1 Spec)

Optimizer adapts `ProductionPrompt™` for:

| Family | ID | Asset types | Notes |
|--------|-----|-------------|-------|
| **FAL** | `fal` | mesh · image · texture · 3D | Primary v1 execution |
| **OpenAI Images** | `openai-images` | image · texture · edit | Fallback · edit path |
| **Flux** | `flux` / `bfl` | image | Black Forest Labs route |
| **Imagen** | `imagen` | image | Google Imagen family |
| **ElevenLabs** | `elevenlabs` | audio | Audio primary |
| **Runway** | `runway` | video · motion | Future v1.1 |
| **Luma** | `luma` | 3D · gaussian | Future v1.2 |
| **Future** | `*` | extensible | Adapter registry |

Composer lists families in `providerHints.preferredFamilies` — **never** commits to one.

---

## Adapter Pattern (Downstream)

Provider Optimizer™ uses the same adapter interface as [Generation Manager provider-abstraction](../generation-manager/provider-abstraction.md):

```yaml
ProviderOptimizerAdapter:
  familyId: string
  optimize(productionPrompt: ProductionPrompt): OptimizedProviderPayload
  estimateCost(payload: OptimizedProviderPayload): CostEstimate
  estimateMinutes(payload: OptimizedProviderPayload): number
  supportedCapabilities: string[]
```

Each adapter translates neutral layers → provider-native payload:

| Provider | Translation example |
|----------|---------------------|
| FAL | `positivePrompt` + `negative_prompt` + `image_size` from `rendering` |
| OpenAI Images | `prompt` + `size` + `quality` + edit mask refs |
| Flux | Structured JSON + guidance from `providerHints.parameters` |
| Imagen | Text prompt + aspect ratio enum + safety settings |
| ElevenLabs | Sonic genome tokens → voice + ambience parameters |

---

## Provider Hints vs Provider Selection

```yaml
# Composer emits (hints):
providerHints:
  preferredFamilies: [fal, openai-images, imagen]
  assetType: image
  capabilityTags: [editorial, environment-plate]

# Optimizer emits (selection):
OptimizedProviderPayload:
  selectedProvider: openai-images
  selectedModel: gpt-image-1
  selectionReason: "org policy prefer-openai · fal degraded"
  payload: { ... provider-native ... }
```

---

## Org Provider Policy

Respected at **Optimizer** stage — not Composer:

```yaml
OrgProviderPolicy:
  allowedProviders: string[]
  deniedProviders: string[]
  preferLowCost: boolean
```

Composer may read policy to **order** `preferredFamilies` — but Optimizer enforces.

---

## Anti-Patterns

| Anti-pattern | Why forbidden |
|--------------|---------------|
| `if (provider === 'fal')` in Composer | Violates neutral contract |
| FAL slug in `layers.base` | Leaks provider into translation |
| Founder model picker | Bypasses Optimizer |
| Compose directly to API payload | Skips audit · versioning · reuse |
| One provider string in all docs | Use "providers" · "Optimizer" |

---

## Founder Experience

Founder never sees:

- Provider name
- Model slug
- Token count
- Negative prompt text
- API parameters

Founder sees:

- *"Composing production brief…"*
- *"Producing environment layer…"*
- *"Editorial luxury headquarters ready for review."*

---

## v1 Implementation Note

**Do NOT connect to any provider in this sprint.** Schemas and contracts only. First adapter wiring in Provider Optimizer™ v1.1 execution sprint.

---

_Provider-Neutral Contract™ — compose once, route anywhere._
