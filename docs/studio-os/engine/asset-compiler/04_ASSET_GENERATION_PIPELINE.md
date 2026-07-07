# 04 — Asset Generation Pipeline

**Engine Module:** `studio.asset-compiler.v1.pipeline`  
**Status:** Ordered generation specification  
**Philosophy:** Nothing generates out of order — dependencies are sacred

---

## Definition

The Asset Generation Pipeline executes PromptStacks (03) in **strict dependency order**, producing raw assets that are post-processed, validated, and handed to the Package Assembler.

> Architecture before furniture. Materials before geometry. Interactions after objects.

---

## Pipeline Stages

```
Stage 0:  ARCHITECTURE PLAN
Stage 1:  STRUCTURAL ENVIRONMENT
Stage 2:  LIGHTING
Stage 3:  MATERIALS
Stage 4:  FURNITURE
Stage 5:  DECOR
Stage 6:  GLASS ELEMENTS
Stage 7:  INTERACTIVE OBJECTS
Stage 8:  ORB
Stage 9:  PARTICLES
Stage 10: AUDIO
Stage 11: ANIMATION METADATA
Stage 12: INTERACTION MAPS
Stage 13: PREVIEW RENDERS
Stage 14: VALIDATION
```

Each stage must **complete** before the next begins. Within a stage, independent assets generate in parallel (max concurrency: 6).

---

## Stage 0: Architecture Plan

**Type:** Deterministic (no AI generation)  
**Input:** Input Manifest + Prompt Compilation Manifest  
**Output:** `architecture-plan.json`

| Action | Description |
|--------|-------------|
| Compute spatial envelope | Validate zone bounds, object placements |
| Build dependency graph | Asset → depends-on relationships |
| Assign generation order | Topological sort of all assets |
| Estimate resources | Cost, duration, provider distribution |
| Flag conflicts | Overlapping objects, missing dependencies |

**Gate:** Human approval required before Stage 1 begins.

---

## Stage 1: Structural Environment

**Assets:** Environment shell, floor, ceiling, walls, windows, doors  
**Provider:** 3D scene generation model  
**Blocking:** Yes — all subsequent stages depend on environment proportions

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `environment-shell` | `.gltf` room mesh | Architecture plan |
| `floor-surface` | Material slot reference | Environment shell |
| `ceiling-sky` | Ceiling mesh or sky gradient | Environment shell |
| `windows-01..N` | Window frame + glass pane meshes | Environment shell |

**Post-processing:**
- Normalize to SDK coordinate system (02)
- Validate spatial envelope bounds
- Generate collision mesh
- Create LOD 0 + LOD 1 variants
- Assign attachment nodes (wall-planes, floor-plane)

**Validation:**
- Envelope matches World Rules
- No branding detected in mesh textures
- Size ≤ 5 MB compressed

---

## Stage 2: Lighting

**Assets:** Light rig, IBL environment map  
**Provider:** Deterministic JSON + HDR generation/selection  
**Blocking:** Materials stage needs light rig structure

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `lighting-rig` | `lights.json` | Environment shell (anchor positions) |
| `ibl-environment` | `.hdr` environment map | Environment shell, Genome lightingStyle |

**Post-processing:**
- Position anchors per SDK spatial layout (hero, work, ambient, ceremony)
- Parameterize all values as Genome slots
- Validate three-point minimum

---

## Stage 3: Materials

**Assets:** Shader bundles per surface family  
**Provider:** Shader generation / procedural  
**Blocking:** All geometry stages need material slots

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `material-set-environment` | Shader bundle | Genome materialLanguage |
| `material-set-furniture` | Shader bundle | Genome materialLanguage |
| `material-set-glass` | Shader bundle | Genome materialLanguage, colorPrinciples |

**Post-processing:**
- All color slots set to `null` (Genome runtime injection)
- Roughness/metalness defaults from Design Language
- Normal maps generated per material family
- Validate shader compatibility (GLSL/Metal/Vulkan)

**Critical rule:** Materials generate with **empty Genome slots** — never pre-filled brand colors.

