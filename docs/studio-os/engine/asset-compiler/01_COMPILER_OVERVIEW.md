# 01 — Compiler Overview

**Engine Module:** `studio.asset-compiler.v1.overview`  
**Status:** Canonical engine definition

---

## What Is Studio Asset Compiler™?

Studio Asset Compiler™ is a **core Studio OS engine** responsible for converting structured company data into **modular, runtime-ready Department Asset Packages**.

It is the generation layer between **founder intent** (Genome, DNA, project goals) and **living departments** (assembled by Studio Runtime).

Think of it as:

| Industry Reference | Studio OS Equivalent |
|--------------------|---------------------|
| Unreal Engine Asset Cooking | Raw inputs → cooked runtime packages |
| Pixar Production Pipeline | Staged generation with quality gates |
| AAA Procedural Generation | Same pipeline, different Genome → different world |
| Houdini Node Graph | Structured data flows through ordered stages |

**It is not:** a webpage generator, a UI builder, a mockup tool, or a chat prompt interface.

---

## Purpose

> Translate structured company intent into hundreds of modular asset-generation tasks — automatically, deterministically, and without user prompting.

The compiler exists because:

1. **Departments are worlds** — they require dozens of coordinated 3D, audio, motion, and metadata assets
2. **Manual prompting fails at scale** — one prompt cannot produce a department; dozens are required
3. **Brand must be systematic** — Company Genome must flow into every generation task without human copy-paste
4. **Assets must be modular** — independent replacement, versioning, and regeneration are impossible with flattened outputs
5. **Providers change** — abstraction over FAL, OpenAI, Runway, and future models is mandatory

---

## Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Input resolution** | Collect and validate all compiler inputs (02) |
| **Prompt compilation** | Generate per-asset prompt stacks with Genome inheritance (03) |
| **Pipeline orchestration** | Execute ordered generation stages (04) |
| **Package assembly** | Organize outputs into Department Asset Package (05) |
| **Metadata attachment** | Stamp every asset with full metadata (06) |
| **Department profiling** | Apply department-specific compilation rules (07) |
| **Genome injection** | Derive visual parameters from Company Genome (08) |
| **Version management** | Track and expose asset versions (10) |
| **Surgical regeneration** | Re-generate individual assets on demand (11) |
| **Quality validation** | Automated QA before package release (12) |
| **Marketplace export** | Package for distribution (13) |
| **Provider routing** | Route tasks to appropriate AI providers (14) |

### What the Compiler Does NOT Do

| Not Responsible | Owner |
|-----------------|-------|
| Assemble living departments | Studio Runtime (09) |
| Connect user interactions | Cursor Runtime |
| Inject runtime Genome values into shaders | Department Runtime |
| Creative direction decisions | Creative Direction Studio™ |
| Business logic / workflows | Department SDK anatomy |
| User-facing generation UI | Future implementation layer |

---

## Inputs

The compiler receives six primary input domains:

```yaml
CompilerInput:
  companyGenome: CompanyGenomeSnapshot      # apex living identity (M277)
  departmentDNA: DepartmentDNA              # SDK anatomy + spatial + objects
  projectIntent: ProjectIntent | null         # active project context
  designLanguage: DesignLanguage             # structural visual law (SDK 07)
  experienceDNA: ExperienceDNA               # motion, immersion, atmosphere
  worldRules: WorldRules                     # spatial, physics, interaction law
```

Plus supporting inputs resolved by the Input System (02):

- Industry DNA
- Mood
- References
- Founder Notes
- Brand Assets (logos, photography — referenced, not embedded)
- Prompt Variables
- Asset Dependencies
- Interaction / Animation / Lighting Requirements

---

## Outputs

The compiler produces one primary output per compilation run:

```yaml
DepartmentAssetPackage:
  id: string
  departmentId: string
  version: semver
  compilerVersion: "1.0.0"
  compiledAt: datetime
  genomeProfileId: string          # Genome snapshot used
  assets: AssetModule[]            # modular assets per category
  metadata: PackageMetadata
  interactions: InteractionMap
  genomeHooks: GenomeHookManifest
  previews: PreviewSet
  validation: ValidationReport
  manifest: PackageManifest
```

See [05 — Asset Package Spec](./05_ASSET_PACKAGE_SPEC.md) for full structure.

**Never an output:** flattened scene, UI mockup, webpage, combined GLB, screenshot dashboard.

---

## Pipeline

The compiler executes six sequential phases:

```
Phase 1: RESOLVE
    Collect inputs → validate → merge Project Intent overlay

Phase 2: COMPILE
    Generate per-asset prompt stacks → inject Genome → route to providers

Phase 3: GENERATE
    Execute ordered generation pipeline → produce raw assets

Phase 4: ASSEMBLE
    Organize assets into package structure → attach metadata → version

Phase 5: VALIDATE
    Run automated QA → fix or flag failures

Phase 6: EXPORT
    Register in Asset Registry™ → optional Marketplace export
```

