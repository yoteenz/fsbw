# 03 — Prompt Compiler

**Engine Module:** `studio.asset-compiler.v1.prompt-compiler`  
**Status:** Heart of the compiler  
**Philosophy:** Dozens of prompts, never one — every prompt inherits Company Genome automatically

---

## Definition

The **Prompt Compiler** is the core subsystem that transforms the Input Manifest (02) into **individual, per-asset prompt stacks** ready for the Generation Pipeline (04).

> The compiler NEVER sends one prompt. It automatically generates dozens.

Users never see or write these prompts. Founders define intent; the Prompt Compiler translates.

---

## Core Principle

```
❌  One prompt: "Create a luxury marketing department for a hair brand"
✅  47 prompts: environment-shell, floor-material, hero-wall, glass-table-01,
    orb-pedestal, timeline-surface, lighting-rig, ambient-audio, ...
    each inheriting Genome domains automatically
```

---

## Prompt Stack Schema

Every generated prompt is a **stack** — not a single string:

```yaml
PromptStack:
  id: string                          # e.g., "env-shell-creative-direction"
  assetId: string                     # target asset module ID
  category: AssetCategory
  departmentId: string
  compileProfile: string

  # Prompt layers (applied in order)
  layers:
    base: string                      # structural description (SDK template)
    genome: GenomeLayer               # auto-injected from Company Genome
    experience: ExperienceLayer       # from Experience DNA
    project: ProjectLayer | null      # from Project Intent overlay
    department: DepartmentLayer       # department-specific modifiers
    founder: FounderLayer | null      # high-priority founder notes
    industry: IndustryLayer           # industry hints
    negative: string                  # universal + category negative prompts

  # Provider routing
  provider:
    preferred: string                 # provider ID
    model: string                     # model ID from golden-models
    fallback: string                  # fallback provider
    parameters: ProviderParameters

  # Output specification
  output:
    format: string                    # gltf | json | ogg | hdr | webp
    resolution: string
    genomeSlots: string[]             # runtime injection slots (empty at gen)
    postProcessing: PostProcessStep[]

  # Audit
  promptHash: string                  # deterministic hash for regeneration
  inputManifestId: string
  generatedAt: datetime
```

---

## Genome Layer (Auto-Injected)

Every prompt stack receives a Genome Layer computed from Company Genome domains relevant to the asset category:

```yaml
GenomeLayer:
  domains: string[]                   # which domains were injected
  variables:
    colorPrinciples: string           # natural language, not hex
    materialLanguage: string
    lightingStyle: string
    visualPhilosophy: string
    photographyDirection: string | null
    artDirection: string
    worldBuilding: string
    brandEmotions: string
    personality: string
    thingsWeNeverDo: string[]
    visualReferences: string[]        # described, not embedded
```

**Injection is automatic.** Prompt Compiler reads `genomeHooks` from Department DNA and maps domains to prompt variables. No human Genome copy-paste.

### Genome Injection by Category

| Asset Category | Genome Domains Injected |
|----------------|------------------------|
| Environment | `materialLanguage`, `worldBuilding`, `spatialDesign`, `colorPrinciples` |
| Furniture | `materialLanguage`, `spatialDesign`, `artDirection` |
| Glass | `materialLanguage`, `colorPrinciples` |
| Lighting | `lightingStyle`, `colorPrinciples`, `brandEmotions` |
| Orb | `personality`, `colorPrinciples` (platform base + Genome glow) |
| Mood Wall | `visualReferences`, `photographyDirection`, `brandEmotions`, `colorPrinciples` |
| Particles | `colorPrinciples`, `brandEmotions`, `signatureAnimations` |
| Materials | `materialLanguage`, `colorPrinciples` |
| Audio | `musicStyle`, `soundDesign` |
| Decor | `artDirection`, `worldBuilding`, `materialLanguage` |
| Windows | `worldBuilding`, `materialLanguage`, `lightingStyle` |
| Camera | None (structural) |
| Animations | `motionPhilosophy`, `pacing` |
| Interactions | `interactionStyle`, `soundDesign` |
| Thumbnail | `colorPrinciples`, `brandEmotions`, `artDirection` |
| Documentation | `terminology`, `voice`, `microcopyStyle` |

---

## Prompt Generation: Creative Direction Department Example

Full prompt inventory for a **Creative Direction** department compile:

```
Creative Direction Department
    │
    ├── ARCHITECTURE
    │   ├── environment-shell          → Environment Prompt
    │   ├── floor-surface              → Floor Material Prompt
    │   ├── ceiling-sky                → Ceiling/Sky Prompt
    │   └── windows-01                 → Window Prompt
    │
    ├── FURNITURE
    │   ├── glass-table-primary        → Glass Table Prompt
    │   ├── asset-shelf-left           → Asset Shelf Prompt
    │   └── orb-pedestal-01            → Orb Pedestal Prompt
    │
    ├── DISPLAYS
    │   ├── mood-wall-hero             → Mood Wall Prompt
    │   ├── interactive-wall-left      → Interactive Wall Prompt
    │   ├── floating-panel-status      → Floating Panel Prompt
    │   └── preview-screen-01          → Preview Screen Prompt
    │
    ├── WORK SURFACES
    │   ├── timeline-table-01          → Timeline Prompt
    │   └── project-board-01           → Project Board Prompt
    │
    ├── LIGHTING
    │   ├── lighting-rig               → Lighting Prompt
    │   └── ibl-environment            → IBL/HDR Prompt
    │
    ├── MATERIALS
    │   ├── material-set-environment   → Materials Prompt
    │   ├── material-set-furniture     → Materials Prompt
    │   └── material-set-glass         → Materials Prompt
    │
    ├── ATMOSPHERE
    │   ├── particles-ambient          → Particles Prompt
    │   ├── particles-ceremony         → Particles Prompt
    │   └── decor-accents              → Decor Prompt
    │
    ├── AUDIO
    │   ├── ambient-loop               → Audio Prompt
    │   ├── interaction-sfx-set        → Audio Prompt
    │   └── ceremony-sfx-set           → Audio Prompt
    │
    ├── MOTION
    │   ├── camera-presets             → Camera Prompt (deterministic)
    │   ├── animation-arrival          → Animation Prompt
    │   ├── animation-approval         → Animation Prompt
    │   └── animation-orb-states       → Animation Prompt
    │
    ├── BEHAVIOR
    │   ├── interaction-map            → Interaction Metadata Prompt (deterministic)
    │   └── ai-trigger-map             → AI Trigger Prompt (deterministic)
    │
    ├── PREVIEWS
    │   ├── preview-hero-angle         → Preview Render Prompt
    │   ├── preview-overview           → Preview Render Prompt
    │   ├── thumbnail-marketplace      → Thumbnail Prompt
    │   └── genome-transform-sets (3+) → Transform Preview Prompts
    │
    └── DOCUMENTATION
        ├── metadata-manifest          → Documentation Prompt (deterministic)
        └── package-readme             → Documentation Prompt
```

