# Asset Schema — Blueprints & `assets.json`

**Schema ID:** `studio.department-generator.v1.asset-manifest`  
**Output files:** `assets.json` · `assets/{assetId}.blueprint.json`  
**Status:** Per-object Asset Blueprint and Asset Manifest specification  
**Engine source:** [05 Object Compiler](../engine/department-generator/05_OBJECT_COMPILER.md)

---

## Purpose

Every object in a department is its own generatable asset — desk · chair · orb · glass panel · floating monitor · hologram projector · bookshelf · plants · door · floor lamp · ceiling light · conference table · pedestal · floating acrylic menu · interactive wall.

Nothing is baked into the room shell. Each asset receives a **blueprint** (design-time) and an entry in **assets.json** (manifest).

---

## Design Law

> Think AAA game engine. Modular assets with independent prompts · materials · animations · interactions · reuse categories. The room is assembled, not painted.

---

## Asset Blueprint Schema

**File:** `assets/{assetId}.blueprint.json`

```json
{
  "$schema": "studio.department-generator.v1/asset-blueprint.json",
  "assetId": "wall-mood-cds",
  "departmentId": "creative-direction",
  "version": "1.0.0",

  "identity": {
    "name": "Mood Wall",
    "purpose": "Hero comparison surface — pin · cluster · approve creative direction",
    "objectClass": "mood-wall",
    "reuseCategory": "interactive-wall-hero"
  },

  "physical": {
    "dimensions": { "widthM": 5.5, "heightM": 4.2, "depthM": 0.15 },
    "material": "frosted-glass-over-brushed-brass-frame",
    "placement": {
      "zoneId": "mood-wall",
      "anchor": "wall-center",
      "offset": { "x": 0, "y": 1.2, "z": 0 }
    }
  },

  "generation": {
    "falPromptRef": "prompts/furniture.md#mood-wall",
    "promptStack": {
      "base": "Editorial mood wall, luxury creative atelier, pin-ready surface",
      "physicalForm": "5.5m wide floor-to-ceiling frosted glass panel, slim brass frame",
      "interactionAffordances": "Visible pin rails, cluster zones, comparison split lines",
      "genomeModifiers": ["materialLanguage", "editorialDirection"],
      "negativePrompt": "whiteboard, cork board, SaaS kanban, sticky note grid"
    },
    "providerHint": {
      "preferred": ["fal", "openai"],
      "assetType": "mesh"
    },
    "outputSpec": {
      "format": "glb",
      "genomeSlots": ["materialLanguage"],
      "replaceable": true
    }
  },

  "behavior": {
    "animationBehavior": "ambient-glow-on-hover",
    "interactionBehavior": "pin-cluster-compare-approve",
    "states": ["empty", "pinned", "clustered", "comparing", "approved"]
  },

  "dependencies": {
    "requires": ["environment/interior", "lighting/rig"],
    "blocks": ["table-timeline-cds"]
  },

  "recommendedReuse": {
    "departments": ["creative-direction", "marketing", "review"],
    "marketplaceTag": "interactive-wall-hero"
  }
}
```

---

## Asset Manifest Schema

**File:** `assets.json`

```json
{
  "$schema": "studio.department-generator.v1/assets.json",
  "departmentId": "creative-direction",
  "version": "1.0.0",
  "count": 45,
  "budgetMB": 120,

  "categories": {
    "universal": ["orb", "orb-pedestal", "portal-entry", "portal-exit", "lighting-rig", "particles-ambient"],
    "furniture": ["desk", "chair", "conference-table", "pedestal", "bookshelf"],
    "intelligence": ["orb", "floating-monitor", "hologram-projector", "interactive-wall"],
    "decor": ["plants", "floor-lamp", "ceiling-light", "glass-panel"],
    "navigation": ["door", "portal-entry", "portal-exit"]
  },

  "assets": [
    {
      "assetId": "wall-mood-cds",
      "category": "intelligence",
      "objectClass": "mood-wall",
      "blueprintRef": "assets/wall-mood-cds.blueprint.json",
      "generatorPrompt": "Editorial mood wall, luxury creative atelier, pin-ready frosted glass surface",
      "dimensions": { "widthM": 5.5, "heightM": 4.2, "depthM": 0.15 },
      "material": "frosted-glass-over-brushed-brass-frame",
      "interactiveState": "pin-cluster-compare-approve",
      "dependencies": ["environment/interior", "lighting/rig"],
      "recommendedReuse": ["creative-direction", "marketing", "review"],
      "zoneId": "mood-wall",
      "stageOrder": 6
    },
    {
      "assetId": "orb-pedestal-cds",
      "category": "universal",
      "objectClass": "orb-pedestal",
      "blueprintRef": "assets/orb-pedestal-cds.blueprint.json",
      "generatorPrompt": "Sculptural orb pedestal, brushed brass, editorial atelier register",
      "dimensions": { "widthM": 0.8, "heightM": 1.1, "depthM": 0.8 },
      "material": "brushed-brass",
      "interactiveState": "speak-touch",
      "dependencies": ["environment/floor"],
      "recommendedReuse": ["*"],
      "zoneId": "orb-command",
      "stageOrder": 6
    },
    {
      "assetId": "desk-editorial-cds",
      "category": "furniture",
      "objectClass": "timeline-table",
      "blueprintRef": "assets/desk-editorial-cds.blueprint.json",
      "generatorPrompt": "Low-profile editorial timeline table, walnut top, glass inset track",
      "dimensions": { "widthM": 3.2, "heightM": 0.72, "depthM": 1.4 },
      "material": "walnut-glass-inset",
      "interactiveState": "scrub-branch-approve",
      "dependencies": ["environment/floor", "lighting/rig"],
      "recommendedReuse": ["creative-direction", "production", "publishing"],
      "zoneId": "timeline-table",
      "stageOrder": 5
    }
  ],

  "inventorySummary": {
    "byCategory": { "universal": 6, "furniture": 8, "intelligence": 12, "decor": 14, "navigation": 5 },
    "byStage": {
      "5": "furniture",
      "6": "intelligence + universal",
      "7": "decor + navigation"
    }
  }
}
```

