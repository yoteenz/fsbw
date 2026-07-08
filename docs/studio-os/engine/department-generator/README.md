# Studio Department Generator™

**Version:** 1.0.0  
**Status:** Canonical Engine Specification  
**Type:** Core Studio OS Engine — not a feature, not a department  
**Parent:** [Studio Department SDK™](../../sdk/README.md) · [Company Genome™](../../company-genome.md) · [Headquarters Engine™](../../headquarters-engine.md)  
**Engine ID:** `studio.department-generator.v1`

---

> **The founder never designs a dashboard. They create a department. The Generator builds the world.**

Studio Department Generator™ is the **official creation engine** responsible for producing every immersive department inside Studio OS. It is not a department — it is the **factory that creates departments**.

---

## What This Engine Does

| Does | Does Not |
|------|----------|
| Receive structured company intelligence | Accept manual FAL prompts from founders |
| Resolve Department DNA™ per department type | Generate webpages or dashboards |
| Compile environment, object, interaction, AI, audio, animation tasks | Create final 3D/audio assets |
| Output Department Package™ blueprints + generation instructions | Assemble living runtime worlds |
| Inject Company Genome™ into every compile task | Hardcode brand visuals |
| Support surgical regeneration scopes | Require full department rebuild |
| Export Marketplace-ready package manifests | Implement React UI |
| Validate against Golden Department principles | Skip SDK anatomy law |

---

## Engine Position

```
┌─────────────────────────────────────────────────────────────┐
│                    FOUNDER INTENT                            │
│  Company Genome · Project Genome · Department Type ·         │
│  Industry DNA · Experience DNA · Creative Direction ·          │
│  Mood Board · Reference Library · Founder Notes              │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         STUDIO DEPARTMENT GENERATOR™ (this engine)           │
│  Input Pipeline → Department DNA → Environment Compiler →    │
│  Object Compiler → Interaction Compiler → AI Team Compiler → │
│  Audio Compiler → Animation Compiler → Genome Injection →    │
│  Package Spec → QA → Marketplace Export                      │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STUDIO ASSET COMPILER™                          │
│  Executes generation instructions → modular assets           │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STUDIO VALIDATION LOOP™                       │
│  Self Review → Braintrust → Genome → Experience → Founder    │
└───────────────────────────┬─────────────────────────────────┘
                            ↓ (approved only)
┌─────────────────────────────────────────────────────────────┐
│              STUDIO DEPARTMENT RUNTIME™                      │
│  Assembles package → living interactive department           │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CURSOR RUNTIME                                  │
│  Wires handlers · Project state · Production signals         │
└─────────────────────────────────────────────────────────────┘
```

**Law:** SDK defines what departments are. **Generator** defines what to create. **Compiler** cooks assets. **Validation Loop** decides what deserves to exist. **Runtime** brings approved packages alive.

---

## Document Index

| # | Document | System |
|---|----------|--------|
| 01 | [Generator Overview](./01_GENERATOR_OVERVIEW.md) | Purpose, pipeline, integrations |
| 02 | [Input Pipeline](./02_INPUT_PIPELINE.md) | Every generator input defined |
| 03 | [Department DNA](./03_DEPARTMENT_DNA.md) | Per-type department identity |
| 04 | [Environment Compiler](./04_ENVIRONMENT_COMPILER.md) | Architecture → discrete prompts |
| 05 | [Object Compiler](./05_OBJECT_COMPILER.md) | Modular object generation tasks |
| 06 | [Interaction Compiler](./06_INTERACTION_COMPILER.md) | Verb maps · states · permissions |
| 07 | [AI Team Compiler](./07_AI_TEAM_COMPILER.md) | Concierge + specialist assignment |
| 08 | [Audio Compiler](./08_AUDIO_COMPILER.md) | Sonic identity per department |
| 09 | [Animation Compiler](./09_ANIMATION_COMPILER.md) | Motion personality per department |
| 10 | [Genome Injection](./10_GENOME_INJECTION.md) | Brand transform without hardcoding |
| 11 | [Asset Compiler Handoff](./11_ASSET_COMPILER_HANDOFF.md) | Generation instruction contract |
| 12 | [Runtime Handoff](./12_RUNTIME_HANDOFF.md) | Package → Runtime assembly contract |
| 13 | [Package Spec](./13_PACKAGE_SPEC.md) | DepartmentPackage.zip structure |
| 14 | [Regeneration System](./14_REGENERATION_SYSTEM.md) | Surgical non-destructive iteration |
| 15 | [Marketplace Export](./15_MARKETPLACE_EXPORT.md) | Headquarters Marketplace™ publishing |
| 16 | [Department QA](./16_DEPARTMENT_QA.md) | Living-place validation gates |
| 17 | [Implementation Guide](./17_IMPLEMENTATION_GUIDE.md) | Abstract engineering roadmap |

