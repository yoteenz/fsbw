# Runtime Manifest — Studio Asset Compiler™

**Engine Module:** `studio.asset-compiler.v1.runtime-manifest`  
**Output folder:** `15_runtime/`  
**Consumer:** Studio Department Runtime™ + Cursor

---

## Purpose

Compiler generates **runtime assembly contracts** from `scene-assembly-blueprint.md` + `interaction-manifest.json` + expanded asset metadata — Runtime loads without designer placement.

---

## `15_runtime/` Contents

```
15_runtime/
├── runtime-assembly-manifest.json    # Boot · world assembly · subsystems
├── interactions.json                 # Copy/normalize from Definition
├── cursor-handoff.json               # Behavior contracts · project state
├── dependency-manifest.json          # Load order subset
├── genome-hooks.json                 # Shader/audio injection map
├── ai-team-manifest.json             # Concierge bindings
├── ceremonies.json                   # Arrival · approval · departure
├── navigation.json                   # Walk graph · portals
├── camera.json                       # Positions · transitions
└── mobile-adaptation.json            # Mobile/desktop overrides
```

---

## Runtime Assembly Manifest

Compiled from Department Definition `scene-assembly-blueprint.md`:

```json
{
  "$schema": "studio.runtime-assembly-manifest.v1",
  "packageId": "pkg-creative-direction-golden-v1",
  "departmentId": "creative-direction",

  "bootSequence": [
    { "phase": "LOADING", "targetMs": 2000 },
    { "phase": "GENOME_INJECTING", "targetMs": 500 },
    { "phase": "ASSEMBLING", "targetMs": 1000 },
    { "phase": "HYDRATING", "targetMs": null },
    { "phase": "ARRIVING", "targetMs": 6000, "ceremony": "creative-direction-arrival" },
    { "phase": "ACTIVE", "targetMs": null }
  ],

  "worldAssemblyOrder": {
    "stages": [
      { "order": 1, "folder": "02_architecture/", "filter": ["env-shell-cds", "env-ceiling-cds", "env-alcove-cds"] },
      { "order": 2, "folder": "01_environment/", "filter": ["env-floor-cds", "env-window-cds"] },
      { "order": 3, "folder": "08_lighting/", "injectGenome": true },
      { "order": 4, "folder": "03_furniture/" },
      { "order": 5, "folder": "04_objects/", "filter": { "stageOrder": [5, 6] } },
      { "order": 6, "folder": "05_glass/" },
      { "order": 7, "folder": "09_vfx/" },
      { "order": 8, "folder": "02_architecture/", "filter": ["portal-entry-cds", "portal-exit-cds"] }
    ]
  },

  "placementRules": {
    "strategy": "zone-anchor",
    "rulesRef": "scene-assembly-blueprint.md#placement-rules"
  },

  "sceneGraph": {
    "root": "department-root-cds",
    "layers": ["environment", "furniture", "intelligence", "vfx", "navigation", "interaction-colliders"]
  },

  "validationChecks": [
    "no-flattened-background",
    "orb-present",
    "hero-object-placed",
    "sandbox-isolation"
  ]
}
```

---

## Cursor Handoff

```json
{
  "$schema": "studio.asset-compiler.v1/cursor-handoff.json",
  "behaviorContracts": [
    { "id": "mood-wall.pin-reference", "handler": "creativeDirection.pinToMoodWall" },
    { "id": "creative-approval.ceremony", "handler": "project.commitCreativeApproval" },
    { "id": "orb.voice-triage", "handler": "orb.routeVoiceCommand" }
  ],
  "projectStateBindings": [
    { "zoneId": "mood-wall", "stateKey": "project.creativeDirection.moodBoard" },
    { "zoneId": "timeline-table", "stateKey": "project.creativeDirection.timeline" }
  ],
  "productionSignals": [
    { "ceremony": "creative-approval", "signal": "production.unlock.story" }
  ]
}
```

---

## Genome Hooks

```json
{
  "shaderTargets": [
    { "assetId": "env-floor-cds", "slots": ["materialLanguage"] },
    { "assetId": "lighting-rig-cds", "slots": ["lightingStyle"] },
    { "assetId": "orb-cds", "slots": ["voice"] }
  ],
  "audioTargets": [
    { "assetId": "audio-ambient-cds", "slots": ["sonicIdentity", "customerEmotions"] }
  ],
  "injectionPhase": "post-shell-pre-furniture"
}
```

---

## AI Team Manifest

Compiled from `ai-team.md` + `department.json` `aiConcierges`:

```json
{
  "concierges": [
    { "roleId": "creative-director", "zones": ["brief-wall", "timeline-table"], "assetRef": "ai-creative-director-cds" },
    { "roleId": "brand-concierge", "zones": ["observatory"], "assetRef": "ai-brand-concierge-cds" }
  ],
  "orb": { "assetId": "orb-cds", "pedestalId": "pedestal-orb-cds" },
  "approvalGate": "founder-or-creative-director"
}
```

---

## Boundary

| Compiler writes | Runtime executes |
|-----------------|------------------|
| Manifests · paths · contracts | Load GLB · operate room |
| Pre-cook asset slot paths | Replace with cooked assets post-FAL |
| Ceremony definitions | Play sequences |

See [engine/department-generator/12_RUNTIME_HANDOFF.md](../../engine/department-generator/12_RUNTIME_HANDOFF.md) · [engine/department-runtime/](../../engine/department-runtime/README.md).
