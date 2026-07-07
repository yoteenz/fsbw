# 05 — Asset Package Specification

**Engine Module:** `studio.asset-compiler.v1.package`  
**Status:** Output format specification  
**Package Format:** `studio.department-package.v1`  
**Philosophy:** Everything modular — every file independently replaceable

---

## Definition

A **Department Asset Package** is the canonical output of the Studio Asset Compiler™. It is a self-contained, versioned, validated collection of modular assets ready for Studio Runtime assembly.

> One package per department per compile. Never one file. Never one scene.

---

## Package Directory Structure

```
{department-id}/
├── manifest.json                    # Package manifest (required)
├── metadata.json                    # Assembly metadata (required)
├── genome-hooks.json                # Genome injection map (required)
├── dependencies.json                # Package dependencies (required)
│
├── environment/
│   ├── environment.glb              # Room shell mesh
│   ├── environment_v1.glb           # Versioned (if superseded)
│   ├── floor-material.json          # Floor material slot reference
│   └── windows.glb                  # Window frames
│
├── furniture/
│   ├── desk.glb
│   ├── timeline.glb
│   ├── asset-shelf.glb
│   └── orb-pedestal.glb
│
├── glass/
│   ├── glass-wall.glb
│   ├── glass-table-surface.glb
│   └── floating-panel.glb
│
├── lighting/
│   ├── lights.json                  # Light rig definition
│   └── ibl-environment.hdr          # Image-based lighting
│
├── materials/
│   ├── materials-environment.json   # Shader bundle
│   ├── materials-furniture.json
│   └── materials-glass.json
│
├── orb/
│   └── orb.glb                      # Platform Orb (or reference to platform cache)
│
├── particles/
│   ├── particles-ambient.json
│   └── particles-ceremony.json
│
├── audio/
│   ├── audio.json                   # Audio manifest
│   ├── ambient-loop.ogg
│   ├── interaction-sfx/
│   │   ├── glass-tap.wav
│   │   ├── pin-stick.wav
│   │   └── ...
│   └── ceremony-sfx/
│       ├── approve-stamp.wav
│       └── launch-celebration.wav
│
├── animations/
│   ├── animations.json              # Animation manifest
│   ├── arrival-sequence.glb
│   ├── approval-ceremony.glb
│   └── orb-states.glb
│
├── camera/
│   └── camera.json                  # Camera position presets
│
├── interactions/
│   ├── interactions.json            # Verb bindings
│   └── ai-triggers.json             # AI response triggers
│
├── decor/
│   └── decor-accents.glb
│
├── previews/
│   ├── hero-angle.webp
│   ├── overview.webp
│   ├── thumbnail.webp
│   └── genome-transforms/
│       ├── luxury-hair.webp
│       ├── law-firm.webp
│       └── medical-practice.webp
│
├── validation/
│   └── validation-report.json       # QA results
│
└── README.md                        # Package documentation
```

---

## Example: Creative Direction Department

```
creative-direction/
├── manifest.json
├── metadata.json
├── genome-hooks.json
├── dependencies.json
│
├── environment/
│   ├── environment.glb
│   └── windows.glb
├── furniture/
│   ├── glass-table.glb
│   ├── timeline.glb
│   ├── asset-shelf.glb
│   └── orb-pedestal.glb
├── glass/
│   ├── mood-wall-surface.glb
│   └── interactive-wall.glb
├── lighting/
│   ├── lights.json
│   └── ibl-environment.hdr
├── materials/
│   ├── materials-environment.json
│   ├── materials-furniture.json
│   └── materials-glass.json
├── orb/
│   └── orb.glb
├── particles/
│   ├── particles-ambient.json
│   └── particles-ceremony.json
├── audio/
│   ├── audio.json
│   ├── ambient-loop.ogg
│   └── ceremony-sfx/approve-stamp.wav
├── animations/
│   ├── animations.json
│   └── arrival-sequence.glb
├── camera/
│   └── camera.json
├── interactions/
│   ├── interactions.json
│   └── ai-triggers.json
├── previews/
│   ├── hero-angle.webp
│   ├── overview.webp
│   └── thumbnail.webp
├── validation/
│   └── validation-report.json
└── README.md
```

---

## Manifest Schema

```yaml
PackageManifest:
  # Identity
  id: string                          # package UUID
  departmentId: string                # e.g., creative-direction
  departmentName: string
  version: semver                     # package version
  compilerVersion: "1.0.0"
  sdkVersion: "1.0.0"
  format: "studio.department-package.v1"

  # Compilation context
  organizationId: string
  genomeProfileId: string
  genomeSnapshotAt: datetime
  projectId: string | null
  compileMode: enum
  compiledAt: datetime
  compiledBy: string                  # user or system

  # Inventory
  assetCount: number
  categories: AssetCategoryInventory[]
  totalSizeBytes: number

  # Quality
  validationStatus: enum              # passed | conditional | failed
  validationReportId: string

  # Distribution
  marketplaceReady: boolean
  license: enum | null

  # Provider audit
  providers: ProviderUsage[]
  totalCost: number | null
```

---

## File Format Standards

