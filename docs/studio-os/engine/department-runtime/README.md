# Studio Department Runtime™

**Version:** 1.0.0  
**Status:** Canonical Engine Specification  
**Type:** Core Studio OS Engine — execution layer  
**Parent:** [Studio Asset Compiler™](../asset-compiler/README.md) · [Studio Department SDK™](../../sdk/README.md) · [Company Genome™ M277](../../company-genome.md)  
**Engine ID:** `studio.department-runtime.v1`

---

> **The Runtime does NOT create assets. It brings them to life.**

Studio Department Runtime™ is the **execution engine** of Studio OS — the runtime layer that loads Department Asset Packages from [Studio Asset Compiler™](../asset-compiler/README.md) and transforms them into fully interactive Department Workspaces.

Think of this as Unreal Engine's runtime, Unity's play mode, or a AAA game engine's world execution layer.

---

## What This Engine Does

| Does | Does Not |
|------|----------|
| Load modular asset packages | Generate assets |
| Assemble spatial departments | Design departments |
| Animate objects and cameras | Create artwork |
| Route physical interactions | Build form-based UI |
| Operate Orb and Concierge actors | Invent AI personalities |
| Inject Company Genome™ at runtime | Hardcode branding |
| Manage department/project state | Make business decisions |
| Install Marketplace packages live | Require HQ restart |

---

## Engine Position

```
Studio Asset Compiler™          → generates packages
         ↓
Department Asset Package        → modular assets + metadata
         ↓
Studio Department Runtime™      → THIS ENGINE (brings to life)
         ↓
Department Workspace              → user experiences living place
```

---

## Document Index

| # | Document | System |
|---|----------|--------|
| 01 | [Runtime Overview](./01_RUNTIME_OVERVIEW.md) | Purpose, lifecycle, integrations |
| 02 | [Asset Loader](./02_ASSET_LOADER.md) | Independent, lazy, progressive loading |
| 03 | [World Assembler](./03_WORLD_ASSEMBLER.md) | Ordered assembly pipeline |
| 04 | [Object Manager](./04_OBJECT_MANAGER.md) | Runtime object actors |
| 05 | [Interaction Engine](./05_INTERACTION_ENGINE.md) | Physical interaction verbs |
| 06 | [Orb Runtime](./06_ORB_RUNTIME.md) | Orb as runtime actor |
| 07 | [Concierge Runtime](./07_CONCIERGE_RUNTIME.md) | AI employees as living actors |
| 08 | [Navigation Engine](./08_NAVIGATION_ENGINE.md) | Travel between locations |
| 09 | [Camera System](./09_CAMERA_SYSTEM.md) | Cinematic camera behavior |
| 10 | [Animation Engine](./10_ANIMATION_ENGINE.md) | Motion, ceremonies, transitions |
| 11 | [Particle Engine](./11_PARTICLE_ENGINE.md) | Atmospheric and celebration particles |
| 12 | [Audio Engine](./12_AUDIO_ENGINE.md) | Ambient, SFX, adaptive audio |
| 13 | [Genome Injection](./13_GENOME_INJECTION.md) | Runtime brand transformation |
| 14 | [State Manager](./14_STATE_MANAGER.md) | All runtime state domains |
| 15 | [Project Runtime](./15_PROJECT_RUNTIME.md) | Project as living object |
| 16 | [Performance System](./16_PERFORMANCE_SYSTEM.md) | Streaming, caching, optimization |
| 17 | [Marketplace Runtime](./17_MARKETPLACE_RUNTIME.md) | Live package installation |
| 18 | [Runtime API](./18_RUNTIME_API.md) | Public service contracts |
| 19 | [Error Recovery](./19_ERROR_RECOVERY.md) | Graceful degradation |
| 20 | [Runtime QA](./20_RUNTIME_QA.md) | Validation gate |

---

## Relationship to SDK Runtime Docs

| Document | Scope |
|----------|-------|
| **SDK `11_DEPARTMENT_RUNTIME.md`** | SDK-level runtime contract (summary) |
| **SDK `15_CURSOR_RUNTIME_REQUIREMENTS.md`** | Cursor assembly obligations |
| **This engine (`department-runtime/`)** | Canonical full runtime architecture |

---

## Core Principles

1. **Assemble, never create** — packages in, living worlds out
2. **Industry-agnostic** — Genome + DNA + package define expression
3. **Physical interactions** — verbs on objects, not forms on pages
4. **Actors, not widgets** — Orb, Concierges, objects are runtime actors
5. **Project follows the user** — active Project is first-class runtime object
6. **Graceful always** — missing assets never white-screen
7. **Live installation** — Marketplace packages without HQ restart

---

## Versioning

| Field | Value |
|-------|-------|
| Engine Version | `1.0.0` |
| Schema Namespace | `studio.department-runtime.v1` |
| Package Input Format | `studio.department-package.v1` |

---

_Studio Department Runtime™ — The permanent execution engine powering every Headquarters, Department, Workspace, Project, and Marketplace Expansion._
