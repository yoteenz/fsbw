# Studio Asset Compiler™

**Version:** 1.0.0  
**Status:** Canonical Engine Specification  
**Type:** Core Studio OS Engine — not a feature, not a department  
**Parent:** [Studio Department SDK™](../../sdk/README.md) · [Company Genome™ M277](../../company-genome.md) · [Headquarters Engine™](../../headquarters-engine.md)  
**Engine ID:** `studio.asset-compiler.v1`

---

> **The compiler converts structured company intent into modular asset generation packages. It never produces webpages. It never produces flattened mockups.**

Studio Asset Compiler™ is one of the **core engines** of Studio OS — equivalent to Unreal Engine's asset cooking pipeline, Pixar's production pipeline, and AAA procedural generation systems combined.

Founders define intent. The compiler translates intent into **hundreds of structured asset-generation tasks** automatically. Users never manually prompt AI.

---

## What This Engine Does

| Does | Does Not |
|------|----------|
| Receive structured company data | Generate webpages |
| Compile dozens of modular prompts | Send one monolithic prompt |
| Orchestrate ordered asset generation | Generate out of order |
| Inject Company Genome into every prompt | Hardcode brand visuals |
| Output modular Department Asset Packages | Output flattened mockups |
| Version every asset independently | Require full department rebuild |
| Abstract across AI providers | Depend on a single model |
| Validate packages before export | Ship broken assemblies |
| Export Marketplace-ready packages | Build runtime experiences |

---

## Engine Position

```
┌─────────────────────────────────────────────────────────────┐
│                    FOUNDER INTENT                            │
│  Company Genome · Department Type · Project · Creative Dir   │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         STUDIO DEPARTMENT GENERATOR™                       │
│  DNA · Compilers · Genome · Package blueprint · QA           │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STUDIO ASSET COMPILER™ (this engine)            │
│  Input System → Prompt Compiler → Generation Pipeline →      │
│  Package Assembly → QA Validation → Export                   │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STUDIO VALIDATION LOOP™                         │
│  Creative · Experience · Genome · Braintrust · Founder       │
└───────────────────────────┬─────────────────────────────────┘
                            ↓ (approved only)
┌─────────────────────────────────────────────────────────────┐
│              STUDIO RUNTIME + CURSOR                         │
│  Runtime assembles · Cursor connects interactions            │
│  Company Genome injects at runtime (materials, voice, etc.)│
└─────────────────────────────────────────────────────────────┘
```

---

## Manufacturing Layer (v1)

Canonical **Department Definition → DepartmentPackage.zip** manufacturing spec:

**[`docs/studio-os/engines/studio-asset-compiler/`](../engines/studio-asset-compiler/README.md)**

| Manufacturing doc | This engine doc |
|-------------------|-----------------|
| `input-spec.md` (Department Definition) | `02_INPUT_SYSTEM.md` |
| `prompt-expansion-engine.md` | `03_PROMPT_COMPILER.md` |
| `generation-pipeline.md` | `04_ASSET_GENERATION_PIPELINE.md` |
| `output-spec.md` (16-folder zip) | `05_ASSET_PACKAGE_SPEC.md` |
| `quality-engine.md` | `12_QA_VALIDATION.md` |
| `provider-abstraction.md` | `14_FUTURE_AI_PROVIDERS.md` |

First compile target: [`departments/creative-direction-studio/`](../departments/creative-direction-studio/README.md) → `CreativeDirectionStudio_Package.zip`

---

## Document Index