| Extension | Content | Max Size |
|-----------|---------|----------|
| `.glb` / `.gltf` | 3D mesh + optional animation | 5 MB per file |
| `.json` | Manifests, configs, maps | 100 KB per file |
| `.hdr` | Image-based lighting | 2 MB |
| `.webp` | Preview renders, Mood Wall refs | 500 KB per file |
| `.ogg` | Ambient audio loops | 2 MB per file |
| `.wav` | SFX (≤ 2s) | 200 KB per file |
| `.md` | Documentation | 50 KB |

**Total package budget:** ≤ 25 MB (Marketplace); ≤ 50 MB (organization-internal).

---

## Modularity Rules

| Rule | Specification |
|------|---------------|
| **One asset per file** | Never combine furniture pieces in one GLB |
| **No embedded scenes** | GLB contains single object mesh, not room assembly |
| **Reference by ID** | Materials, lighting, interactions reference assets by ID |
| **No embedded branding** | Textures are neutral; Genome injects at runtime |
| **Version suffix** | Superseded assets keep `_vN` suffix; latest has no suffix |
| **README required** | Every package includes human-readable README |
| **Validation included** | QA report ships with package |

---

## manifest.json Example

```json
{
  "id": "pkg-creative-direction-001",
  "departmentId": "creative-direction",
  "departmentName": "Creative Direction",
  "version": "1.0.0",
  "compilerVersion": "1.0.0",
  "sdkVersion": "1.0.0",
  "format": "studio.department-package.v1",
  "organizationId": "org-frontal-slayer",
  "genomeProfileId": "genome-fs-2026-07-07",
  "projectId": "project-001",
  "compileMode": "full",
  "compiledAt": "2026-07-07T22:00:00Z",
  "assetCount": 28,
  "categories": [
    { "id": "environment", "count": 2, "sizeBytes": 3200000 },
    { "id": "furniture", "count": 4, "sizeBytes": 1800000 },
    { "id": "glass", "count": 2, "sizeBytes": 400000 },
    { "id": "lighting", "count": 2, "sizeBytes": 2100000 },
    { "id": "materials", "count": 3, "sizeBytes": 150000 },
    { "id": "audio", "count": 8, "sizeBytes": 1200000 },
    { "id": "animations", "count": 3, "sizeBytes": 500000 },
    { "id": "interactions", "count": 2, "sizeBytes": 15000 }
  ],
  "totalSizeBytes": 12415000,
  "validationStatus": "passed",
  "marketplaceReady": true,
  "license": "studio-free"
}
```

---

## metadata.json

Assembly blueprint — object placements, zone bounds, spatial configuration.

```yaml
PackageMetadata:
  spatialLayout:
    template: enum
    envelope: SpatialBounds
    entry: Position
    exit: Position
    zones: ZonePlacement[]
  objectPlacements:
    - instanceId: string
      classId: string
      position: { x, y, z }
      rotation: { x, y, z }
      scale: { x, y, z }
      zone: string
      assetFile: string             # relative path in package
  cameraPresets: string             # reference to camera/camera.json
  loadOrder: string[]               # assembly sequence per SDK 06
  performanceBudget:
    maxMemoryMB: 150
    targetFPS: 30
```

---

## genome-hooks.json

Maps Genome domains to package assets for runtime injection.

```yaml
GenomeHookManifest:
  hooks:
    - domain: colorPrinciples
      targets: [materials/*, particles/*]
      priority: 1
    - domain: materialLanguage
      targets: [materials/*, environment/*, furniture/*]
      priority: 1
    - domain: lightingStyle
      targets: [lighting/lights.json]
      priority: 1
    - domain: visualReferences
      targets: [glass/mood-wall-surface.glb]
      priority: 2
    - domain: musicStyle
      targets: [audio/ambient-loop.ogg]
      priority: 2
    - domain: voice
      targets: [interactions/ai-triggers.json]
      priority: 3
```

---

## interactions.json

```yaml
InteractionMap:
  departmentId: string
  version: string
  bindings:
    - verb: approve
      object: approval-station-01
      zone: ceremony
      permission: creative-direction.approve
      feedbackProfile: approval-ceremony
    - verb: scrub
      object: timeline-01
      zone: primary
      permission: creative-direction.schedule
      feedbackProfile: timeline-scrub
  zones:
    - id: primary
      allowedVerbs: [click, drag, pin, scrub, compare]
```

---

## Package Integrity

Every package includes a checksum manifest:

```yaml
IntegrityManifest:
  packageId: string
  algorithm: sha256
  files:
    - path: string
      checksum: string
      sizeBytes: number
```

Runtime validates checksums on load. Mismatch → fallback asset.

---

## Forbidden Package Contents

| Forbidden | Why |
|-----------|-----|
| Single combined scene GLB | Violates modularity |
| UI screenshot as environment | Departments are 3D worlds |
| Hardcoded brand textures | Genome injects at runtime |
| Embedded API keys | Security |
| Unversioned assets | Cannot track or regenerate |
| Missing interactions.json | Department non-functional |
| Missing metadata.json | Runtime cannot assemble |
| Packages > 50 MB | Performance budget |

---

_Next: [06 — Metadata Standard](./06_METADATA_STANDARD.md)_