---

## Stage 4: Furniture

**Assets:** Tables, shelves, pedestals, seating, consoles  
**Provider:** 3D object generation model  
**Parallel:** Yes — all furniture pieces simultaneously

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `glass-table-primary` | `.gltf` | Environment (floor-plane node), materials |
| `asset-shelf-left` | `.gltf` | Environment (wall node), materials |
| `orb-pedestal-01` | `.gltf` | Environment, materials |
| `timeline-table-01` | `.gltf` | Environment, materials |
| `...` | per Department DNA objects | Environment, materials |

**Post-processing:**
- Bind to environment attachment nodes
- Apply material-set references (not embedded textures)
- Generate collision bounds
- Validate human-scale proportions
- LOD variants for primary furniture

---

## Stage 5: Decor

**Assets:** Non-interactive atmospheric elements  
**Provider:** 3D object generation model  
**Parallel:** Yes

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `decor-accents` | `.gltf` collection | Environment, materials, furniture (avoid overlap) |

**Post-processing:**
- Validate spacing ≥ 0.15 from furniture
- No interaction bindings
- Optional per department profile

---

## Stage 6: Glass Elements

**Assets:** Glass tables, panels, displays, walls  
**Provider:** 3D + shader  
**Depends on:** Materials (glass shader), Furniture (attachment)

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `glass-table-surface` | `.gltf` + glass shader | Furniture, material-set-glass |
| `glass-wall-hero` | `.gltf` + glass shader | Environment, material-set-glass |
| `floating-panel-chrome` | `.gltf` + glass shader | material-set-glass |

**Post-processing:**
- Refraction shader binding
- Content plane assignment
- Genome tint slot = null

---

## Stage 7: Interactive Objects

**Assets:** Objects with interaction bindings  
**Provider:** 3D generation + deterministic metadata  
**Depends on:** Furniture placement, Interaction Requirements

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `approval-station-01` | `.gltf` | Environment, materials, interaction requirements |
| `preview-screen-01` | `.gltf` | Environment, materials |
| `command-console-01` | `.gltf` | Environment, materials |
| `interactive-wall-left` | `.gltf` | Environment, materials |
| `mood-wall-hero` | `.webp` reference + metadata | Genome visualReferences, lighting |

**Post-processing:**
- Attach interaction collision planes
- Bind to zone definitions
- Mood Wall: generate reference imagery (not embedded in environment)

---

## Stage 8: Orb

**Assets:** Studio Orb™ visual  
**Provider:** Platform cache (shared asset) — not generated per department  
**Depends on:** Orb Pedestal placement

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `orb` | `.glb` (platform standard) | Orb pedestal position |

**Rule:** Orb mesh is **platform-consistent**. Only pedestal and glow are department-specific. Genome personality affects runtime skin — not compile-time mesh.

---

## Stage 9: Particles

**Assets:** Particle system definitions  
**Provider:** Deterministic JSON  
**Depends on:** Lighting rig, Experience DNA ambient density

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `particles-ambient` | `particles.json` | Lighting, Experience DNA |
| `particles-ceremony` | `particles.json` | Lighting, signature animations |

**Post-processing:**
- Color slots = null (Genome injection)
- Density scaled by Experience DNA `ambientDensity`
- Validate particle count within performance budget

---

## Stage 10: Audio

**Assets:** Ambient loops, SFX, ceremony sounds  
**Provider:** Audio generation model  
**Depends on:** Experience DNA, Genome musicStyle/soundDesign

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `ambient-loop` | `.ogg` | Genome musicStyle, Experience DNA |
| `interaction-sfx-set` | `.wav` collection | Genome soundDesign |
| `ceremony-sfx-set` | `.wav` collection | Genome signatureMoments |

**Post-processing:**
- Normalize volume levels per Audio Standard (SDK 09)
- Validate seamless loop (ambient)
- Total audio budget ≤ 3 MB

---

## Stage 11: Animation Metadata

