# Environment Schema — `environment-blueprint.json`

**Schema ID:** `studio.department-generator.v1.environment-blueprint`  
**Output file:** `environment-blueprint.json`  
**Status:** Environment Blueprint specification  
**Engine source:** [04 Environment Compiler](../engine/department-generator/04_ENVIRONMENT_COMPILER.md)

---

## Purpose

The **Environment Blueprint** decomposes every department room into discrete, independently generatable architectural tasks. No department relies on a single flattened background image. Each task compiles to a prompt file in `prompts/` and a generation task in `handoff/generation-instruction-set.json`.

---

## Design Law

> Never one prompt for a room. Always discrete architectural tasks — floor · walls · windows · architecture · ceiling · columns · glass · lighting · atmosphere · furniture layout · navigation · camera · scene composition.

---

## Environment Blueprint Schema

```json
{
  "$schema": "studio.department-generator.v1/environment-blueprint.json",
  "departmentId": "creative-direction",
  "version": "1.0.0",
  "layoutTemplate": "stage",
  "roomDnaRef": "room-dna.json",

  "spatial": {
    "envelope": {
      "widthM": 18.0,
      "depthM": 12.0,
      "heroHeightM": 6.5,
      "workHeightM": 3.2,
      "aspectRatio": "3:2"
    },
    "zones": [
      { "id": "brief-wall", "bounds": { "x": 0, "y": 0, "w": 4, "h": 12 } },
      { "id": "mood-wall", "bounds": { "x": 4, "y": 0, "w": 6, "h": 12 }, "hero": true },
      { "id": "timeline-table", "bounds": { "x": 10, "y": 4, "w": 4, "h": 4 } },
      { "id": "orb-command", "bounds": { "x": 14, "y": 8, "w": 4, "h": 4 } }
    ],
    "navigationGraph": {
      "entryZoneId": "arrival-threshold",
      "paths": [
        { "from": "arrival-threshold", "to": "mood-wall", "ceremony": "arrival" },
        { "from": "mood-wall", "to": "timeline-table", "type": "walk" }
      ]
    }
  },

  "tasks": [
    {
      "id": "env-architecture",
      "category": "architecture",
      "promptRef": "prompts/architecture.md",
      "purpose": "Shell geometry · proportions · envelope",
      "stageOrder": 1,
      "outputSpec": {
        "assetId": "environment/shell",
        "format": "glb",
        "genomeSlots": ["materialLanguage", "editorialDirection"]
      },
      "dependencies": []
    },
    {
      "id": "env-floor",
      "category": "floor",
      "promptRef": "prompts/environment.md#floor",
      "purpose": "Floor material · reflection · grain direction",
      "stageOrder": 2,
      "outputSpec": {
        "assetId": "materials/floor",
        "format": "shader",
        "genomeSlots": ["materialLanguage"]
      },
      "dependencies": ["env-architecture"]
    },
    {
      "id": "env-walls",
      "category": "walls",
      "promptRef": "prompts/architecture.md#walls",
      "purpose": "Wall planes · alcoves · treatments",
      "stageOrder": 1,
      "outputSpec": {
        "assetId": "environment/interior",
        "format": "glb",
        "genomeSlots": ["materialLanguage", "editorialDirection"]
      },
      "dependencies": []
    },
    {
      "id": "env-windows",
      "category": "windows",
      "promptRef": "prompts/architecture.md#windows",
      "purpose": "Glass wall · frames · exterior connection",
      "stageOrder": 3,
      "outputSpec": {
        "assetId": "environment/windows",
        "format": "glb",
        "genomeSlots": ["lightingStyle"]
      },
      "dependencies": ["env-architecture", "env-walls"]
    },
    {
      "id": "env-ceiling",
      "category": "ceiling",
      "promptRef": "prompts/architecture.md#ceiling",
      "purpose": "Coffers · sky panels · accent tracks",
      "stageOrder": 2,
      "outputSpec": {
        "assetId": "environment/ceiling",
        "format": "glb",
        "genomeSlots": ["lightingStyle"]
      },
      "dependencies": ["env-architecture"]
    },
    {
      "id": "env-columns",
      "category": "columns",
      "promptRef": "prompts/architecture.md#columns",
      "purpose": "Structural columns · glass mullions",
      "stageOrder": 2,
      "outputSpec": {
        "assetId": "environment/columns",
        "format": "glb",
        "genomeSlots": ["materialLanguage"]
      },
      "dependencies": ["env-architecture"],
      "optional": true
    },
    {
      "id": "env-glass",
      "category": "glass",
      "promptRef": "prompts/materials.md#glass",
      "purpose": "Partitions · balustrades · display glass",
      "stageOrder": 3,
      "outputSpec": {
        "assetId": "environment/glass",
        "format": "glb",
        "genomeSlots": ["materialLanguage"]
      },
      "dependencies": ["env-windows"]
    },
    {
      "id": "env-lighting",
      "category": "lighting",
      "promptRef": "prompts/lighting.md",
      "purpose": "Three-point editorial rig · accent tracks",
      "stageOrder": 4,
      "outputSpec": {
        "assetId": "lighting/rig",
        "format": "json",
        "genomeSlots": ["lightingStyle"]
      },
      "dependencies": ["env-ceiling", "env-floor"]
    },
    {
      "id": "env-atmosphere",
      "category": "ambient-atmosphere",
      "promptRef": "prompts/vfx.md",
      "purpose": "Particle fields · fog · depth haze",
      "stageOrder": 6,
      "outputSpec": {
        "assetId": "particles/ambient",
        "format": "json",
        "genomeSlots": []
      },
      "dependencies": ["env-lighting"]
    },
    {
      "id": "env-furniture-layout",
      "category": "furniture-layout",
      "promptRef": "prompts/furniture.md#layout",
      "purpose": "Zone furniture placement rules — not individual meshes",
      "stageOrder": 5,
      "outputSpec": {
        "assetId": "layout/furniture",
        "format": "json",
        "genomeSlots": ["editorialDirection"]
      },
      "dependencies": ["env-floor", "env-walls"]
    },
    {
      "id": "env-navigation",
      "category": "navigation",
      "promptRef": "prompts/architecture.md#navigation",
      "purpose": "Walk paths · portal positions · arrival threshold",
      "stageOrder": 7,
      "outputSpec": {
        "assetId": "navigation/graph",
        "format": "json",
        "genomeSlots": []
      },
      "dependencies": ["env-furniture-layout"]
    },
    {
      "id": "env-camera",
      "category": "camera",
      "promptRef": "prompts/camera.md",
      "purpose": "Arrival · hero · inspect · ceremony positions",
      "stageOrder": 7,
      "outputSpec": {
        "assetId": "camera/positions",
        "format": "json",
        "genomeSlots": []
      },
      "dependencies": ["env-navigation"]
    },
    {
      "id": "env-composition",
      "category": "scene-composition",
      "promptRef": "prompts/environment.md#composition",
      "purpose": "Framing rules · negative space · hero sightlines",
      "stageOrder": 7,
      "outputSpec": {
        "assetId": "composition/manifest",
        "format": "json",
        "genomeSlots": ["editorialDirection"]
      },
      "dependencies": ["env-camera", "env-furniture-layout"]
    }
  ],

  "dependencyGraph": {
    "stages": [
      { "order": 1, "taskIds": ["env-architecture", "env-walls"] },
      { "order": 2, "taskIds": ["env-floor", "env-ceiling", "env-columns"] },
      { "order": 3, "taskIds": ["env-windows", "env-glass"] },
      { "order": 4, "taskIds": ["env-lighting"] },
      { "order": 5, "taskIds": ["env-furniture-layout"] },
      { "order": 6, "taskIds": ["env-atmosphere"] },
      { "order": 7, "taskIds": ["env-navigation", "env-camera", "env-composition"] }
    ]
  },

  "genomeInjection": {
    "slots": ["materialLanguage", "lightingStyle", "editorialDirection"],
    "roomDnaModifiers": true
  },

  "negativePromptUniversal": "dashboard, card grid, sidebar, white void, stock photo banner, UI chrome, flattened background plate"
}
```