### Pipeline Diagram

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ RESOLVE  │ → │ COMPILE  │ → │ GENERATE │ → │ ASSEMBLE │ → │ VALIDATE │ → │  EXPORT  │
│  inputs  │   │  prompts │   │  assets  │   │  package │   │    QA    │   │  deploy  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     ↑              ↑              ↑
  Input System   Prompt Compiler  Generation Pipeline
  (02)           (03)             (04)
```

---

## Dependencies

### Upstream (compiler requires)

| System | Purpose |
|--------|---------|
| **Company Genome™** (M277) | Visual, voice, material derivation |
| **Department SDK™** | Anatomy, objects, spatial layout law |
| **Blueprint Manager** | Approved department blueprints |
| **Project Model** | Active project intent overlay |
| **Experience DNA™** | Atmosphere, immersion, motion character |
| **Design Language** (SDK 07) | Structural visual rules |
| **Prompt Registry™** | Approved prompt templates |
| **Golden Models** (`motherboard/golden-models/`) | Verified model selections |

### Downstream (depends on compiler)

| System | Purpose |
|--------|---------|
| **Asset Registry™** (M140) | Registered generated assets |
| **Department Runtime** (SDK 11) | Package assembly into living department |
| **Cursor Runtime** (SDK 15) | Interaction connection |
| **Headquarters Marketplace™** | Package distribution |
| **Expansion Center** | Department pack installation |

---

## Integration: Studio Engine

```
Studio Engine
    ├── Company Genome™ Service
    ├── Blueprint Manager
    ├── Studio Asset Compiler™     ← this engine
    │       ├── Input Resolver
    │       ├── Prompt Compiler
    │       ├── Generation Orchestrator
    │       ├── Package Assembler
    │       ├── QA Validator
    │       └── Export Manager
    ├── Asset Registry™
    ├── Department Runtime
    └── Event Bus™
```

**Invocation:**

```yaml
CompileRequest:
  departmentId: string
  organizationId: string
  projectId: string | null
  compileMode: enum          # full | partial | regenerate
  regenerateTargets: string[]   # asset IDs for partial mode
  providerOverrides: ProviderOverride[] | null
  approvalRequired: boolean     # true for production compiles
```

**Events emitted:**

| Event | When |
|-------|------|
| `compile-started` | Phase 1 begins |
| `compile-prompts-ready` | Phase 2 complete — awaiting generation approval |
| `compile-asset-generated` | Each asset in Phase 3 |
| `compile-package-assembled` | Phase 4 complete |
| `compile-validated` | Phase 5 pass/fail |
| `compile-exported` | Phase 6 complete |
| `compile-failed` | Any phase failure with recovery options |

---

## Integration: Cursor Runtime

Cursor receives **cooked packages** — never raw generation output.

| Handoff | Compiler Provides | Cursor Consumes |
|---------|-------------------|-----------------|
| Asset modules | GLB, JSON, OGG, shader bundles | Load per runtime sequence |
| Interaction maps | `interactions.json` | Route verbs to handlers |
| Metadata | `metadata.json` | Object placement, zone bounds |
| Camera presets | `camera.json` | Camera controller |
| Genome hooks | `genome-hooks.json` | Runtime injection targets |

Cursor does **not** call the compiler. Studio Engine orchestrates: compile → register → runtime load.

---

## Integration: Marketplace

Compiler export (13) produces Marketplace-ready packages:

```
Compile → Validate → Export → Marketplace Catalog → Install Engine → Genome Injection → Runtime
```

Marketplace packages are **Genome-neutral at generation** — Genome profile ID is recorded in metadata but branding is applied at install/runtime, not at compile time for marketplace distribution.

For **organization-specific compiles** (internal use), Genome is fully injected during prompt compilation (08).

---

## Compilation Modes

| Mode | Trigger | Scope |
|------|---------|-------|
| **Full** | New department / full rebuild | All assets, all prompts |
| **Partial** | Department anatomy change | Affected assets only |
| **Regenerate** | Founder changes one element | Single asset (11) |
| **Genome Refresh** | Company Genome update | Genome-dependent assets only |
| **Preview** | Blueprint review | Low-quality draft assets |
| **Marketplace** | Publishing | Neutral assets + genome transform previews |

---

## Cost and Approval Gates

| Gate | Requirement |
|------|-------------|
| Plan review | Human reviews compilation plan before generation |
| Cost estimate | Token/compute cost displayed per compile |
| Generation approval | Human confirms before provider calls |
| QA approval | Automated + human review before export |
| Marketplace approval | Separate review for public distribution |

---

## Error Recovery

| Failure | Recovery |
|---------|----------|
| Single asset generation fail | Retry → fallback provider → skip with fallback asset |
| Prompt compilation fail | Halt phase 2; report missing inputs |
| Genome resolution fail | Use SDK defaults; flag for enrichment |
| Provider unavailable | Route to next provider in abstraction layer |
| QA validation fail | Return to phase 3 with targeted regeneration |
| Total compile fail | Preserve partial package; allow resume |

---

_Next: [02 — Input System](./02_INPUT_SYSTEM.md)_
