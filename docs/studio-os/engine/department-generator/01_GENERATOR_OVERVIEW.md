# 01 — Generator Overview

**Engine Module:** `studio.department-generator.v1.overview`  
**Status:** Canonical engine definition

---

## What Is Studio Department Generator™?

Studio Department Generator™ is the **official creation engine** responsible for producing every immersive department inside Studio OS.

> Receives structured company intelligence. Outputs a complete Department Package™ ready for Studio Runtime. Never creates a webpage. Always creates an interactive world.

It is the **factory** — not a department, not a dashboard, not a design tool.

| Industry Reference | Studio OS Equivalent |
|--------------------|---------------------|
| Unreal World Partition Builder | Procedural world blueprint from rules |
| Pixar Department Setup Pipeline | Staged creative assembly from DNA |
| Theme Park Land Designer | Same ride system, different theming per park |
| Game Level Generator | Structured inputs → playable space manifest |

---

## Purpose

> Enable founders to say *"I want a new department"* — and Studio OS automatically understands the company, brand, industry, project, emotional goal, and desired experience, then produces a complete modular Department Package™.

The Generator exists because:

1. **Departments multiply** — Creative, Discovery, Production, Publishing, Marketing, Executive, and dozens of industry-specific types
2. **Manual creation fails at scale** — Each department requires environment, objects, interactions, AI staff, audio, motion, and metadata
3. **Brand must be systematic** — Company Genome must transform every department without per-company engineering
4. **Founders must not prompt** — Structured business intelligence replaces ad-hoc AI prompting
5. **Modularity is mandatory** — Objects, sounds, and motions must regenerate independently
6. **Marketplace requires packages** — Every department must be publishable, installable, and versioned

---

## Responsibilities

| Responsibility | Subsystem |
|----------------|-----------|
| Resolve and validate all generator inputs | Input Pipeline (02) |
| Select and compose Department DNA™ | Department DNA (03) |
| Compile environment generation tasks | Environment Compiler (04) |
| Compile modular object tasks | Object Compiler (05) |
| Compile interaction maps and permissions | Interaction Compiler (06) |
| Assign AI employee teams | AI Team Compiler (07) |
| Compile audio identity | Audio Compiler (08) |
| Compile motion personality | Animation Compiler (09) |
| Inject Company Genome into all tasks | Genome Injection (10) |
| Hand off generation instructions | Asset Compiler Handoff (11) |
| Hand off runtime assembly manifest | Runtime Handoff (12) |
| Define package structure | Package Spec (13) |
| Scope surgical regeneration | Regeneration System (14) |
| Prepare Marketplace listings | Marketplace Export (15) |
| Validate living-place quality | Department QA (16) |

### What the Generator Does NOT Do

| Not Responsible | Owner |
|-----------------|-------|
| Execute FAL / AI generation | Studio Asset Compiler™ |
| Produce final GLB, audio, textures | Studio Asset Compiler™ |
| Assemble living runtime worlds | Studio Department Runtime™ |
| Wire user event handlers | Cursor Runtime |
| Define SDK anatomy law | Studio Department SDK™ |
| Store founder creative decisions | Creative Direction Studio™ |
| Render React UI | Forbidden pattern |

---

## Inputs

```yaml
GeneratorInput:
  companyGenome: CompanyGenomeSnapshot
  projectGenome: ProjectGenomeSnapshot | null
  departmentType: DepartmentTypeId          # e.g., creative-direction, discovery, law-firm
  industryDNA: IndustryDNA
  experienceDNA: ExperienceDNA
  designLanguage: DesignLanguage
  founderNotes: FounderNotes[] | null
  moodBoard: MoodBoardSnapshot | null
  referenceLibrary: ReferenceLibrarySnapshot | null
  creativeDirection: CreativeDirectionSnapshot | null
  brandAssets: BrandAssetManifest | null
  marketplaceExpansions: MarketplaceExpansion[] | null
  currentHeadquarters: HeadquartersContext
  regenerationScope: RegenerationScope | null   # null = full generate
```

Full input definitions: [02 — Input Pipeline](./02_INPUT_PIPELINE.md).

---

## Outputs

```yaml
GeneratorOutput:
  packageManifest: DepartmentPackageManifest    # studio.department-package.v1
  generationInstructionSet: GenerationInstructionSet  # → Asset Compiler
  departmentDNA: ResolvedDepartmentDNA
  interactionMap: InteractionMapManifest
  aiTeamManifest: AITeamManifest
  audioManifest: AudioManifest
  animationManifest: AnimationManifest
  runtimeManifest: RuntimeAssemblyManifest      # → Department Runtime
  qaReport: GeneratorQAReport
  marketplaceListing: MarketplaceListingDraft | null
```

The Generator **never** outputs flattened scenes, PNG mockups, or React components.

---

