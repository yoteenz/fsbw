# 06 — Metadata Standard

**Engine Module:** `studio.asset-compiler.v1.metadata`  
**Status:** Per-asset metadata law  
**Philosophy:** Every generated asset is a managed, auditable, versioned platform resource

---

## Definition

Every asset produced by the Studio Asset Compiler™ receives a **Metadata Record** — a structured document that makes the asset discoverable, versionable, regenerable, and Marketplace-compatible.

Metadata is attached at **assembly time** (Phase 4) and registered in **Asset Registry™** (M140) at export.

---

## Metadata Record Schema

```yaml
AssetMetadata:
  # Identity
  assetName: string                   # human-readable name
  assetId: string                     # globally unique, kebab-case
  version: string                     # e.g., v1, v2, v5
  semver: semver                      # semantic version

  # Classification
  assetCategory: AssetCategory        # environment | furniture | glass | ...
  department: string                  # parent department ID
  objectClass: string | null          # SDK object class ID (03)
  instanceId: string | null           # placement instance in department

  # Genome context
  genome:
    profileId: string                 # Genome snapshot used at compile
    domainsApplied: string[]           # which domains influenced this asset
    slots: string[]                   # runtime injection slots
    transformPreviews: string[]       # preview images per Genome profile

  # Dependencies
  dependencies:
    requires: string[]                  # asset IDs that must load first
    usedBy: string[]                  # asset IDs that depend on this
    sharedParameters: string[]        # inherited parameter keys

  # Profiles
  lightingProfile: string | null      # reference to lighting interaction
  animationProfile: string | null     # reference to motion profile (SDK 08)
  audioProfile: string | null         # reference to audio category (SDK 09)
  interactionProfile: string | null   # reference to verb bindings

  # Generation audit
  promptHistory:
    promptStackId: string
    promptHash: string
    templateId: string
    templateVersion: string
    provider: string
    model: string
    seed: number | null
    compiledAt: datetime
    inputManifestId: string
    cost: number | null

  # Authorship
  creator: string                     # compiler system or human approver
  generationDate: datetime
  approvedBy: string | null
  approvedAt: datetime | null

  # Distribution
  marketplaceTags: string[]
  compatibility:
    sdkVersions: string[]
    compilerVersions: string[]
    genomeVersions: string[]
    platformVersion: string
  license: enum | null

  # Technical
  format: string                      # gltf | json | ogg | hdr | webp
  sizeBytes: number
  checksum: string                    # sha256
  lodLevels: number
  fallbackId: string | null
  replaceable: boolean
  genomeAdaptable: boolean

  # Performance
  loadPriority: number                # 0–10 per SDK 06
  memoryEstimateMB: number
  gpuEstimate: enum                   # low | medium | high
```

---

## Required Fields (Every Asset)

| Field | Required | Notes |
|-------|----------|-------|
| `assetName` | ✓ | Human label |
| `assetId` | ✓ | Globally unique |
| `version` | ✓ | Incremental: v1, v2, ... |
| `assetCategory` | ✓ | From SDK 06 categories |
| `department` | ✓ | Parent department |
| `genome.profileId` | ✓ | Genome snapshot reference |
| `promptHistory.promptHash` | ✓ | Enables regeneration |
| `creator` | ✓ | Always `studio-asset-compiler` unless human override |
| `generationDate` | ✓ | ISO 8601 |
| `format` | ✓ | File format |
| `sizeBytes` | ✓ | For budget tracking |
| `checksum` | ✓ | Integrity validation |
| `replaceable` | ✓ | Default true |
| `genomeAdaptable` | ✓ | Default true for visual assets |

---

## Field Definitions

### Asset Name

Human-readable label for Asset Registry™ and admin interfaces.

```
"Creative Direction — Glass Table (Primary)"
"Marketing — Mood Wall Hero"
"Production — Ambient Audio Loop"
```

### Version

Incremental version within an asset lineage:

```
environment_v1 → environment_v2 → environment_v3
lighting_v5
orb_v8
timeline_v3
mood-wall_v12
```

Latest version has **no suffix** in filename; previous versions retain `_vN` suffix in package.

### Department

Parent department ID. Every asset belongs to exactly one department.

### Genome

Records which Company Genome snapshot influenced generation and which domains were applied. Enables:
- Regeneration with updated Genome
- Marketplace buyers to preview Genome transforms
- Audit trail for brand compliance

### Dependencies

Explicit dependency graph per asset:

