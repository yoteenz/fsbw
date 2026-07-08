# Assembly Pipeline — Scene Assembly Blueprint

**Schema ID:** `studio.department-generator.v1.assembly-blueprint`  
**Output file:** `assembly-blueprint.json`  
**Status:** Scene Assembly Blueprint — how Cursor and Runtime assemble without manual positioning  
**Engine source:** [12 Runtime Handoff](../engine/department-generator/12_RUNTIME_HANDOFF.md) · [Asset Compiler 09 World Assembly](../engine/asset-compiler/09_WORLD_ASSEMBLY.md)

---

## Purpose

The **Scene Assembly Blueprint** describes how generated assets become a living department — FAL-cooked meshes · Three.js scene graph · camera · lighting · animation · physics · navigation — **without a designer manually positioning every object**.

Think procedural assembly: rules · anchors · zones · dependency order.

---

## Design Law

> Cursor is the runtime engineer. It assembles and wires — it never designs. The blueprint supplies placement rules so every department assembles the same way structurally, with different assets.

---

## Assembly Blueprint Schema

```json
{
  "$schema": "studio.department-generator.v1/assembly-blueprint.json",
  "departmentId": "creative-direction",
  "version": "1.0.0",
  "packageId": "pkg-creative-direction-golden-v1",

  "assemblyMode": "zone-anchor-procedural",

  "inputs": {
    "departmentManifest": "department.json",
    "environmentBlueprint": "environment-blueprint.json",
    "assetManifest": "assets.json",
    "interactionManifest": "interactions.json",
    "roomDna": "room-dna.json",
    "cookedPackage": "DepartmentPackage.zip"
  },

  "worldAssemblyOrder": {
    "stages": [
      { "order": 1, "subsystem": "shell", "assets": ["environment/shell", "environment/interior", "environment/ceiling"] },
      { "order": 2, "subsystem": "surfaces", "assets": ["materials/floor", "environment/windows", "environment/glass"] },
      { "order": 3, "subsystem": "lighting", "assets": ["lighting/rig"], "injectGenome": true },
      { "order": 4, "subsystem": "furniture", "filter": { "stageOrder": 5 } },
      { "order": 5, "subsystem": "intelligence", "filter": { "stageOrder": 6 } },
      { "order": 6, "subsystem": "decor", "filter": { "stageOrder": 7 } },
      { "order": 7, "subsystem": "particles", "assets": ["particles/ambient"] },
      { "order": 8, "subsystem": "portals", "assets": ["portal-entry-cds", "portal-exit-cds"] }
    ]
  },

  "placementRules": {
    "strategy": "zone-anchor",
    "anchors": [
      {
        "zoneId": "mood-wall",
        "wallNormal": { "x": 0, "y": 0, "z": 1 },
        "placementMode": "wall-flush-center",
        "assets": ["wall-mood-cds"],
        "verticalAlign": "floor-to-ceiling-hero"
      },
      {
        "zoneId": "timeline-table",
        "floorAnchor": { "x": 11, "y": 0, "z": 6 },
        "placementMode": "floor-centered",
        "assets": ["desk-editorial-cds"],
        "clearanceM": 1.2
      },
      {
        "zoneId": "orb-command",
        "floorAnchor": { "x": 15, "y": 0, "z": 10 },
        "placementMode": "pedestal-elevated",
        "assets": ["orb-pedestal-cds", "orb-cds"],
        "stackOrder": ["orb-pedestal-cds", "orb-cds"]
      }
    ],
    "autoDistribute": {
      "category": "decor",
      "method": "perimeter-scatter",
      "density": 0.3,
      "excludeZones": ["arrival-threshold", "orb-command"]
    }
  },

  "sceneGraph": {
    "root": "department-root",
    "layers": [
      { "id": "environment", "renderOrder": 0, "children": ["shell", "surfaces", "lighting"] },
      { "id": "furniture", "renderOrder": 1, "children": ["furniture-*"] },
      { "id": "intelligence", "renderOrder": 2, "children": ["wall-*", "orb-*", "monitor-*"] },
      { "id": "decor", "renderOrder": 3, "children": ["decor-*"] },
      { "id": "vfx", "renderOrder": 4, "children": ["particles-*"] },
      { "id": "interaction-colliders", "renderOrder": 5, "invisible": true }
    ]
  },

  "lightingAssembly": {
    "rigRef": "lighting/rig",
    "genomeSlots": ["lightingStyle"],
    "roomDnaWarmth": true,
    "shadows": "soft-editorial",
    "ambientOcclusion": true
  },

  "cameraAssembly": {
    "positionsRef": "camera/positions",
    "defaultPosition": "arrival-threshold",
    "transitions": {
      "arrival": { "from": "arrival-exterior", "to": "arrival-threshold", "durationMs": 5000, "easing": "ceremony-dolly" },
      "focus-object": { "type": "inspect-orbit", "durationMs": 1200 }
    }
  },

  "animationAssembly": {
    "profileRef": "department.json#profiles.animation",
    "ambientLoops": ["particles-ambient-cds", "orb-idle-pulse"],
    "ceremonyBindings": ["creative-direction-arrival", "creative-approval"]
  },

  "physicsAssembly": {
    "enabled": false,
    "navigationOnly": true,
    "walkMeshRef": "navigation/graph",
    "collisionGroups": ["shell", "furniture", "intelligence"]
  },

  "navigationAssembly": {
    "graphRef": "environment-blueprint.json#navigationGraph",
    "avatarMode": "ghost-walk",
    "zoneTriggers": true,
    "arrivalCeremonyRef": "interactions.json#ceremonies.creative-direction-arrival"
  },

  "genomeInjection": {
    "phase": "post-shell-pre-furniture",
    "slots": ["materialLanguage", "lightingStyle", "editorialDirection", "sonicIdentity"],
    "shaderTargets": ["materials/floor", "environment/interior", "lighting/rig"]
  },

  "cursorHandoff": {
    "behaviorContracts": [
      { "id": "mood-wall.pin-reference", "handler": "creativeDirection.pinToMoodWall" },
      { "id": "orb.voice-triage", "handler": "orb.routeVoiceCommand" },
      { "id": "creative-approval.ceremony", "handler": "project.commitCreativeApproval" }
    ],
    "projectStateBindings": [
      { "zoneId": "mood-wall", "stateKey": "creativeDirection.moodBoard" },
      { "zoneId": "timeline-table", "stateKey": "creativeDirection.timeline" }
    ]
  },

  "bootSequence": [
    { "phase": "LOADING", "targetMs": 2000 },
    { "phase": "GENOME_INJECTING", "targetMs": 500 },
    { "phase": "ASSEMBLING", "targetMs": 1000, "follows": "worldAssemblyOrder" },
    { "phase": "HYDRATING", "targetMs": null },
    { "phase": "ARRIVING", "targetMs": 6000, "ceremony": "creative-direction-arrival" },
    { "phase": "ACTIVE", "targetMs": null }
  ],

  "validationChecks": [
    { "id": "no-flattened-background", "rule": "sceneGraph must not contain background-plate layer" },
    { "id": "orb-present", "rule": "intelligence layer must include orb-*" },
    { "id": "hero-object", "rule": "department.json#spatial.heroObjectId must be placed" },
    { "id": "interaction-colliders", "rule": "every interactions.json object has collider" }
  ]
}
```

