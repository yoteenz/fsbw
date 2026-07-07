# 14 — FAL Asset Compiler

**SDK Module:** `studio.department.sdk.v1.fal-compiler`  
**Status:** Generation pipeline specification (SDK subset)  
**Canonical engine:** [Studio Asset Compiler™](../../engine/asset-compiler/README.md) — provider-agnostic full specification  
**Philosophy:** FAL compiles prompts into modular asset packages — never flattened UI mockups

---

## Definition

The **FAL Asset Compiler** is the FAL-specific subset of [Studio Asset Compiler™](../../engine/asset-compiler/README.md). It transforms approved blueprints and generation prompts into **modular, identity-neutral asset packages** ready for Department Runtime assembly.

FAL generates **parts** — not scenes. Cursor assembles parts at runtime. Company Genome brands parts at runtime.

> One department generation produces 12+ independent asset modules — never one combined image or scene.

---

## Compiler Position in Pipeline

```
Blueprint Manager (approved blueprint)
         ↓
FAL Asset Compiler (this document)
         ↓
Modular Asset Packages (12 categories)
         ↓
Asset Registry™ (registration)
         ↓
Department Runtime (assembly)
         ↓
Company Genome™ (injection)
         ↓
Living Department
```

---

## Input

### Blueprint Specification

```yaml
FALCompilerInput:
  blueprintId: string
  departmentId: string
  layoutTemplate: enum         # stage | workshop | gallery
  objectInstances: ObjectRef[] # from anatomy
  spatialPlacements: Placement[]
  industryContext: string      # for spatial style hints only — NOT branding
  materialHints: string[]      # neutral material families (stone, glass, wood)
  generationPlan:
    environment: EnvironmentSpec
    furniture: FurnitureSpec[]
    lighting: LightingSpec
    particles: ParticleSpec[]
    audio: AudioSpec[]
    # ... per category
```

### Prompt Stack

Each asset category has a dedicated prompt stack — never one monolithic prompt:

```yaml
PromptStack:
  category: AssetCategory
  basePrompt: string           # structural description — no brand
  negativePrompt: string       # no logos, no text, no brand colors
  modelId: string              # FAL model selection
  parameters:
    resolution: string
    format: string
    seed: number | null
  genomeSlots: string[]        # parameters left empty for runtime injection
  outputFormat: string         # gltf | json | ogg | shader-bundle
```

---

## Output

### Per-Category Generation

One department compilation produces these independent modules:

| # | Category | FAL Output | Format |
|---|----------|-----------|--------|
| 1 | **Environment** | Room shell mesh (walls, floor, ceiling) | glTF 2.0 |
| 2 | **Furniture** | Individual furniture pieces (one per object) | glTF 2.0 |
| 3 | **Glass Objects** | Glass surfaces with shader slots | glTF + shader |
| 4 | **Lighting** | Light rig JSON + neutral IBL placeholder | JSON + HDR |
| 5 | **Orb** | Platform-standard Orb (shared, not generated per dept) | glTF (cached) |
| 6 | **Particles** | Particle system definitions | JSON |
| 7 | **Materials** | Shader bundles with Genome-parameterized slots | Shader bundle |
| 8 | **Windows** | Window frames, glass panes (part of environment) | glTF |
| 9 | **Decor** | Non-interactive atmospheric elements | glTF |
| 10 | **Audio** | Room tone, interaction SFX templates | OGG + WAV |
| 11 | **Camera** | Camera position presets | JSON |
| 12 | **Animations** | Object animation clips, camera paths | glTF + JSON |
| 13 | **Interaction Maps** | Verb binding manifest | JSON |
| 14 | **Metadata** | Assembly manifest with placements | JSON |

**Total: 14 independent outputs per department compilation.**

---

## Compilation Pipeline

### Stage 1: Plan Generation

| Step | Action |
|------|--------|
| 1.1 | Read approved blueprint from Blueprint Manager |
| 1.2 | Validate anatomy completeness (01) |
| 1.3 | Select layout template (02) |
| 1.4 | Map objects to asset categories (03) |
| 1.5 | Generate compilation plan (which modules to produce) |
| 1.6 | Estimate generation cost and time |
| 1.7 | Present plan for approval gate |

### Stage 2: Prompt Compilation

| Step | Action |
|------|--------|
| 2.1 | Generate per-category prompt stacks |
| 2.2 | Inject structural hints (layout, proportions, object types) |
| 2.3 | Inject material family hints (neutral: "marble", "glass", "wood") |
| 2.4 | **Exclude** all brand references, colors, logos, typography |
| 2.5 | Add negative prompts: "no text, no logos, no brand colors, no UI elements" |
| 2.6 | Mark Genome slots as empty parameters |
| 2.7 | Select FAL model per category (from golden-models) |

### Stage 3: Generation

| Step | Action |
|------|--------|
| 3.1 | Queue generation jobs per category (parallel where possible) |
| 3.2 | Environment first (blocking — other assets reference proportions) |
| 3.3 | Furniture + glass in parallel |
| 3.4 | Materials + lighting in parallel |
| 3.5 | Particles + decor in parallel |
| 3.6 | Audio generation |
| 3.7 | Animations + camera |
| 3.8 | Interaction maps + metadata (deterministic — not AI generated) |

### Stage 4: Post-Processing