```yaml
# timeline.glb metadata
dependencies:
  requires: [environment.glb, materials-furniture.json]
  usedBy: [interactions.json]
  sharedParameters: [spatial-envelope, floor-plane-node]
```

### Lighting Profile

References how this asset interacts with the lighting rig:

| Value | Meaning |
|-------|---------|
| `receives-light` | Standard mesh — receives scene lighting |
| `emits-light` | Light source asset |
| `transmits-light` | Glass — refraction + transmission |
| `ibl-source` | HDR environment map |
| `none` | Audio, JSON metadata — no lighting interaction |

### Animation Profile

References SDK 08 motion profiles:

```
approval-ceremony · arrival-sequence · timeline-scrub · orb-states · genome-refresh
```

### Prompt History

Full audit trail enabling exact regeneration:

```yaml
promptHistory:
  promptStackId: "ps-timeline-creative-direction-001"
  promptHash: "a3f8c2..."
  templateId: "tpl-furniture-timeline-table"
  templateVersion: "1.2.0"
  provider: "fal"
  model: "fal-ai/flux-pro"
  seed: 42
  compiledAt: "2026-07-07T22:00:00Z"
  inputManifestId: "im-compile-001"
  cost: 0.12
```

### Creator

| Value | Meaning |
|-------|---------|
| `studio-asset-compiler` | Automated generation |
| `human-override:{userId}` | Human-provided asset replacing generated |
| `marketplace-import:{packageId}` | Imported from Marketplace |

### Marketplace Tags

Standard tags for discovery (aligned with SDK 13):

```
creative-direction · furniture · glass · timeline · luxury · universal
```

### Compatibility

Declares which platform versions can consume this asset:

```yaml
compatibility:
  sdkVersions: ["1.0.0"]
  compilerVersions: ["1.0.0"]
  genomeVersions: ["1.0.0"]
  platformVersion: ">=2026.07.07"
```

---

## Metadata Storage

### Per-Asset Sidecar

Every asset file has a sidecar metadata file:

```
furniture/
├── timeline.glb
├── timeline.glb.meta.json          # AssetMetadata record
├── timeline_v2.glb
└── timeline_v2.glb.meta.json
```

### Package-Level Aggregation

`metadata.json` at package root aggregates all asset metadata plus assembly configuration (see 05).

### Asset Registry™ Registration

On export, every AssetMetadata record registers with Asset Registry™:

| Registry Field | Metadata Source |
|----------------|-----------------|
| Unique ID | `assetId` |
| Name | `assetName` |
| Category | `assetCategory` |
| Department | `department` |
| Version | `semver` |
| Tags | `marketplaceTags` |
| Storage Location | package path |
| Related Systems | department, compiler, runtime |

---

## Metadata for Deterministic Assets

Assets generated deterministically (no AI) still receive full metadata:

| Asset | promptHistory |
|-------|---------------|
| `interactions.json` | `provider: deterministic`, `templateId: sdk-interaction-map` |
| `camera.json` | `provider: deterministic`, `templateId: sdk-camera-presets` |
| `lights.json` | `provider: deterministic`, `templateId: sdk-lighting-rig` |
| `orb.glb` | `provider: platform-cache`, `templateId: platform-orb-standard` |

---

## Metadata Versioning

When an asset is regenerated:

1. Current version moves to `_vN` suffix
2. New generation becomes canonical (no suffix)
3. New AssetMetadata record created with incremented version
4. Previous metadata preserved (never deleted)
5. `dependencies.usedBy` updated if structure changed

```yaml
# Version history accessible via Asset Registry
VersionHistory:
  assetId: timeline
  versions:
    - version: v3
      generationDate: "2026-07-07T22:00:00Z"
      promptHash: "a3f8c2..."
      status: current
    - version: v2
      generationDate: "2026-07-05T14:00:00Z"
      promptHash: "b7d1e4..."
      status: archived
    - version: v1
      generationDate: "2026-07-01T10:00:00Z"
      promptHash: "c9a2f1..."
      status: archived
```

---

## Metadata Validation

Automated checks on every metadata record:

| Check | Failure |
|-------|---------|
| All required fields present | Reject asset |
| assetId globally unique | Reject or namespace |
| promptHash valid | Cannot regenerate — flag |
| dependencies resolvable | Reject asset |
| checksum matches file | Reject asset |
| sizeBytes matches file | Warning |
| version monotonically increasing | Reject version |
| compatibility matrix non-empty | Warning |

---

_Next: [07 — Department Compiler](./07_DEPARTMENT_COMPILER.md)_