---

## Field Reference — `assets.json` Entry

| Field | Required | Description |
|-------|----------|-------------|
| `assetId` | ✓ | Canonical asset identifier |
| `category` | ✓ | `universal` · `furniture` · `intelligence` · `decor` · `navigation` |
| `objectClass` | ✓ | SDK object class ID |
| `blueprintRef` | ✓ | Path to per-asset blueprint |
| `generatorPrompt` | ✓ | Compiled one-line FAL prompt summary |
| `dimensions` | ✓ | Physical bounds in meters |
| `material` | ✓ | Primary material token |
| `interactiveState` | ✓ | Primary interaction behavior contract |
| `dependencies` | ✓ | Asset IDs or environment paths required first |
| `recommendedReuse` | ✓ | Department types or `*` for universal |
| `zoneId` | ✓ | Spatial zone binding |
| `stageOrder` | ✓ | Generation pipeline stage (matches engine 11) |

---

## Reuse Category Registry

| Reuse Category | Object Classes | Cross-Department |
|----------------|----------------|------------------|
| `orb-universal` | orb · orb-pedestal | All departments |
| `interactive-wall-hero` | mood-wall · interactive-wall | Creative · Marketing · Review |
| `timeline-surface` | timeline-table · glass-table | Creative · Production · Publishing |
| `command-console` | command-console · floating-monitor | Production · Executive |
| `reference-shelf` | asset-shelf · bookshelf | Discovery · Education |
| `portal-navigation` | portal-entry · portal-exit · door | All departments |
| `ambient-decor` | plants · floor-lamp · ceiling-light | All departments |

Marketplace exports tag assets by `reuseCategory` for cross-industry reuse.

---

## Object Class → Department Mapping

Derived from engine Object Compiler registry:

| Object Class | Example Asset ID | Typical Departments |
|--------------|------------------|---------------------|
| `mood-wall` | `wall-mood-{dept}` | creative-direction · marketing |
| `interactive-wall` | `wall-brief-{dept}` | creative-direction · story |
| `timeline-table` | `table-timeline-{dept}` | creative-direction · production |
| `glass-table` | `table-sandbox-{dept}` | creative-direction · review |
| `observatory` | `observatory-{dept}` | creative-direction · executive-hq |
| `orb` | `orb-{dept}` | All |
| `floating-monitor` | `monitor-float-{dept}` | production · executive-hq |
| `hologram-projector` | `hologram-{dept}` | executive-hq · innovation |

---

## Generation Stage Order

Matches [Asset Compiler Handoff](../engine/department-generator/11_ASSET_COMPILER_HANDOFF.md):

| Stage | Asset Categories |
|-------|------------------|
| 1–4 | Environment (not in `assets.json`) |
| 5 | Furniture — desk · chair · table · pedestal · bookshelf |
| 6 | Intelligence — orb · walls · monitors · hologram |
| 7 | Decor + navigation — plants · lamps · doors · portals |

---

## Relationship to Other Artifacts

| Artifact | Relationship |
|----------|--------------|
| `environment-blueprint.json` | `furniture-layout` defines zones; assets bind to `zoneId` |
| `interactions.json` | Per-asset verb bindings reference `assetId` |
| `assembly-blueprint.json` | Placement rules resolve `dimensions` + `placement` |
| `prompts/furniture.md` | Source prompts for furniture + intelligence objects |
| `handoff/generation-instruction-set.json` | Each asset → `GenerationTask` |

---

## Anti-Patterns

| Forbidden | Canonical |
|-----------|-----------|
| Furniture baked into `environment/shell.glb` | Separate `assets/*.blueprint.json` |
| One `props.png` texture atlas | Per-object `generatorPrompt` + cooked GLB |
| Missing `reuseCategory` | Required for Marketplace cross-department reuse |
| Interaction logic in blueprint mesh | `interactiveState` contract → `interactions.json` |
