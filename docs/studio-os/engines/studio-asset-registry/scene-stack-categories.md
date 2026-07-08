# Scene Stack Categories™

**Engine Module:** `studio.asset-registry.v1.scene-stack-categories`  
**Status:** Supported asset categories — Creative Intelligence / Scene Stack alignment

---

## Purpose

Canonical **supported asset categories** for generated environments — aligned with [Scene Stack™](../../scene-stack/README.md) and [Creative Intelligence Engine™](../../creative-intelligence-engine/asset-first-layers.md).

Every Registry Item of these categories participates in remember-first reuse.

---

## Supported Categories

| Category | Scene Stack™ layer | Registry `category` | Reuse priority |
|----------|-------------------|---------------------|----------------|
| **Environment Shell™** | `environment-shell` | `environment` | High |
| **Lighting™** | `lighting-systems` | `lighting` | High |
| **Atmosphere™** | `atmospheric` | `vfx` · `particle` | High |
| **Architecture™** | `environment-shell` (structure) | `architecture` | High |
| **Furniture™** | `furniture` | `furniture` | High |
| **Hero Objects™** | `signature-landmark` | `prop` · `display` | High |
| **Interactive Objects™** | `interaction-layer` | `interaction` | Medium |
| **Materials™** | `surface-materials` | `material` | High |
| **Particles™** | `atmospheric` (pass) | `particle` | Medium |
| **Animations™** | `ambient-motion` | `animation` | Medium |
| **Runtime FX™** | `runtime-effects` | `vfx` | Medium |
| **Audio™** | parallel manifest | `audio` | Medium |
| **UI Components™** | `interaction-layer` | `ui` · `acrylic` | Medium |
| **Textures™** | `surface-materials` | `material` | High |
| **Icons™** | `interaction-layer` | `icon` | Low |

---

## Category → Workspace Context

Generated assets always record:

```yaml
context:
  departmentId: creative-direction
  workspaceSceneId: mood-wall | story-table | pipeline | ...
  sceneId: string | null
  layerId: environment-shell | lighting-systems | ...
  generationPackId: string | null
```

Enables query: *"What lighting assets exist for Mood Wall™?"*

---

## Cross-Category Reuse

| Example | Reuse path |
|---------|------------|
| Editorial Lighting™ from Story Table™ → Mood Wall™ | Same `reuseCategory`: `lighting-rig-editorial` |
| Luxury marble material → Finance department | `material-marble-luxury` reuse |
| Environment shell → new department | Blueprint + compatibility check |

[Asset Intelligence Compatibility Engine™](../../asset-intelligence-engine/compatibility-engine.md) scores cross-context reuse.

---

## Extending Categories

New categories register via:

1. `registry:category-{id}-v1` meta-item
2. Scene Stack layer mapping (if generatable)
3. Reuse category definition in [category-system.md](./category-system.md)

No schema migration required.

---

## CDS Seed Categories (Pilot)

First golden Registry entries from Creative Direction Studio™:

| Workspace | Primary categories |
|-----------|-------------------|
| Story Table™ | Hero Objects™ · Lighting™ · Furniture™ |
| Mood Wall™ | Hero Objects™ · Materials™ · Lighting™ |
| Pipeline™ | UI Components™ · Interactive Objects™ |
| Library™ | Architecture™ · Materials™ · Icons™ |
| Notes Desk™ | Furniture™ · Interactive Objects™ |
| Arrival™ | Environment Shell™ · Atmosphere™ · Architecture™ |

---

_Scene Stack Categories™ — layered assets, unified taxonomy._