## Pipeline

```
PHASE 1 — RESOLVE
  Validate inputs → Resolve Department DNA → Merge Genome + Project context

PHASE 2 — COMPILE
  Environment Compiler  → 10–15 environment prompt tasks
  Object Compiler       → 15–50 object prompt tasks
  Interaction Compiler  → interaction-map.json
  AI Team Compiler      → ai-team-manifest.json
  Audio Compiler        → audio-manifest.json
  Animation Compiler    → animation-manifest.json

PHASE 3 — INJECT
  Genome Injection      → slot bindings on every compile task

PHASE 4 — PACKAGE
  Assemble package manifest → dependency graph → metadata stamps

PHASE 5 — HANDOFF
  Asset Compiler Handoff  → GenerationInstructionSet
  Runtime Handoff         → RuntimeAssemblyManifest

PHASE 6 — VALIDATE
  Department QA (16)      → pass / fail / warn

PHASE 7 — EXPORT (optional)
  Marketplace Export (15) → listing draft
```

**Duration target (engineering):** Resolve < 2s · Compile < 5s · Handoff instant · Generation async via Compiler.

---

## Dependencies

| Dependency | Required | Purpose |
|------------|----------|---------|
| Studio Department SDK™ | Yes | Anatomy, spatial, object, interaction law |
| Company Genome™ service | Yes | Brand injection source |
| Department DNA catalog | Yes | Per-type templates (03) |
| Golden Department spec | Yes (validation) | Reference quality bar |
| Studio Asset Compiler™ | Yes (downstream) | Executes generation |
| Studio Department Runtime™ | Yes (downstream) | Executes assembly |
| AI Provider registry | Yes (via Compiler) | FAL, OpenAI, Runway, etc. |
| Headquarters context | Yes | Building · department placement |

---

## Relationship Map

### Studio Department SDK™

| SDK Provides | Generator Consumes |
|--------------|-------------------|
| Anatomy schema | Department DNA base |
| Layout templates (Stage/Workshop/Gallery) | Environment topology |
| Object class library | Object Compiler inventory |
| Interaction verb registry | Interaction Compiler bindings |
| AI employee role IDs | AI Team Compiler roster |
| Motion + audio standards | Compiler personality baselines |
| QA checklist (17) | Department QA (16) extensions |

**Rule:** Generator extends SDK — never omits SDK requirements.

### Studio Asset Compiler™

| Generator Provides | Compiler Consumes |
|-------------------|-------------------|
| GenerationInstructionSet | Prompt stacks per asset |
| Compile profile per department | Department Compiler (07) |
| Genome slot bindings | Genome Injection (08) |
| Asset dependency graph | Pipeline ordering (04) |
| Regeneration scope | Regeneration Rules (11) |

**Rule:** Generator compiles instructions. Compiler executes them. Generator never calls FAL directly.

### Studio Department Runtime™

| Generator Provides | Runtime Consumes |
|-------------------|------------------|
| RuntimeAssemblyManifest | World Assembler (03) |
| Interaction map | Interaction Engine (05) |
| AI team manifest | Concierge Runtime (07) |
| Audio manifest | Audio Engine (12) |
| Animation manifest | Animation Engine (10) |
| Package manifest | Asset Loader (02) |

### Company Genome™

Genome flows into **every compile task** at generation time and **shader/audio slots** at runtime. Generator binds slots; never bakes brand values.

### Headquarters Marketplace™

Generator exports `MarketplaceListingDraft` with compatibility matrix, install guide, and dependency manifest.

### FAL

FAL is accessed **only** through Asset Compiler provider routing. Generator specifies asset type → provider hints; Compiler routes execution.

### Cursor

Cursor receives Runtime API contracts and wires handlers. Generator documents handler binding points in Runtime Handoff (12). Cursor never authors department DNA.

### Golden Department™

Creative Direction Studio™ is the **validation project**. First full pipeline run must produce a package equivalent to `pkg-creative-direction-golden-v1`.

---

## Generation Modes

| Mode | Trigger | Scope |
|------|---------|-------|
| **Full generate** | New department request | Complete package |
| **Surgical regenerate** | Genome change · object swap | Scoped assets only (14) |
| **Industry transform** | Company Genome industry switch | Materials + atmosphere + audio |
| **Marketplace install** | Package overlay | Merge manifest per Marketplace rules |
| **Validation replay** | QA failure retry | Failed compile tasks only |

---

## Canonical Statement

> The founder should never think *"I need to design a dashboard."* They should think *"I want to create a new department."* Studio Department Generator™ understands the company, brand, industry, project, emotional goal, and desired experience — and produces a complete Department Package™ of modular environments, objects, AI employees, interactions, audio, animations, metadata, and runtime instructions.

---

_Next: [02 — Input Pipeline](./02_INPUT_PIPELINE.md)_
