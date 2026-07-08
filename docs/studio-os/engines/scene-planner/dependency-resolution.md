# Dependency Resolution™

**Engine Module:** `studio.scene-planner.v1.dependencies`  
**Status:** Layer DAG · asset dependency resolution

---

## Purpose

Scene Planner™ builds a **directed acyclic graph (DAG)** of layer and asset dependencies before any generation is scheduled.

---

## Two Dependency Planes

| Plane | What depends on what |
|-------|---------------------|
| **Layer DAG** | Production layers (Lighting™ requires Environment Shell™) |
| **Asset DAG** | Registry items within layers (chair requires shell scale) |

Both merge into `SceneBlueprint.dependencies`.

---

## Layer Dependency Rules (Canonical)

### Hard Requires (`requires`)

| Dependent | Prerequisite | Reason |
|-----------|----------------|--------|
| Architecture™ | Environment Shell™ | Scale · envelope anchor |
| Hero Landmark™ | Environment Shell™ + Architecture™ | Proportion · placement |
| Furniture™ | Environment Shell™ | Floor plane · clearance |
| Lighting™ | Environment Shell™ | Volume · light pools |
| Materials™ | Environment Shell™ | Surface targets |
| Atmosphere™ | Environment Shell™ | Depth planes |
| Particles™ | Atmosphere™ | Particle field context |
| Interactive Objects™ | Furniture™ or Architecture™ | Mount surfaces |
| Camera™ | Environment Shell™ | Framing volume |
| Audio™ | Environment Shell™ | Room acoustic character |
| Runtime FX™ | All approved visual layers | Cursor boundary |
| Interaction Layer™ | Interactive Objects™ visual pass | Cursor boundary |

### Soft Recommends (`recommends`)

| Dependent | Recommended | Reason |
|-----------|-------------|--------|
| Atmosphere™ | Lighting™ | Light-motivated haze |
| Materials™ | Lighting™ | Material read under correct rig |
| Particles™ | Lighting™ | Visible particle catch |
| Camera™ | Hero Landmark™ | Hero framing motivation |

### Blocks Until Approved (`blocks-until-approved`)

| Dependent | Blocks on | Reason |
|-----------|-----------|--------|
| Runtime FX™ | Visual layer approval | No FX on draft visuals |
| Interaction Layer™ | Interactive Objects™ approval | Hotspots need stable geometry |

---

## Asset Dependency Resolution

Per layer, Planner queries [Registry Dependency Graph](../studio-asset-registry/dependency-graph.md):

```yaml
AssetDependencyResolve:
  layerId: string
  candidateRegistryId: string
  requires:
    - registryId: string
      resolved: boolean
  recommends:
    - registryId: string
  conflicts:
    - registryId: string
      reason: string
```

| Unresolved hard `requires` | Action |
|----------------------------|--------|
| In Registry | Link · mark fulfilled |
| Not in Registry | Add to `missingAssets` |
| In another layer plan | Cross-layer dependency edge |

---

## DAG Construction Algorithm

```
1. Load workspace layer template
2. Apply Blueprint Engine™ layer overrides
3. Add edges from canonical rules (above)
4. Per layer: run Registry search → attach asset edges
5. Detect cycles → reject plan if found
6. Topological sort → generationOrder stages
7. Mark parallelizable stages (no inter-stage deps)
```

---

## Cross-Layer Regeneration

Regenerate **Lighting™ only**:

```yaml
PartialPlan:
  scope: single-layer
  targetLayerId: lighting-systems
  preservedLayers: all-except-target
  dependencies:
    - environment-shell: locked    # must not regen
    - hero-landmark-story-table: locked
  newPlan:
    layerManifest: [lighting-systems LayerPlan only]
    generationOrder: [single stage]
```

Upstream layers **locked** — not included in generation queue.

---

## Dependency Visualization (Internal)

Studio Alpha™ operators may view:

```
environment-shell
    ├── architecture-structure
    │       └── hero-landmark-story-table
    ├── lighting-systems
    │       ├── atmosphere-editorial
    │       │       └── particles-ambient
    │       └── materials-surface
    ├── furniture-story-table
    └── camera-orbiting-strategy
```

Founder sees Orb summary — not graph UI in v1.

---

## Blockers

```yaml
PlanBlocker:
  blockerId: string
  type: unresolved-dependency | circular-dep | missing-required | blueprint-conflict
  layerId: string | null
  message: string
  resolution: string
```

`planStatus: blocked` until all `required` blockers cleared.

---

_Dependency Resolution™ — know what must exist before anything moves._