---

## Placement Strategies

| Strategy | When Used | Rule |
|----------|-----------|------|
| `zone-anchor` | Hero objects · tables · orb | Bind to `zoneId` + anchor vector |
| `wall-flush-center` | Mood walls · interactive walls | Flush to wall normal · center horizontally |
| `floor-centered` | Tables · desks | Center in zone bounds · clearance check |
| `pedestal-elevated` | Orb · hologram | Stack pedestal then intelligence object |
| `perimeter-scatter` | Decor · plants · lamps | Auto-distribute with density slider |
| `ceiling-grid` | Ceiling lights | Grid snap to coffer positions |

No strategy requires manual XYZ entry at assembly time.

---

## Assembly Pipeline Flow

```
DepartmentPackage.zip (cooked assets)
         ↓
┌────────────────────────────────────────┐
│  1. ASSET LOADER                       │
│  Resolve GLB · shaders · audio · JSON  │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  2. GENOME INJECTION                   │
│  Material · lighting · editorial slots │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  3. WORLD ASSEMBLER                    │
│  worldAssemblyOrder · placementRules   │
│  → Three.js scene graph                │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  4. LIGHTING + CAMERA                  │
│  Rig from lighting/rig · positions     │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  5. INTERACTION COLLIDERS              │
│  From interactions.json zones          │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  6. ANIMATION + AUDIO                  │
│  Ambient loops · ceremony bindings     │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  7. NAVIGATION MESH                    │
│  Walk graph · zone triggers            │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  8. CURSOR HANDLER WIRING              │
│  behaviorContracts → project state     │
└────────────────┬───────────────────────┘
                 ↓
         ARRIVAL CEREMONY → ACTIVE
```

---

## Cursor Responsibilities

| Cursor Does | Cursor Does Not |
|-------------|-----------------|
| Wire `behaviorContracts` to project state | Design object positions |
| Connect production signals | Write FAL prompts |
| Handle auth · permissions | Modify meshes |
| Bridge Orb voice to routing | Override assembly order |

---

## Handoff Artifacts

| File | Consumer |
|------|----------|
| `assembly-blueprint.json` | Department Runtime World Assembler |
| `handoff/runtime-assembly-manifest.json` | Runtime boot + subsystem init |
| `handoff/generation-instruction-set.json` | Asset Compiler (pre-cook) |

`assembly-blueprint.json` is the **design-time** assembly spec. Runtime consumes compiled `RuntimeAssemblyManifest` per engine doc 12.

---

## Relationship to Engine

| Concept | Engine location |
|---------|-----------------|
| Boot sequence | `12_RUNTIME_HANDOFF.md` |
| World assembly stages | `asset-compiler/09_WORLD_ASSEMBLY.md` |
| Interaction colliders | `department-runtime/05_INTERACTION_ENGINE.md` |
| Genome injection timing | `10_GENOME_INJECTION.md` |

---

## Anti-Patterns

| Forbidden | Canonical |
|-----------|-----------|
| Designer places objects in Blender per department | `placementRules` + `zone-anchor` |
| Single scene file with merged geometry | Layered `sceneGraph` with modular children |
| Assembly without validation checks | `validationChecks[]` before ACTIVE |
| Cursor repositions furniture at runtime | Blueprint rules are source of truth |