| Step | Action |
|------|--------|
| 4.1 | Validate each module against asset standard schema (06) |
| 4.2 | Verify no embedded branding (automated color/text scan) |
| 4.3 | Verify modularity (no combined/flattened outputs) |
| 4.4 | Generate LOD variants for environment and furniture |
| 4.5 | Assign module IDs and version tags |
| 4.6 | Register modules in Asset Registry™ |
| 4.7 | Generate neutral preview renders |
| 4.8 | Package for Marketplace (if publishable) |

### Stage 5: QA Gate

| Step | Action |
|------|--------|
| 5.1 | Automated schema validation |
| 5.2 | Branding scan (no hardcoded colors, logos, text) |
| 5.3 | Modularity check (all 14 categories present) |
| 5.4 | Genome slot verification (all slots empty/null) |
| 5.5 | Assembly test (runtime dry-load) |
| 5.6 | Human review (visual quality, spatial coherence) |
| 5.7 | Approve or reject with regeneration targets |

---

## Prompt Rules

### What Prompts Include

| Include | Example |
|---------|---------|
| Structural description | "Rectangular room, 3:2 proportion, back wall hero space" |
| Object types | "Glass conference table, central placement" |
| Material families | "Polished stone floor, clear glass surfaces" |
| Spatial relationships | "Orb pedestal elevated right of center" |
| Lighting structure | "Three-point lighting rig, warm key slot" |
| Style register hint | "Luxury spatial register" (structural, not branded) |

### What Prompts Exclude

| Exclude | Why |
|---------|-----|
| Brand names | Genome injects |
| Hex colors | Genome injects |
| Logo descriptions | Genome injects |
| Typography specs | Genome injects |
| Industry-specific copy | Genome injects |
| UI elements | Departments are worlds, not UI |
| Flattened scene requests | Violates modularity |
| "Dashboard", "page", "card layout" | Violates world principle |

### Negative Prompt (Universal)

```
no text, no logos, no brand marks, no UI elements, no buttons, no forms,
no dashboards, no cards, no navigation bars, no headers, no footers,
no watermarks, no signatures, no labels, no typography,
no specific colors, no color palettes, no brand colors,
no people, no faces, no characters,
no flattened compositions, no single-scene renders
```

---

## Model Selection

| Category | Recommended Model Type | Notes |
|----------|----------------------|-------|
| Environment | 3D scene generation | Neutral shell only |
| Furniture | 3D object generation | One object per generation |
| Glass | 3D + shader | Transparency support |
| Materials | Shader/procedural | Parameterized slots |
| Lighting | Deterministic (no AI) | JSON manifest |
| Particles | Deterministic (no AI) | JSON manifest |
| Audio | Audio generation model | Room tones, SFX |
| Decor | 3D object generation | Non-interactive |
| Animations | Deterministic + motion AI | Camera paths, object clips |
| Interaction Maps | Deterministic (no AI) | From anatomy + objects |
| Metadata | Deterministic (no AI) | From anatomy + layout |

Golden model selections stored in `motherboard/golden-models/` and `motherboard/golden-prompts/`.

---

## Genome Slot Generation

FAL generates assets with **empty Genome slots** — never pre-filled brand values:

```yaml
# Material shader output example
MaterialShader:
  id: mat-environment-floor-001
  slots:
    baseColor: null          # Genome injects
    roughness: 0.3           # structural default
    metalness: 0.0           # structural default
    emissive: null           # Genome injects
    normal: "generated"      # FAL-generated surface detail
    opacity: 1.0
  genomeHooks: [materialLanguage, colorPrinciples]
```

---

## Regeneration

| Scope | Trigger | Behavior |
|-------|---------|----------|
| Single module | QA failure on one category | Regenerate only that module |
| Category set | Visual inconsistency | Regenerate related modules |
| Full department | Anatomy change | Full recompilation |
| Material only | Genome slot issue | Regenerate materials without geometry |

Regeneration never affects other modules — independence is preserved.

---

## Cost and Approval

| Gate | Requirement |
|------|-------------|
| Plan approval | Human reviews compilation plan before generation |
| Cost estimate | Displayed before generation starts |
| Generation approval | Human confirms generation execution |
| QA approval | Human reviews output before runtime integration |
| Marketplace approval | Separate gate for publishing (13) |

---

## Forbidden Compiler Outputs

| Output | Why Forbidden |
|--------|---------------|
| Single flattened PNG/JPG of department | Not modular |
| Combined GLB with all objects | Cannot replace independently |
| UI mockup image | Departments are worlds |
| Branded environment | Genome injects branding |
| Text in generated assets | Typography from Genome |
| Form layouts | Physical interaction only |
| Dashboard screenshots | Not a world |

---

## Compiler Configuration

```yaml
FALCompilerConfig:
  blueprintId: string
  departmentId: string
  sdkVersion: "1.0.0"
  models: ModelSelection          # per category
  qualityLevel: enum              # draft | standard | premium
  parallelJobs: number              # max concurrent
  retryPolicy: RetryPolicy
  outputPath: string                # package destination
  registerInAssetRegistry: boolean  # true
  generatePreviews: boolean         # true
  marketplaceReady: boolean         # true if publishing
```

---

_Next: [15 — Cursor Runtime Requirements](./15_CURSOR_RUNTIME_REQUIREMENTS.md)_
