# Studio Department Generator™ — Schema & Output Layer (v1)

**Version:** 1.0.0  
**Status:** Canonical output schemas and assembly contracts  
**Type:** Foundational engine documentation — schemas, manifests, prompt packages  
**Canonical engine:** [`../engine/department-generator/`](../engine/department-generator/README.md) (18-doc compiler architecture)  
**Engine ID:** `studio.department-generator.v1`

---

> **We are not building departments individually. We are building the machine that generates every Studio OS department for every industry.**

Think less like building a webpage. Think more like designing **Unreal Engine for businesses**.

---

## What This Folder Defines

| Layer | Location | Scope |
|-------|----------|-------|
| **Engine architecture** | `docs/studio-os/engine/department-generator/` | Compilers · DNA · handoffs · QA · implementation |
| **This folder** | `docs/studio-os/department-generator/` | **Output schemas** · manifests · prompt packages · assembly |

This sprint creates **documentation and architecture only** — no React · no CSS · no Three.js · no UI · no placeholder screenshots.

---

## Generator Outputs (v1)

Every department generation run produces:

| # | Output | Schema Doc | File |
|---|--------|------------|------|
| 1 | **Department Manifest** | [department-schema.md](./department-schema.md) | `department.json` |
| 2 | **Environment Blueprint** | [environment-schema.md](./environment-schema.md) | `environment-blueprint.json` |
| 3 | **Asset Blueprint** | [asset-schema.md](./asset-schema.md) | per-object specs |
| 4 | **Environment Prompt Package** | [fal-prompt-spec.md](./fal-prompt-spec.md) | `prompts/*.md` |
| 5 | **Asset Manifest** | [asset-schema.md](./asset-schema.md) | `assets.json` |
| 6 | **Interaction Manifest** | [interaction-schema.md](./interaction-schema.md) | `interactions.json` |
| 7 | **Scene Assembly Blueprint** | [assembly-pipeline.md](./assembly-pipeline.md) | `assembly-blueprint.json` |
| 8 | **Room DNA™** | [room-dna.md](./room-dna.md) | `room-dna.json` |

---

## Output Folder Structure (Per Department Run)

```
generated/{departmentId}/{version}/
├── department.json                 # Department Manifest
├── room-dna.json                   # Room DNA™ slider snapshot
├── environment-blueprint.json      # Environment Blueprint
├── assets.json                     # Asset Manifest
├── interactions.json               # Interaction Manifest
├── assembly-blueprint.json         # Scene Assembly Blueprint
├── prompts/                        # Environment Prompt Package
│   ├── environment.md
│   ├── lighting.md
│   ├── materials.md
│   ├── furniture.md
│   ├── decor.md
│   ├── architecture.md
│   ├── camera.md
│   ├── vfx.md
│   └── animation.md
├── assets/                         # Per-asset blueprints (pre-cook)
│   └── {assetId}.blueprint.json
└── handoff/
    ├── generation-instruction-set.json   # → Asset Compiler
    └── runtime-assembly-manifest.json    # → Department Runtime
```

Cooked assets land in `DepartmentPackage.zip` per [engine Package Spec](../engine/department-generator/13_PACKAGE_SPEC.md). Manufacturing layer: [Studio Asset Compiler™](../engines/studio-asset-compiler/README.md).

---

## Design Laws

1. **No flattened backgrounds** — every department assembled from modular generated assets
2. **Every object is its own asset** — desk · chair · orb · glass panel · each with prompt + behavior
3. **Prompt packages, not HTML** — organized `.md` prompt files for high-end image generation
4. **Cursor assembles, humans don't position** — Scene Assembly Blueprint defines placement rules
5. **Room DNA™ sliders** — reusable aesthetic genes for any future room
6. **AAA modular pipeline** — architecture before furniture before interactions

---

## Validation Project

**Creative Direction Studio™** is the first department through this pipeline.

| Reference | Path |
|-----------|------|
| **Golden Department Definition** | [`docs/studio-os/departments/creative-direction-studio/`](../departments/creative-direction-studio/README.md) |
| Golden Department experience spec | `docs/studio-os/golden-department/creative-direction-studio/` |
| Engine DNA catalog | `engine/department-generator/03_DEPARTMENT_DNA.md` |
| Expected package | `pkg-creative-direction-golden-v1` |

---

## Document Index

| Document | Contents |
|----------|----------|
| [department-schema.md](./department-schema.md) | `department.json` — name · purpose · profiles · concierges · unlocks |
| [room-dna.md](./room-dna.md) | Room DNA™ aesthetic sliders |
| [environment-schema.md](./environment-schema.md) | Floor · walls · lighting · composition tasks |
| [asset-schema.md](./asset-schema.md) | Per-object blueprints · `assets.json` |
| [interaction-schema.md](./interaction-schema.md) | `interactions.json` verb bindings |
| [assembly-pipeline.md](./assembly-pipeline.md) | Cursor/Runtime scene assembly |
| [fal-prompt-spec.md](./fal-prompt-spec.md) | Prompt package file format |
| [future-roadmap.md](./future-roadmap.md) | v2+ evolution |

---

## Platform Position

```
Company Genome™ + Department DNA™ + Room DNA™
         ↓
Studio Department Generator™ (engine + this schema layer)
         ↓
Environment Prompt Package + Asset Blueprints
         ↓
Studio Asset Compiler™ (FAL / providers cook assets)
         ↓
Scene Assembly Blueprint → Department Runtime™ + Cursor
         ↓
Validation Loop™ → Walk the Room™ → Headquarters
```

---

_Studio Department Generator™ — Unreal Engine for businesses._
