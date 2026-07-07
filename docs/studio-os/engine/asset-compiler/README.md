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
│              DEPARTMENT ASSET PACKAGE                        │
│  Modular assets · metadata · interactions · genome hooks   │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STUDIO RUNTIME + CURSOR                         │
│  Runtime assembles · Cursor connects interactions            │
│  Company Genome injects at runtime (materials, voice, etc.)│
└─────────────────────────────────────────────────────────────┘
```

---

## Document Index

| # | Document | System |
|---|----------|--------|
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
| **Studio Asset Compiler™** | `docs/studio-os/engine/asset-compiler/` | How department assets are **generated** |
| **Department Runtime** | SDK `11_DEPARTMENT_RUNTIME.md` | How packages are **assembled and operated** |
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
8. **Validate before ship** — automated QA on every package

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
