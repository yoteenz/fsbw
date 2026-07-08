# Production Prompt Schema™

**Engine Module:** `studio.prompt-composer.v1.schema`  
**Status:** Canonical provider-neutral output object

---

## Law

> Prompt Composer™ outputs **one** `ProductionPrompt™` object per generation line item.

> The object is **provider-neutral** until [Provider Optimizer™](./provider-optimizer-handoff.md) adapts it.

---

## Root Schema

```yaml
ProductionPrompt:
  $schema: studio.prompt-composer.v1/production-prompt.json

  # Identity
  composeId: uuid
  promptVersion: string
  promptHash: sha256
  composedAt: ISO8601
  composerVersion: string

  # Scope
  orgId: string
  departmentId: string
  workspaceScene: string | null
  sceneId: string | null
  layerId: string | null
  category: AssetCategory              # Scene Stack™ category
  lineItemId: string
  productionEstimateId: string | null

  # Provenance
  provenance:
    founderIntentId: uuid | null
    blueprintId: string
    blueprintVersion: string
    scenePlanId: string
    companyDnaHash: sha256
    genomeVersion: string
    registryRefs: RegistryRef[]
    sourceHashes:
      companyDna: sha256
      blueprint: sha256
      workspaceRules: sha256
      fragments: sha256[]

  # Layered prompt content (provider-neutral natural language + structured)
  layers:
    intent: string
    base: string
    physical: PhysicalLayer | null
    architectural: ArchitecturalLayer | null
    material: MaterialLayer | null
    lighting: LightingLayer | null
    atmosphere: AtmosphereLayer | null
    camera: CameraLayer | null
    workspace: WorkspaceLayer | null
    genome: GenomeLayer
    registry: RegistryLayerRef[]
    negative: string

  # Requirements (provider-agnostic)
  rendering: RenderingRequirements
  quality: QualityRequirements

  # Hints — Optimizer selects provider
  providerHints: ProviderHints

  # Serialization helpers (built at compose time)
  serialized:
    positivePrompt: string      # merged layers for text-first providers
    structuredPrompt: object    # full layers object for structured adapters
    tokenEstimate: number
```

---

## Layer Types

### PhysicalLayer

```yaml
PhysicalLayer:
  dimensions: { widthM, heightM, depthM } | null
  scale: string                 # human-reference · hero · product
  thickness: string | null
  transparency: number | null
  edgeFinish: string | null
```

### ArchitecturalLayer

```yaml
ArchitecturalLayer:
  envelope: string
  proportion: string
  materialFamilies: string[]
  rhythm: string | null
  negativeArchitecture: string[]
```

### MaterialLayer

```yaml
MaterialLayer:
  primary: string
  secondary: string[]
  genomeSlot: string
  reflectionBehavior: string | null
  pbrHints: Record<string, unknown> | null
```

### LightingLayer

```yaml
LightingLayer:
  behavior: string
  keyFillRatio: string | null
  volumetric: boolean
  genomeSlot: string
  profileRef: string | null     # Registry lighting profile ID
```

### CameraLayer

```yaml
CameraLayer:
  angle: string
  focalLength: string
  isolation: transparent-background | environment-plate | product-isolation
  motion: string | null
  profileRef: string | null
```

### GenomeLayer

```yaml
GenomeLayer:
  injectionSlots: string[]
  resolvedTokens: Record<string, string>
```

---

## RenderingRequirements

```yaml
RenderingRequirements:
  resolution: string
  aspectRatio: string
  outputFormat: glb | png | jpg | mp3 | wav | json | shader
  objectIsolation: boolean
  transparentBackground: boolean
  layerIsolation: boolean
  parallaxPlanes: number | null
  colorSpace: srgb | linear | null
```

---

## QualityRequirements

```yaml
QualityRequirements:
  qualityTier: draft | standard | editorial-luxury | golden-build
  blueprintComplianceMin: number
  perspectiveCompliance: boolean
  genomeMatchMin: number
  validationLoopProfile: string
```

---

## ProviderHints (Not Final Route)

```yaml
ProviderHints:
  assetType: mesh | image | texture | audio | video | metadata
  capabilityTags: string[]
  preferredFamilies: string[]   # fal | openai-images | flux | imagen | bfl | elevenlabs
  modelRouteRef: string | null
  parameters:
    style: string | null
    guidanceScale: number | null
    seed: number | null
```

**No `providerId` or `modelSlug` in ProductionPrompt™** — those appear only on `OptimizedProviderPayload™` after Provider Optimizer™.

---

## Serialized Output

### positivePrompt

Merged natural-language string for text-first providers:

```
Order: base → architectural → material → lighting → atmosphere → camera → workspace → genome tokens
Separator: ", "
Negative: NOT included in positivePrompt — passed separately
```

### structuredPrompt

Full `layers` object — for adapters that accept JSON structured input (Flux · Imagen structured modes · future).

---

## Example — Editorial Luxury HQ (Abbreviated)

```json
{
  "$schema": "studio.prompt-composer.v1/production-prompt.json",
  "composeId": "550e8400-e29b-41d4-a716-446655440000",
  "promptVersion": "prompt-composer/2026-07-08/a1b2c3d4",
  "promptHash": "sha256:…",
  "category": "Environment Shell™",
  "layers": {
    "intent": "editorial luxury headquarters",
    "base": "Cinematic editorial luxury corporate headquarters interior, double-height arrival lobby",
    "architectural": {
      "envelope": "monumental double-height volume with restrained column rhythm",
      "materialFamilies": ["warm stone", "aged brass", "frosted glass"]
    },
    "lighting": {
      "behavior": "editorial key with warm fill and subtle volumetric haze",
      "profileRef": "registry:lighting-editorial-rig-v3"
    },
    "camera": {
      "angle": "wide establishing entrance",
      "focalLength": "24mm equivalent",
      "isolation": "environment-plate"
    },
    "negative": "dashboard, SaaS UI, browser chrome, kanban, readable text, flat icon, whiteboard"
  },
  "rendering": {
    "resolution": "3840x1600",
    "aspectRatio": "21:9",
    "outputFormat": "png",
    "layerIsolation": true
  },
  "quality": {
    "qualityTier": "editorial-luxury",
    "blueprintComplianceMin": 0.92
  },
  "providerHints": {
    "assetType": "image",
    "preferredFamilies": ["fal", "openai-images", "imagen"],
    "capabilityTags": ["editorial", "environment-plate", "21:9"]
  }
}
```

---

## Registry Storage

On generation complete, `promptVersion` + `promptHash` written to [Canonical Asset Record™](../studio-asset-registry/canonical-asset-record.md).

Prompt Library may store golden `ProductionPrompt™` templates as Registry Items (`prompt.template`).

---

## Compatibility

| Consumer | Reads |
|----------|-------|
| Provider Optimizer™ | Full `ProductionPrompt™` |
| Generation Manager™ | `OptimizedProviderPayload™` only |
| Quality Inspector™ | `quality` + `provenance` |
| Asset Registry™ | `promptVersion` · `promptHash` · `registryRefs` |
| Studio Alpha™ | `ComposeAuditRecord` |

---

_Production Prompt Schema™ — one object, every provider, zero founder exposure._