| # | Document | System |
|---|----------|--------|
| A02 | [Studio Foundry™](./ARTICLE_A02_STUDIO_FOUNDRY.md) | Asset ID → Asset Registry™ → manufacture when missing/regenerated → registered asset |
| A01 | [Asset Compiler™ Implementation Article](./ARTICLE_A01_ASSET_COMPILER.md) | Studio Foundry™ internal compiler: Generation Recipes™ → FAL request → Asset Registry™ |
| 01 | [Compiler Overview](./01_COMPILER_OVERVIEW.md) | Purpose, pipeline, integrations |
| 02 | [Input System](./02_INPUT_SYSTEM.md) | Every compiler input defined |
| 03 | [Prompt Compiler](./03_PROMPT_COMPILER.md) | Multi-prompt generation heart |
| 04 | [Asset Generation Pipeline](./04_ASSET_GENERATION_PIPELINE.md) | Ordered generation stages |
| 05 | [Asset Package Spec](./05_ASSET_PACKAGE_SPEC.md) | Output package structure |
| 06 | [Metadata Standard](./06_METADATA_STANDARD.md) | Per-asset metadata law |
| 07 | [Department Compiler](./07_DEPARTMENT_COMPILER.md) | Per-department compilation profiles |
| 08 | [Company Genome Injection](./08_COMPANY_GENOME_INJECTION.md) | Genome-driven visual derivation |
| 09 | [World Assembly](./09_WORLD_ASSEMBLY.md) | Compiler → Runtime handoff |
| 10 | [Versioning System](./10_VERSIONING_SYSTEM.md) | Independent asset versioning |
| 11 | [Regeneration Rules](./11_REGENERATION_RULES.md) | Surgical regeneration law |
| 12 | [QA Validation](./12_QA_VALIDATION.md) | Automated package validation |
| 13 | [Marketplace Export](./13_MARKETPLACE_EXPORT.md) | Exportable department packages |
| 14 | [Future AI Providers](./14_FUTURE_AI_PROVIDERS.md) | Provider abstraction layer |
| 15 | [Implementation Guide](./15_IMPLEMENTATION_GUIDE.md) | Engineering build roadmap |

---

## Relationship to Department SDK™

| Layer | Document | Scope |
|-------|----------|-------|
| **Department SDK™** | `docs/studio-os/sdk/` | What departments are — anatomy, objects, interactions |
| **Studio Department Generator™** | `docs/studio-os/engine/department-generator/` | How departments are **created** — DNA, compile tasks, package blueprints |
| **Studio Asset Compiler™** | `docs/studio-os/engine/asset-compiler/` | How department assets are **generated** |
| **Studio Validation Loop™** | `docs/studio-os/engine/validation-loop/` | Whether outputs **deserve to exist** — creative authority gate |
| **Studio Critique Sessions™** | `docs/studio-os/engine/critique-sessions/` | **Collaborative critique** — make work better before approval |
| **Department Runtime** | `docs/studio-os/engine/department-runtime/` | How packages are **assembled and operated** (approved only) |
| **Cursor Runtime** | SDK `15_CURSOR_RUNTIME_REQUIREMENTS.md` | How Cursor **connects** interactions |

SDK doc `14_FAL_ASSET_COMPILER.md` is the **FAL-specific subset** of this engine. This document set is the **canonical, provider-agnostic** specification.

---

## Design Philosophy

### Unreal Engine Cooking Pipeline

Assets are **cooked** from raw inputs into runtime-ready packages. Each asset is independent. Dependencies are explicit. Order matters.

### Pixar Production Pipeline

Departments are **stages** in a production line. Each stage has defined inputs, outputs, and quality gates. Nothing ships without review.

### AAA Procedural Generation

Structured parameters drive generation. The same compiler produces visually distinct outputs from different Genome profiles — without changing the pipeline.

### Not Midjourney

Users never type prompts. Founders express intent through Company Genome, Department DNA, and Project Intent. The compiler handles translation.

---

## Core Principles

1. **Intent in, packages out** — structured data drives everything
2. **Dozens of prompts, never one** — per-asset, per-category prompt stacks
3. **Genome inherits automatically** — every prompt receives Genome context
4. **Ordered generation** — architecture before furniture before interactions
5. **Modular output** — every asset is independently replaceable and versioned
6. **Provider-agnostic** — abstraction layer over FAL, OpenAI, BFL, Runway, Luma
7. **Runtime assembles, compiler generates** — compiler never builds experiences
8. **Validate before ship** — Compiler QA (12) feeds Self Review; Studio Validation Loop™ grants creative authority before Runtime

---

## Who Uses This Engine

| Role | Usage |
|------|-------|
| **Compiler Architects** | Extend department profiles and prompt templates |
| **Pipeline Engineers** | Implement generation pipeline per Implementation Guide |
| **Provider Integrators** | Add AI providers via abstraction layer |
| **QA Engineers** | Gate packages via validation checklist |
| **Marketplace Publishers** | Export packages via Marketplace Export spec |
| **AI Agents** | Must read this engine before any generation work |

---

## Versioning

| Field | Value |
|-------|-------|
| Engine Version | `1.0.0` |
| Schema Namespace | `studio.asset-compiler.v1` |
| Package Format | `studio.department-package.v1` |
| Breaking changes | Constitutional amendment + major version bump |

---

_Studio Asset Compiler™ — The permanent generation engine powering every department, every industry, every marketplace pack, and every immersive world inside Studio OS._
