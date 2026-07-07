# 09 — World Assembly

**Engine Module:** `studio.asset-compiler.v1.world-assembly`  
**Status:** Compiler → Runtime handoff specification  
**Canonical runtime:** [Studio Department Runtime™](../department-runtime/README.md)  
**Philosophy:** The compiler generates packages. The runtime assembles worlds. Cursor connects interactions.

---

## Separation of Concerns

| System | Responsibility | Does NOT |
|--------|---------------|----------|
| **Studio Asset Compiler™** | Generate modular asset packages | Assemble environments |
| **Studio Runtime** (SDK 11) | Load and assemble packages into living departments | Generate assets |
| **Cursor Runtime** (SDK 15) | Connect interactions, enforce permissions | Generate or assemble |
| **Company Genome™** | Inject brand values at runtime | Generate assets |

> The compiler never builds experiences. The runtime assembles them.

---

## Handoff Flow

```
Studio Asset Compiler™
    │
    │  OUTPUT: Department Asset Package
    │  (modular assets + metadata + interactions + genome hooks)
    │
    ▼
Asset Registry™ (registration + versioning)
    │
    ▼
Studio Runtime (Department Runtime — SDK 11)
    │
    │  LOAD: asset modules per load order
    │  ASSEMBLE: spatial placement from metadata
    │  INJECT: Genome values into shader/lighting/audio slots
    │  ACTIVATE: AI employees, interaction maps, camera
    │
    ▼
Cursor Runtime (SDK 15)
    │
    │  CONNECT: verb → handler routing
    │  ENFORCE: permissions, accessibility
    │  PERSIST: user work state
    │
    ▼
Living Department (user experiences world)
```

---

## What the Compiler Outputs

| Output | Consumer | Purpose |
|--------|----------|---------|
| 3D meshes (`.glb`) | Studio Runtime loader | Spatial objects |
| Material shaders (`.json`) | Studio Runtime genome injector | Surface appearance |
| Lighting rig (`lights.json`) | Studio Runtime genome injector | Scene illumination |
| Audio files (`.ogg`, `.wav`) | Studio Runtime audio mixer | Soundscape |
| Particle defs (`particles.json`) | Studio Runtime particle system | Atmosphere |
| Animation clips (`.glb`) | Studio Runtime motion player | Movement |
| Camera presets (`camera.json`) | Studio Runtime camera controller | Viewpoints |
| Interaction maps (`interactions.json`) | Cursor Runtime interaction router | User verbs |
| AI triggers (`ai-triggers.json`) | Studio Runtime AI orchestrator | AI responses |
| Package metadata (`metadata.json`) | Studio Runtime assembler | Object placement |
| Genome hooks (`genome-hooks.json`) | Studio Runtime genome injector | Injection targets |
| Preview images (`.webp`) | Marketplace, admin UI | Marketing only — not loaded at runtime |

---

## What the Runtime Assembles

### Assembly Sequence (from package)

```
1. PRE-FLIGHT
   Read manifest.json → validate version → check permissions

2. LOAD MATERIALS
   materials/*.json → shader bundles with empty Genome slots

3. LOAD METADATA
   metadata.json → object placements, zone bounds, load order

4. LOAD ENVIRONMENT
   environment/*.glb → place in spatial envelope

5. LOAD FURNITURE + GLASS + DECOR
   Per metadata.objectPlacements → attach to environment nodes

6. ACTIVATE LIGHTING
   lighting/lights.json → position anchors → Genome fills parameters

7. POSITION ORB
   orb/orb.glb → attach to orb-pedestal node

8. START PARTICLES
   particles/*.json → ambient systems → Genome fills colors

9. LOAD AUDIO
   audio/* → preload ambient → queue SFX

10. BIND ANIMATIONS
    animations/* → attach to objects + camera paths

11. SET CAMERA
    camera/camera.json → arrival position

12. INJECT GENOME
    genome-hooks.json → fill all slots from live Company Genome™

13. BIND INTERACTIONS
    interactions/*.json → Cursor Runtime takes over verb routing

14. ACTIVATE AI
    ai-triggers.json → initialize concierges

15. GO LIVE
    Arrival sequence → ACTIVE state
```

---

## What Cursor Connects

Cursor Runtime receives the assembled department and connects:

| Connection | Source | Handler |
|------------|--------|---------|
| Verb routing | `interactions.json` bindings | Interaction router |
| Permission gating | Organization membership + department roles | Permission checker |
| State persistence | Verb completion events | State persister |
| AI orchestration | `ai-triggers.json` + verb events | AI orchestrator |
| Command Dock | Department commands from anatomy | Command registration |
| Event Bus | All verb/state events | Event emitter |
| Accessibility | SDK 04 fallbacks | Keyboard/voice alternatives |

Cursor does **not**:
- Load assets (Studio Runtime does)
- Inject Genome (Studio Runtime does)
- Generate anything (Compiler does)
- Decide creative direction (Creative Direction Studio™ does)

---

## Package → Runtime Contract

```yaml
RuntimeLoadContract:
  packageFormat: "studio.department-package.v1"
  minimumSdkVersion: "1.0.0"
  requiredFiles:
    - manifest.json
    - metadata.json
    - genome-hooks.json
    - interactions/interactions.json
    - camera/camera.json
  requiredCategories:
    - environment
    - materials
    - lighting
    - interactions
  optionalCategories:
    - furniture
    - glass
    - orb
    - particles
    - audio
    - animations
    - decor
    - previews
  genomeInjection: runtime           # always runtime for marketplace packages
  interactionBinding: cursor-runtime
```

---

## Assembly Validation (Runtime-Side)

Runtime validates package before assembly:

| Check | Failure Behavior |
|-------|-----------------|
| manifest.json valid | Reject package |
| SDK version compatible | Reject with upgrade message |
| Checksums match | Load fallback per asset |
| metadata placements valid | Skip invalid placements |
| No object overlap | Warning + auto-adjust |
| Genome hooks resolvable | Use SDK defaults |
| interactions.json valid | Department loads read-only |

---

## Live Genome vs Compiled Genome

| Context | Genome Behavior |
|---------|----------------|
| **Organization compile** | Genome snapshot at compile time influences prompts; runtime uses live Genome |
| **Marketplace package** | Neutral compile; runtime injects installing company's live Genome |
| **Genome update after compile** | Runtime applies live values; no recompile needed for runtime-only domains (typography, voice, terminology) |
| **Genome update affecting visuals** | Surgical recompile recommended (11) for compile-time domains (materials, lighting, mood wall) |

---

## Multi-Department Assembly

Headquarters contains multiple department packages:

```
Headquarters
    ├── creative-direction/     ← Package 1
    ├── marketing/              ← Package 2
    ├── production/             ← Package 3
    └── executive/              ← Package 4
```

Each package assembles independently. World Routing (SDK 12) handles travel between assembled departments. No package contains references to other packages — connections declared in anatomy dependencies only.

---

## Performance at Assembly

| Metric | Target |
|--------|--------|
| Package validation | ≤ 500ms |
| Full assembly (cached) | ≤ 2s |
| Full assembly (cold) | ≤ 5s |
| Genome injection | ≤ 1s |
| Interaction binding | ≤ 200ms |
| Memory per assembled department | ≤ 150 MB |

---

_Next: [10 — Versioning System](./10_VERSIONING_SYSTEM.md)_