---

## Task Category Registry

| Category | Prompt File | Generates |
|----------|-------------|-----------|
| `architecture` | `architecture.md` | Shell envelope · proportions |
| `floor` | `environment.md` | Floor shader · grain · reflection |
| `walls` | `architecture.md` | Interior wall planes |
| `windows` | `architecture.md` | Glass walls · frames |
| `ceiling` | `architecture.md` | Ceiling geometry · coffer detail |
| `columns` | `architecture.md` | Structural elements |
| `glass` | `materials.md` | Partitions · balustrades |
| `lighting` | `lighting.md` | Rig definition · key/fill/rim |
| `ambient-atmosphere` | `vfx.md` | Particles · haze · depth |
| `furniture-layout` | `furniture.md` | Placement rules (objects in `assets.json`) |
| `navigation` | `architecture.md` | Walk graph · portals |
| `camera` | `camera.md` | Positions · transitions |
| `scene-composition` | `environment.md` | Framing · sightlines |

---

## Prompt Stack (Per Task)

Each task compiles a **prompt stack** consumed by [fal-prompt-spec.md](./fal-prompt-spec.md):

```yaml
PromptStack:
  base: string              # DNA atmosphereCharacter + layoutTemplate
  architecture: string      # spatial rules from envelope + zones
  roomDnaModifiers: string  # from room-dna.json promptModifiers
  genomeModifiers:
    materialLanguage: "{{genome.materialLanguage}}"
    lightingStyle: "{{genome.lightingStyle}}"
    editorialDirection: "{{genome.editorialDirection}}"
  industryModifiers: string[]
  negativePrompt: string
```

---

## Layout Template Emphasis

| Template | Environment Compiler Emphasis |
|----------|------------------------------|
| **Stage** | Double-height hero · dominant back wall · center command surface |
| **Workshop** | Uniform height · sequential surfaces · production flow |
| **Gallery** | Comparison walls · browsing depth · portrait lighting |
| **Executive** | Formal seating · conference geometry · restrained decor |
| **Laboratory** | Work surfaces · instrument zones · clinical lighting |

DNA selects template. Blueprint never overrides topology.

---

## Relationship to Other Artifacts

| Artifact | Relationship |
|----------|--------------|
| `room-dna.json` | Injects aesthetic modifiers into every task prompt |
| `prompts/*.md` | Human- and machine-readable prompt source |
| `assets.json` | Individual furniture/decor objects reference layout zones |
| `assembly-blueprint.json` | Consumes spatial + camera + navigation for runtime |
| `handoff/generation-instruction-set.json` | Each task → `GenerationTask` per engine doc 11 |

---

## Anti-Patterns

| Forbidden | Canonical |
|-----------|-----------|
| `background.png` in blueprint | Discrete `tasks[]` with `outputSpec` |
| Single `roomPrompt` field | Per-category `promptRef` |
| Hardcoded brand hex colors | `genomeInjection.slots` |
| Manual object positions in blueprint | `furniture-layout` rules + `assets.json` zone bindings |
