# 06 — Asset Standard

**SDK Module:** `studio.department.sdk.v1.assets`  
**Status:** Modular composition law  
**Philosophy:** Every department is composed from modular assets — never a flattened scene

---

## Core Principle

> **Never generate one flattened scene.** Every department is an assembly of independently loadable, replaceable, versioned asset modules.

This is the equivalent of a game engine's asset pipeline: environments, props, materials, lighting, audio, and metadata are separate packages composed at runtime.

---

## Asset Module Categories

| Category | ID | Description | Load Priority |
|----------|----|-------------|---------------|
| **Environment** | `environment` | Room shell — walls, floor, ceiling, windows, skybox | 1 (first) |
| **Furniture** | `furniture` | Tables, shelves, pedestals, seating | 2 |
| **Glass Objects** | `glass` | Translucent surfaces, panels, displays | 3 |
| **Lighting** | `lighting` | Light anchors, fixtures, ambient sources | 4 |
| **Orb** | `orb` | Orb mesh, pedestal, glow effects | 5 |
| **Particles** | `particles` | Atmospheric effects, celebration bursts, ambient dust | 6 |
| **Materials** | `materials` | Surface shaders, glass tints, reflection maps | 0 (pre-load) |
| **Audio** | `audio` | Ambient loops, interaction sounds, ceremonies | 7 |
| **Animations** | `animations` | Object animations, camera paths, transitions | 8 |
| **Camera** | `camera` | Camera position presets, orbit constraints | 9 |
| **Metadata** | `metadata` | Department manifest, object placements, zone definitions | 0 (pre-load) |
| **Interaction Maps** | `interaction-maps` | Verb bindings, zone permissions, gesture maps | 10 (last) |

---

## Asset Module Schema

```yaml
AssetModule:
  id: string                  # globally unique
  category: AssetCategory
  version: semver
  departmentId: string
  format: enum                # gltf | usdz | svg-shell | audio-ogg | json-manifest | shader-bundle
  genomeAdaptable: boolean    # must be true for materials, lighting, particles, audio
  replaceable: boolean
  dependencies: string[]      # other asset module IDs
  fallbackId: string | null   # fallback asset if load fails
  sizeBudget: number          # max bytes
  lodLevels: LODLevel[]       # level of detail variants
  metadata:
    author: string
    created: datetime
    genomeHooks: string[]     # which genome domains affect this asset
    tags: string[]
```

---

## Category Specifications

### Environment

The spatial shell of the department — architecture without furniture or branding.

| Property | Specification |
|----------|---------------|
| Contains | Wall meshes, floor plane, ceiling, window openings, door frames, structural columns |
| Excludes | Furniture, branding, lighting fixtures, interactive objects |
| Format | glTF 2.0 primary; USDZ for AR preview |
| Genome hooks | `materialLanguage` (wall/floor materials), `spatialDesign` (proportions), `worldBuilding` (architectural style) |
| Replaceable | Yes — swap environment without touching furniture |
| Size budget | ≤ 5 MB (compressed) |

**Rule:** Environment assets are **neutral shells**. A law firm marble room and a creative neon loft are the same topology with different material injection.

---

### Furniture

Placeable work surfaces and storage.

| Property | Specification |
|----------|---------------|
| Contains | Mesh geometry, collision bounds, attachment points for objects |
| Format | glTF 2.0 with named attachment nodes |
| Genome hooks | `materialLanguage`, `spatialDesign` |
| Replaceable | Yes — per object instance |
| Size budget | ≤ 1 MB per piece |

**Attachment points:** Furniture declares named nodes where objects dock (e.g., `table-surface`, `shelf-rail`, `pedestal-top`).

---

### Glass Objects

Translucent interactive surfaces.

| Property | Specification |
|----------|---------------|
| Contains | Glass mesh, refraction shader, reflection map slot, content plane |
| Format | glTF + shader bundle |
| Genome hooks | `materialLanguage` (tint, opacity), `colorPrinciples` (edge glow) |
| Replaceable | Yes |
| Size budget | ≤ 500 KB per piece |

---

### Lighting

Scene illumination assets.

| Property | Specification |
|----------|---------------|
| Contains | Light rig definition (positions, types, intensities, colors as slots), IBL environment map slot |
| Format | JSON manifest + HDR environment map |
| Genome hooks | `lightingStyle` (primary), `colorPrinciples` (accent), `brandEmotions` (warmth/coolness) |
| Replaceable | Yes — lighting rig swaps without geometry change |
| Size budget | ≤ 2 MB (including IBL) |

**Rule:** Lighting assets define **slots and ranges** — Genome fills values. Never hardcode light colors.

---

### Orb

Studio Orb™ visual asset.

| Property | Specification |
|----------|---------------|
| Contains | Orb mesh, idle animation, state animations (listening, speaking, thinking), pedestal mesh |
| Format | glTF + animation clips |
| Genome hooks | `personality` (Orb skin), `colorPrinciples` (glow), `motionPhilosophy` (float behavior) |
| Replaceable | No — Orb visual is platform-consistent |
| Size budget | ≤ 1 MB |

---

### Particles

Atmospheric and ceremonial effects.