**Assets:** Animation clips, camera paths  
**Provider:** Motion AI + deterministic JSON  
**Depends on:** All objects placed, Experience DNA motion character

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `camera-presets` | `camera.json` | World Rules camera presets |
| `animation-arrival` | animation clips | Camera, Experience DNA |
| `animation-approval` | animation clips | Approval station, ceremony config |
| `animation-orb-states` | animation clips | Orb |

**Post-processing:**
- Duration scaled by Experience DNA + Genome pacing
- Reduced motion fallbacks generated
- Camera paths validated against spatial envelope

---

## Stage 12: Interaction Maps

**Type:** Deterministic (no AI)  
**Depends on:** All objects, Interaction Requirements, AI employee assignments

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `interactions.json` | Interaction map | All interactive objects, zones, verbs |
| `ai-triggers.json` | AI trigger map | AI employees, interaction map |

**Generated from:** Department DNA + SDK 04 interaction engine rules. Never AI-generated.

---

## Stage 13: Preview Renders

**Assets:** Marketing and QA preview images  
**Provider:** Render model (image generation)  
**Depends on:** All assets assembled in virtual scene (not exported as scene)

| Asset | Output | Dependencies |
|-------|--------|-------------|
| `preview-hero-angle` | `.webp` | All visual assets (virtual composite) |
| `preview-overview` | `.webp` | All visual assets |
| `thumbnail-marketplace` | `.webp` | Hero angle cropped |
| `genome-transform-{profile}` | `.webp` × 3+ | Virtual composite with Genome profiles |

**Critical rule:** Preview renders are **marketing artifacts** — not packaged as loadable scene. Virtual composite exists only for rendering; package remains modular.

---

## Stage 14: Validation

**Type:** Automated QA (see 12)  
**Depends on:** All stages complete

Runs full QA Validation checklist before package assembly.

---

## Pipeline Orchestration

```yaml
PipelineExecution:
  id: string
  manifestId: string
  stages: StageResult[]
  currentStage: number
  status: enum              # planning | running | paused | completed | failed
  parallelism: number       # max 6
  startedAt: datetime
  completedAt: datetime | null

StageResult:
  stage: number
  name: string
  assets: AssetGenerationResult[]
  status: enum              # pending | running | completed | failed | skipped
  duration: number
  errors: Error[]

AssetGenerationResult:
  assetId: string
  promptStackId: string
  provider: string
  model: string
  status: enum
  outputPath: string
  retries: number
  fallbackUsed: boolean
```

---

## Parallelism Rules

| Stage | Parallel Assets | Max Concurrent |
|-------|----------------|---------------|
| 0 | — | — |
| 1 | Environment sub-assets | 2 |
| 2 | Lighting + IBL | 2 |
| 3 | Material sets | 3 |
| 4 | All furniture | 6 |
| 5 | All decor | 4 |
| 6 | All glass | 4 |
| 7 | All interactive | 4 |
| 8 | Orb (cached) | 1 |
| 9 | All particles | 2 |
| 10 | All audio | 3 |
| 11 | All animations | 3 |
| 12 | Deterministic | 1 |
| 13 | All previews | 4 |
| 14 | Validation | 1 |

---

## Failure and Retry

| Failure Type | Action |
|-------------|--------|
| Provider timeout | Retry same provider (max 2) |
| Provider error | Route to fallback provider (14) |
| Quality rejection | Regenerate with adjusted parameters |
| Dependency missing | Halt stage; resolve dependency |
| Budget exceeded | Halt; request approval for extended budget |
| Stage failure | Pause pipeline; allow resume from failed stage |

---

## Pipeline Modes

| Mode | Stages Executed |
|------|----------------|
| **Full** | 0–14 all stages |
| **Partial** | 0 + affected stages only |
| **Regenerate** | 0 (light) + single asset's stage |
| **Preview** | 0–7 at draft quality; skip 13–14 |
| **Genome Refresh** | 0 (light) + stages 2, 3, 7, 9, 10, 13 |

---

_Next: [05 — Asset Package Spec](./05_ASSET_PACKAGE_SPEC.md)_