**Total: ~35–50 prompt stacks per department** (varies by department profile).

---

## Prompt Templates

Prompt Compiler uses **category templates** — not freeform generation:

```yaml
PromptTemplate:
  id: string
  category: AssetCategory
  basePrompt: |
    {structural_description}
    Room envelope: {spatial_envelope}
    Layout template: {layout_template}
    Material family: {material_family_hint}
    Style register: {style_register}
    Scale: human-scale furniture, normalized coordinates
  genomeSlots:
    - {color_principles}
    - {material_language}
    - {lighting_style}
  negativePrompt: |
    no text, no logos, no brand marks, no UI elements,
    no dashboards, no forms, no people, no faces,
    no specific colors, no flattened compositions
  modelPreference: string
  outputFormat: string
```

Templates are stored in **Prompt Registry™** and **golden-prompts/** (`motherboard/golden-prompts/`). Templates are versioned and QA-approved.

---

## Prompt Compilation Process

```
Step 1: LOAD templates for department compile profile (07)
Step 2: INVENTORY required assets from Department DNA objects + spatial layout
Step 3: INSTANTIATE one PromptStack per required asset
Step 4: RESOLVE PromptVariables from Input Manifest
Step 5: INJECT GenomeLayer per asset category (automatic)
Step 6: OVERLAY ProjectIntent (if active project)
Step 7: APPLY FounderNotes (constraint priority)
Step 8: COMPUTE negative prompts (universal + category + Genome thingsWeNeverDo)
Step 9: ROUTE to provider + model per abstraction layer (14)
Step 10: HASH each stack for deterministic regeneration
Step 11: OUTPUT PromptCompilationManifest
```

### PromptCompilationManifest

```yaml
PromptCompilationManifest:
  id: string
  inputManifestId: string
  departmentId: string
  stacks: PromptStack[]
  totalStacks: number
  estimatedCost: CostEstimate
  estimatedDuration: number         # seconds
  providerDistribution: ProviderCount[]
  createdAt: datetime
```

---

## Deterministic Regeneration

Every PromptStack has a `promptHash` computed from:

```
hash(templateId + inputManifestId + assetId + genomeSnapshotId + templateVersion)
```

When a founder requests regeneration of one asset (11), the compiler:
1. Retrieves original Input Manifest
2. Recomputes PromptStack with same hash inputs
3. Optionally applies updated Genome snapshot
4. Generates only that asset

**Same inputs → same prompts → reproducible output** (modulo model stochasticity; seed captured when supported).

---

## Prompt Quality Rules

| Rule | Enforcement |
|------|-------------|
| No brand hex codes in prompts | Genome Layer uses natural language principles |
| No logo descriptions | Brand assets are runtime-inject only |
| No UI element requests | Negative prompt + template constraints |
| No flattened scene requests | One asset per prompt, always |
| No people/faces | Universal negative prompt |
| Genome always injected | Compiler fails if Genome Layer empty for visual categories |
| Template version pinned | Regeneration uses same template version unless upgraded |
| Founder constraints respected | Constraint notes become prompt modifiers |

---

## Prompt Compiler ≠ User Interface

The Prompt Compiler runs **server-side** in the Studio Engine. Founders interact with:

| Founder Action | Compiler Response |
|----------------|-------------------|
| "Build Creative Direction department" | Full compile — 35–50 prompts |
| "Change the mood wall" | Regenerate — 1 prompt (mood-wall-hero) |
| "Update lighting" | Regenerate — 2 prompts (lighting-rig, ibl-environment) |
| "Refresh brand" | Genome Refresh — all Genome-dependent prompts |
| "Preview department" | Preview mode — draft quality, subset of prompts |

Founders never see prompt text. They see intent controls and compilation progress.

---

## Relationship to Prompt Registry™

| System | Role |
|--------|------|
| **Prompt Registry™** | Stores approved templates, golden prompts, model pairings |
| **Prompt Compiler** | Instantiates templates with live input data |
| **Golden Prompts** (`motherboard/golden-prompts/`) | Production-quality prompt patterns confirmed by product owner |
| **Golden Models** (`motherboard/golden-models/`) | Verified model selections per category |

New templates enter Prompt Registry → QA → golden-prompts promotion.

---

_Next: [04 — Asset Generation Pipeline](./04_ASSET_GENERATION_PIPELINE.md)_
