# 01 — Runtime Overview

**Engine Module:** `studio.department-runtime.v1.overview`  
**Status:** Canonical engine definition

---

## What Is Studio Department Runtime™?

Studio Department Runtime™ is a **core Studio OS engine** responsible for loading, assembling, animating, and operating **Department Asset Packages** into fully interactive **Department Workspaces**.

> Receives a package. Transforms it into a living place. Never knows which industry it serves.

---

## Purpose

Bring compiled department assets to life — spatially, interactively, audibly, intelligently — by orchestrating loaders, assemblers, object actors, interaction routing, Genome injection, AI concierges, and state management into a cohesive runtime experience.

The Runtime is the **play button** on everything the Asset Compiler cooks.

---

## Responsibilities

| Responsibility | Subsystem |
|----------------|-----------|
| Load asset modules independently | Asset Loader (02) |
| Assemble spatial world in order | World Assembler (03) |
| Instantiate runtime object actors | Object Manager (04) |
| Route physical user interactions | Interaction Engine (05) |
| Operate Orb as ambient intelligence actor | Orb Runtime (06) |
| Operate Concierge AI employees | Concierge Runtime (07) |
| Handle travel between departments | Navigation Engine (08) |
| Control cinematic cameras | Camera System (09) |
| Play motion profiles and ceremonies | Animation Engine (10) |
| Render atmospheric particles | Particle Engine (11) |
| Mix spatial and ambient audio | Audio Engine (12) |
| Inject Company Genome™ values | Genome Injection (13) |
| Persist all runtime state | State Manager (14) |
| Bind active Project context | Project Runtime (15) |
| Optimize load and render performance | Performance System (16) |
| Install Marketplace packages live | Marketplace Runtime (17) |
| Expose public service API | Runtime API (18) |
| Recover from failures gracefully | Error Recovery (19) |
| Validate living-place quality | Runtime QA (20) |

### What Runtime Does NOT Do

| Not Responsible | Owner |
|-----------------|-------|
| Generate 3D assets | Studio Asset Compiler™ |
| Write prompts | Prompt Compiler |
| Creative direction | Creative Direction Studio™ |
| Department anatomy design | Studio Department SDK™ |
| Business workflow logic | Department anatomy + platform services |
| Flattened UI page rendering | Forbidden pattern |

---

## Inputs

```yaml
RuntimeInput:
  package: DepartmentAssetPackage     # from Asset Compiler (studio.department-package.v1)
  departmentDNA: DepartmentDNA        # SDK anatomy + spatial + objects
  companyGenome: CompanyGenomeSnapshot  # live M277 snapshot
  projectContext: ProjectRuntimeContext | null
  experienceDNA: ExperienceDNA
  userSession:
    userId: string
    organizationId: string
    permissions: PermissionSet
    preferences: UserPreferences      # reduced motion, audio, etc.
  headquartersContext:
    buildingId: string
    connections: DepartmentConnection[]
  config: RuntimeConfig
```

**Runtime never requires industry ID.** Industry expression emerges from Genome + DNA + package.

---

## Outputs

```yaml
RuntimeOutput:
  workspace: DepartmentWorkspace      # live interactive department
  state: RuntimeStateSnapshot         # all state domains (14)
  events: RuntimeEventStream          # Event Bus™ emissions
  genomeLearning: GenomeLearningSignal[]  # optional learning outputs
  metrics: RuntimeMetrics             # performance telemetry
```

A **Department Workspace** is not a React page — it is a runtime instance with object actors, zones, cameras, audio, particles, Orb, Concierges, and active Project binding.

---

## Lifecycle

```
UNLOADED
    ↓ load()
LOADING ────────────────────────── Asset Loader (02)
    ↓
ASSEMBLING ─────────────────────── World Assembler (03)
    ↓
OBJECT_INSTANTIATION ─────────── Object Manager (04)
    ↓
GENOME_INJECTING ───────────────── Genome Injection (13)
    ↓
INTELLIGENCE_ACTIVATING ────────── Orb (06) + Concierge (07)
    ↓
PROJECT_HYDRATING ──────────────── Project Runtime (15)
    ↓
READY
    ↓ activate() — arrival sequence
ACTIVE ─────────────────────────── User interaction live
    ↓ background() — travel away
BACKGROUND ─────────────────────── State preserved, render paused
    ↓ resume() — return visit
ACTIVE
    ↓ unload() — departure sequence
UNLOADING
    ↓
UNLOADED
```

| State | User Experience |
|-------|-----------------|
| `LOADING` | Loading ritual — environment materializing |
| `ASSEMBLING` | Furniture placing, lighting activating |
| `GENOME_INJECTING` | Room color crossfade |
| `READY` | Arrival camera sequence begins |
| `ACTIVE` | Full interaction, audio, particles |
| `BACKGROUND` | Department paused; state preserved |
| `UNLOADING` | Departure animation |