| Property | Specification |
|----------|---------------|
| Contains | Particle system definitions (emitter, lifetime, velocity, color slots) |
| Format | JSON manifest |
| Genome hooks | `colorPrinciples`, `brandEmotions`, `signatureAnimations` |
| Replaceable | Yes |
| Size budget | ≤ 100 KB per system |

**Ceremonial particles:** Approval burst, launch celebration, arrival dust — defined in Motion Standard (08).

---

### Materials

Surface appearance shaders.

| Property | Specification |
|----------|---------------|
| Contains | Shader definitions with Genome-parameterized slots (baseColor, roughness, metalness, emissive, normal) |
| Format | Shader bundle (GLSL/Metal/Vulkan compatible) |
| Genome hooks | `materialLanguage` (primary), `colorPrinciples` |
| Replaceable | Yes — material swap changes entire room feel |
| Size budget | ≤ 200 KB per material set |
| Load priority | 0 — materials load before geometry |

---

### Audio

Sound assets.

| Property | Specification |
|----------|---------------|
| Contains | Ambient loops, interaction SFX, ceremony sounds, Orb voice clips |
| Format | OGG Vorbis (ambient), WAV (SFX, ≤ 2s) |
| Genome hooks | `musicStyle`, `soundDesign` |
| Replaceable | Yes |
| Size budget | ≤ 3 MB total per department |
| Details | See [09 — Audio Standard](./09_AUDIO_STANDARD.md) |

---

### Animations

Motion assets.

| Property | Specification |
|----------|---------------|
| Contains | Object animation clips, camera path splines, transition sequences |
| Format | glTF animation channels + JSON camera paths |
| Genome hooks | `motionPhilosophy`, `pacing` |
| Replaceable | Yes (per clip) |
| Size budget | ≤ 500 KB per clip |
| Details | See [08 — Motion Standard](./08_MOTION_STANDARD.md) |

---

### Camera

Viewpoint presets.

| Property | Specification |
|----------|---------------|
| Contains | Named camera positions, FOV, orbit constraints, transition paths |
| Format | JSON manifest |
| Genome hooks | None (cameras are structural) |
| Replaceable | No |
| Size budget | ≤ 10 KB |

---

### Metadata

Department composition manifest.

| Property | Specification |
|----------|---------------|
| Contains | Department anatomy, object placements, zone bounds, AI employee assignments, dependency declarations |
| Format | JSON (follows 01 anatomy schema) |
| Genome hooks | All domains referenced |
| Replaceable | No — metadata is the assembly blueprint |
| Size budget | ≤ 50 KB |

---

### Interaction Maps

Behavioral binding manifest.

| Property | Specification |
|----------|---------------|
| Contains | Verb-to-object bindings, zone permissions, gesture maps, AI response triggers |
| Format | JSON (follows 04 interaction map schema) |
| Genome hooks | `interactionStyle`, `soundDesign` (feedback) |
| Replaceable | Yes |
| Size budget | ≤ 30 KB |

---

## Composition Rules

### Assembly Order

```
Materials → Metadata → Environment → Furniture → Glass → Lighting → Orb → Particles → Audio → Animations → Camera → Interaction Maps
```

### Independence Rules

| Rule | Description |
|------|-------------|
| **No embedding** | Assets reference each other by ID — never embed one inside another |
| **No flattening** | FAL and authoring tools must never output a single combined scene file |
| **Version independence** | Updating furniture does not require updating environment |
| **Genome at runtime** | Materials and lighting receive Genome values at assembly — not at generation |
| **Fallback chain** | Every asset declares `fallbackId` — runtime loads fallback on failure |

### LOD (Level of Detail)

```yaml
LODLevel:
  level: number           # 0 = highest detail
  distance: number        # camera distance threshold
  assetVariant: string    # alternate asset module ID
  polygonBudget: number
```

Minimum 2 LOD levels for environment and furniture. Orb and particles exempt.

---

## Asset Registry Integration

All department assets register with [Asset Registry™ M140](../asset-registry.md):

| Registry Field | Source |
|----------------|--------|
| Unique ID | Asset module ID |
| Category | Asset module category |
| Department | Parent department ID |
| Version | Module semver |
| Tags | Module metadata tags |
| Related Systems | Department Runtime, FAL Compiler |

---

## Packaging for Marketplace

Asset modules are the installable units in Marketplace packages (13). A department package contains:

```
department-package/
  manifest.json              # department anatomy + version
  assets/
    environment/
    furniture/
    glass/
    lighting/
    orb/
    particles/
    materials/
    audio/
    animations/
    camera/
    metadata/
    interaction-maps/
  genome-rules.json          # which domains adapt which assets
  dependencies.json
```

---

## Forbidden Patterns

| Pattern | Why Forbidden |
|---------|---------------|
| Single flattened GLB/FBX scene | Violates modularity — cannot replace independently |
| Hardcoded brand colors in assets | Must use Genome material slots |
| Embedded textures with brand logos | Logos come from Genome at runtime |
| Assets without fallback | Runtime must degrade gracefully |
| Assets without version | Cannot track or update independently |
| UI screenshots as environment | Environments are 3D/spatial shells |

---

_Next: [07 — Visual Language](./07_VISUAL_LANGUAGE.md)_