---

## Relationship to Other Engines

| Engine | Relationship |
|--------|--------------|
| **Studio Department SDK™** | Generator must satisfy SDK anatomy, spatial, object, interaction law |
| **Studio Asset Compiler™** | Generator outputs instructions; Compiler executes generation |
| **Studio Validation Loop™** | Generator QA (16) = Self Review stage; full Validation Loop gates Runtime install |
| **Studio Critique Sessions™** | Conversational review before Founder Approval; action items feed Revision Engine |
| **Studio Department Runtime™** | Generator outputs package manifest; Runtime assembles only after Validation approves |
| **Golden Department™** | Creative Direction Studio™ is first validation project through this pipeline |
| **Company Genome™** | All branding derived at compile-time via Genome slots — never baked |
| **Headquarters Marketplace™** | Generator exports installable Department Packages |
| **FAL** | One provider route among many — Generator is provider-agnostic |
| **Cursor** | Wires runtime handlers — never designs departments |

---

## Supported Department Types (Initial)

| Category | Department Types |
|----------|------------------|
| **Creative** | Creative Direction · Discovery · Story · Production · Review · Publishing · Marketing |
| **Commerce** | Marketplace |
| **Executive** | Executive HQ |
| **Industry** | Photography · Podcast · Education · Salon · Law Firm · Medical · Restaurant · Construction |
| **Future** | Any type registered in Department DNA catalog |

Every type inherits Golden Department principles. Topology may vary; **place-not-page** law does not.

---

## Validation Project

**Creative Direction Studio™** (`creative-direction`) is the first department generated end-to-end through this engine.

| Reference | Path |
|-----------|------|
| **Golden Department Definition** | [`docs/studio-os/departments/creative-direction-studio/`](../../departments/creative-direction-studio/README.md) |
| Golden Department experience spec | `docs/studio-os/golden-department/creative-direction-studio/` |
| Compiler profile | `engine/asset-compiler/07_DEPARTMENT_COMPILER.md` |
| Expected package | `pkg-creative-direction-golden-v1` |

Pipeline success criterion: Generated package passes Generator QA (16) + Compiler QA (12) + **Validation Loop** (creative · experience · Genome · founder) + Runtime QA (20) and feels indistinguishable from Golden Department intent.

---

## Schema & Output Layer

Canonical **manifest schemas** and **prompt package specs** live alongside this engine:

| Layer | Path |
|-------|------|
| **Engine architecture** | `docs/studio-os/engine/department-generator/` (this folder) |
| **Output schemas** | [`docs/studio-os/department-generator/`](../../department-generator/README.md) |

The schema layer defines `department.json` · `environment-blueprint.json` · `assets.json` · `interactions.json` · `assembly-blueprint.json` · `room-dna.json` · `prompts/*.md` — the files every generation run produces before Asset Compiler cooks assets.

---

## Schema Namespace

```
studio.department-generator.v1
├── generator-input
├── department-dna
├── compile-profile
├── generation-instruction-set
├── interaction-map
├── ai-team-manifest
├── audio-manifest
├── animation-manifest
├── package-manifest
└── regeneration-scope
```

---

## Design Philosophy

1. **Factory, not department** — The Generator creates worlds; it never becomes one
2. **Structured in, worlds out** — Founders supply intelligence; the engine supplies prompts
3. **Modular by default** — Every object, sound, motion, and interaction is independently replaceable
4. **Genome-native** — Same Department DNA + different Genome = different soul
5. **Golden Department inheritance** — Every output must answer: *Does it feel as alive as Creative Direction Studio™?*
6. **No manual prompting** — Founders never type FAL prompts; the Generator compiles them
7. **Provider-agnostic** — FAL today; any model tomorrow

---

_Studio Department Generator™ — Where departments are born._