---

## Engine Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              STUDIO DEPARTMENT RUNTIME™                      │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │Asset Loader│→ │World       │→ │Object      │             │
│  │    (02)    │  │Assembler(03)│  │Manager (04)│             │
│  └────────────┘  └────────────┘  └─────┬──────┘             │
│                                         ↓                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │              RUNTIME SUBSYSTEMS                     │     │
│  │  Interaction(05) · Orb(06) · Concierge(07)         │     │
│  │  Navigation(08) · Camera(09) · Animation(10)       │     │
│  │  Particle(11) · Audio(12) · Genome(13)             │     │
│  │  State(14) · Project(15) · Performance(16)         │     │
│  └────────────────────────────────────────────────────┘     │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │         STATE MANAGER (14) + RUNTIME API (18)       │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Dependencies

### Upstream

| System | Provides |
|--------|----------|
| **Studio Asset Compiler™** | Department Asset Packages |
| **Studio Department SDK™** | Anatomy, objects, verbs, spatial law |
| **Company Genome™** | Live identity for injection |
| **Project Model / Project Genome™** | Active project context |
| **Asset Registry™** | Package storage and versioning |
| **Experience DNA™** | Atmosphere and motion character |
| **Platform Interaction Engine™ M130** | Global behavioral states |

### Downstream Consumers

| System | Consumes |
|--------|----------|
| **Cursor** | Runtime API for interaction wiring |
| **Command Dock™** | Department commands and status |
| **Event Bus™** | Runtime events |
| **World Routing / Navigation** | Travel orchestration |
| **Headquarters Engine™** | Multi-department HQ context |
| **Marketplace Install Engine** | Live package mounting |

---

## Relationship: Studio Asset Compiler™

```
Compiler OUTPUT  →  Runtime INPUT
```

| Compiler Produces | Runtime Consumes |
|-------------------|------------------|
| `.glb` meshes | Object Manager actors |
| `materials/*.json` | Genome Injection shader fills |
| `lights.json` | Genome Injection + Lighting render |
| `interactions.json` | Interaction Engine bindings |
| `metadata.json` | World Assembler placements |
| `genome-hooks.json` | Genome Injection targets |
| `camera.json` | Camera System presets |
| Audio files | Audio Engine mixer |
| Particle JSON | Particle Engine emitters |

Compiler regenerates one asset → Runtime hot-swaps via Asset Loader without full rebuild.

---

## Relationship: Company Genome™

Genome is consulted **at runtime injection** (after load, before ACTIVE):

- Materials, lighting, typography, audio, AI voice, terminology, Mood Wall content
- Runtime holds **live Genome subscription** — updates trigger `genome-refresh` without recompile when possible

Runtime never stores brand as department property — only Genome snapshot ID in state audit.

---

## Relationship: Studio Department SDK™

SDK defines **law**; Runtime **enforces**:

| SDK Doc | Runtime Enforcement |
|---------|---------------------|
| 01 Anatomy | Workspace structure |
| 02 Spatial Layout | Assembly envelope |
| 03 Object Library | Object Manager class bindings |
| 04 Interaction Engine | Interaction Engine verb routing |
| 05 AI Employees | Concierge Runtime roles |
| 06 Asset Standard | Asset Loader categories |
| 08 Motion Standard | Animation Engine profiles |
| 09 Audio Standard | Audio Engine mixing law |

---

## Relationship: Studio Engine™

Department Runtime is a **subsystem of Studio Engine**:

```
Studio Engine
├── Company Genome Service
├── Asset Compiler
├── Asset Registry
├── Department Runtime          ← this engine
├── Project Service
├── Event Bus
└── Headquarters Orchestrator
```

Studio Engine invokes `DepartmentRuntime.load()` on travel events and `DepartmentRuntime.install()` on Marketplace events.

---

## Relationship: Cursor

Cursor is the **runtime engineer** — not the designer:

| Cursor Implements | Using Runtime API |
|-------------------|-------------------|
| Interaction handler wiring | Interaction Engine (05) |
| Permission enforcement | State Manager + API |
| Platform accessibility | Interaction fallbacks |
| Event persistence hooks | State Manager (14) |
| Command Dock registration | Runtime API (18) |

Cursor does **not** load assets, inject Genome, or assemble worlds — Runtime does.

---

## Invocation Contract

```yaml
LoadRequest:
  departmentId: string
  packageId: string                   # or package path
  organizationId: string
  userId: string
  projectId: string | null
  entryMethod: enum                   # walk | quick-travel | deep-link | orb-dispatch
  config: RuntimeConfig

InstallRequest:
  marketplacePackageId: string
  organizationId: string
  installMode: enum                   # hot | queued
```

See [18 — Runtime API](./18_RUNTIME_API.md) for full service contracts.

---

_Next: [02 — Asset Loader](./02_ASSET_LOADER.md)_
