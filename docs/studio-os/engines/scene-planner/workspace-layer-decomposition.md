# Workspace Layer Decomposition™

**Engine Module:** `studio.scene-planner.v1.decomposition`  
**Status:** Every workspace → independent production layers

---

## Law

> Scene Planner™ breaks every workspace into **reusable production layers**.

> Every layer is **independently generatable** and **independently regeneratable**.

---

## Canonical Production Layers

Scene Planner uses **twelve generatable planning layers** plus **two Cursor-only layers**:

| # | Layer | Category | Generatable | Owner |
|---|-------|----------|-------------|-------|
| 01 | **Environment Shell™** | `environment` | ✓ | Provider |
| 02 | **Lighting™** | `lighting` | ✓ | Provider |
| 03 | **Architecture™** | `architecture` | ✓ | Provider |
| 04 | **Furniture™** | `furniture` | ✓ | Provider |
| 05 | **Hero Landmark™** | `prop` · `display` | ✓ | Provider |
| 06 | **Atmosphere™** | `vfx` | ✓ | Provider |
| 07 | **Materials™** | `material` | ✓ | Provider |
| 08 | **Particles™** | `particle` | ✓ | Provider |
| 09 | **Interactive Objects™** | `interaction` | ✓ | Provider + Cursor |
| 10 | **Runtime FX™** | `vfx` | — | **Cursor only** |
| 11 | **Audio™** | `audio` | ✓ | Provider |
| 12 | **Camera™** | `camera` | ✓ | Provider / metadata |
| — | **Interaction Layer™** | `ui` · `acrylic` | — | **Cursor only** |

Aligns with [Scene Stack Categories™](../studio-asset-registry/scene-stack-categories.md) and [Scene Stack™](../../scene-stack/README.md).

**Camera™** is a **planning layer** — defines framing · rig · motion motivation even when output is metadata-only.

---

## Story Table™ Example

```
workspaceScene: story-table
departmentId: creative-direction
         ↓
LayerManifest:
  - layerId: environment-shell
    category: Environment Shell™
    status: plan
  - layerId: lighting-systems
    category: Lighting™
  - layerId: architecture-structure
    category: Architecture™
  - layerId: furniture-story-table
    category: Furniture™
  - layerId: hero-landmark-story-table
    category: Hero Landmark™
  - layerId: atmosphere-editorial
    category: Atmosphere™
  - layerId: materials-surface
    category: Materials™
  - layerId: particles-ambient
    category: Particles™
  - layerId: interactive-holographic-cards
    category: Interactive Objects™
  - layerId: runtime-fx-story-table
    category: Runtime FX™
    generatable: false          # Cursor after visual approval
  - layerId: audio-ambient-story-table
    category: Audio™
  - layerId: camera-orbiting-strategy
    category: Camera™
  - layerId: interaction-layer-story-table
    category: Interaction Layer™
    generatable: false          # Cursor only
```

---

## Workspace Templates

Each [workspace scene](../../creative-intelligence-engine/workspaces-as-scenes.md) has a **default layer manifest template**:

| Workspace | Required layers | Optional layers |
|-----------|-----------------|-----------------|
| **Arrival™** | Environment Shell · Lighting · Architecture · Atmosphere · Camera | Hero Landmark · Audio |
| **Story Table™** | All 12 generatable + Cursor layers | Particles |
| **Mood Wall™** | Environment Shell · Lighting · Materials · Hero Landmark · Camera | Particles · Atmosphere |
| **Notes Desk™** | Environment Shell · Furniture · Lighting · Materials · Audio | Atmosphere |
| **Pipeline™** | Environment Shell · Lighting · Interactive Objects · UI Components | Architecture |
| **Library™** | Environment Shell · Architecture · Lighting · Materials · Furniture | Audio |

Templates are **starting manifests** — Blueprint Engine™ and founder intent may add/remove layers.

---

## Layer Isolation Rules

From [Scene Stack layer-architecture](../../scene-stack/layer-architecture.md):

| Rule | Meaning |
|------|---------|
| **No bleed** | Lighting layer must not redraw architecture geometry |
| **Shell first** | Environment Shell™ anchors scale for all dependent layers |
| **Landmark second** | Hero Landmark™ depends on shell proportions |
| **Cursor last** | Interaction · Runtime FX after visual layers approved |

---

## Partial Plan Modes

| Mode | Trigger | Layers planned |
|------|---------|----------------|
| **Full workspace** | New workspace generation | All template layers |
| **Single layer regen** | *"Warmer lighting on Story Table"* | One `LayerPlan™` + dependency check |
| **Delta workspace** | Blueprint upgrade | Changed layers only |
| **Reuse attach** | Exact Match™ from Registry | Zero generatable layers — link only |

---

## Scene Stack™ Mapping

| Scene Planner layer | Scene Stack™ layer ID |
|---------------------|----------------------|
| Environment Shell™ | `environment-shell` |
| Hero Landmark™ | `signature-landmark` |
| Furniture™ | `furniture` |
| Lighting™ | `lighting-systems` |
| Atmosphere™ · Particles™ | `atmospheric` |
| Materials™ | `surface-materials` |
| Interactive Objects™ | `interaction-layer` (visual pass) |
| Runtime FX™ | `runtime-effects` |
| Audio™ | parallel audio manifest |
| Camera™ | `camera-rig` metadata |
| Architecture™ | `environment-shell` (structural pass) |

Architecture™ may be a **structural sub-pass** of Environment Shell™ or independent layer per Blueprint.

---

## Forbidden

| Anti-pattern | Why |
|--------------|-----|
| Single-layer "full room" plan | Violates isolation law |
| Plan without workspace context | Layers are workspace-scoped |
| Include Runtime FX in provider queue | Cursor boundary |
| Skip Camera™ planning | Framing is production-critical |

---

_Workspace Layer Decomposition™ — twelve doors into one room, each opened independently._
