# Provider Abstraction — Studio Generation Manager™

**Engine Module:** `studio.generation-manager.v1.providers`  
**Status:** Multi-provider routing · execution layer

---

## Principle

> **Generation Manager™ never depends on one AI provider.**

It decides where work is sent. Providers are interchangeable workers.

**Note:** Asset Compiler™ defines provider-agnostic **prompt expansion**. Generation Manager owns **provider execution** — complementary, not duplicate.

---

## Architecture

```
Generation Manager
         ↓
Provider Router (per asset type · org policy · health)
         ↓
Provider Adapter Layer
         ↓
┌────────┬──────────┬────────┬──────┬─────┐
│  FAL   │ OpenAI   │ Runway │ Luma │ BFL │
│        │ Images   │        │      │     │
└────────┴──────────┴────────┴──────┴─────┘
```

---

## Supported Providers (v1 Spec)

| Provider | ID | Asset Types | Status |
|----------|-----|-------------|--------|
| **FAL** | `fal` | mesh · texture · image · 3D | Primary v1 |
| **OpenAI Images** | `openai-images` | image · texture · edit | Fallback |
| **Runway** | `runway` | video · motion ref | Future v1.1 |
| **Luma** | `luma` | 3D · gaussian | Future v1.2 |
| **Black Forest Labs** | `bfl` | flux image | Future |
| **ElevenLabs** | `elevenlabs` | audio | Audio primary |
| **Suno** | `suno` | music | Audio fallback |

Generation Manager routes — does not implement provider SDKs in this sprint.

---

## Provider Adapter Interface

```yaml
ProviderAdapter:
  id: string
  displayName: string
  supportedAssetTypes: AssetType[]
  healthStatus: healthy | degraded | down
  rateLimitRemaining: number

  translatePrompt(expandedPrompt: ExpandedPromptStack): ProviderPayload
  submitJob(payload: ProviderPayload, options: SubmitOptions): ProviderJobId
  pollJob(jobId: ProviderJobId): ProviderJobStatus
  retrieveArtifact(jobId: ProviderJobId): CookedArtifact
  cancelJob(jobId: ProviderJobId): boolean
  estimateMinutes(payload: ProviderPayload): number
  estimateCost(payload: ProviderPayload): CostEstimate
```

---

## Routing Decision

```yaml
ProviderRouteDecision:
  assetId: string
  assetType: string
  primary: string                     # from expandedPrompt.providerRoute
  selected: string                    # actual after routing
  reason: string
  fallbacks: string[]
```

### Routing Factors

| Factor | Weight |
|--------|--------|
| Expanded prompt `providerRoute` | 40% |
| Asset type capability | 25% |
| Provider health | 20% |
| Org preference / policy | 10% |
| Cost optimization | 5% |

---

## Asset Type Routing Table

| Asset Type | Primary (v1) | Fallback 1 | Fallback 2 |
|------------|--------------|------------|------------|
| `environment-mesh` | FAL | OpenAI | — |
| `furniture-mesh` | FAL | OpenAI | — |
| `glass-mesh` | FAL (GPT Image 2) | OpenAI | — |
| `texture-pbr` | FAL | procedural | OpenAI |
| `lighting-metadata` | internal | — | — |
| `particle-metadata` | internal | — | — |
| `audio-ambient` | ElevenLabs | Suno | — |
| `audio-sfx` | ElevenLabs | — | — |
| `animation-metadata` | internal | Runway (future) | — |
| `hologram-mesh` | FAL | OpenAI | — |

`internal` = no provider — metadata-only queue items.

---

## Provider Job Lifecycle

```
submitJob → ProviderJobId
         ↓
pollJob (exponential backoff 2s → 30s cap)
         ↓
├── pending | processing → continue poll
├── complete → retrieveArtifact
├── failed → retry engine (provider-failover)
└── timeout → retry engine (timeout class)
```

### SLA Defaults

| Provider | Timeout | Max Poll |
|----------|---------|----------|
| FAL mesh | 15 min | 450s |
| FAL image | 8 min | 240s |
| OpenAI Images | 5 min | 180s |
| ElevenLabs | 3 min | 120s |

---

## Cooked Artifact Contract

```yaml
CookedArtifact:
  assetId: string
  providerId: string
  providerJobId: string
  format: glb | png | mp3 | json | shader
  bytes: number
  checksum: sha256
  storageRef: artifact://...
  metadata:
    width: number
    height: number
    durationSeconds: number
  generatedAt: ISO8601
```

Manager stores artifact before validation handoff.

---

## Org Provider Policy

```yaml
OrgProviderPolicy:
  orgId: string
  allowedProviders: string[]
  deniedProviders: string[]
  preferLowCost: boolean
  allowExperimentalProviders: boolean
  monthlyBudgetCredits: number | null
```

Budget exceeded → pause job · notify founder.

---

## Golden Model Routes

CDS assets use routes from Compiler + motherboard golden models:

| Asset | Route |
|-------|-------|
| Glass · acrylic | `fal/openai/gpt-image-2/edit` |
| Environment plates | `fal-ai/nano-banana-pro` (NBP) |
| Furniture mesh | `fal` 3D route per Design Registry |
| Orb | reuse — no provider |

Manager reads `modelRoute` from `13_prompts/{assetId}.json` — does not invent routes.

---

## Health & Failover

```yaml
ProviderHealth:
  providerId: string
  status: healthy | degraded | down
  lastChecked: ISO8601
  errorRate5m: number
  avgLatencyMs: number
```

| Status | Routing |
|--------|---------|
| healthy | Normal |
| degraded | Prefer fallback for non-hero |
| down | Immediate failover · hero may wait 60s |

---

## Cost Tracking

Per job:

```yaml
CostSummary:
  jobId: string
  byProvider: Record<string, { credits: number, usd: number }>
  totalCredits: number
  totalUsd: number
```

Included in Build Report `estimatedRuntimeCost`.

---

## Boundary with Compiler

| Compiler | Generation Manager |
|----------|-------------------|
| Writes `providerRoute` in expanded prompt | Reads and executes |
| Estimates minutes | Tracks actual minutes |
| Provider-agnostic packaging | Provider-specific submission |
| Never calls APIs | Always calls adapters |

---

## v1 Implementation Note

**Do NOT connect to FAL in this sprint.** Adapter interface and routing tables are spec-only. First connection in production pipeline v1.1 execution.

---

_Provider Abstraction — route work, never marry one vendor._
