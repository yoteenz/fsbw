# Dependency Resolution — Studio Asset Compiler™

**Engine Module:** `studio.asset-compiler.v1.dependency-resolution`  
**Status:** Graph construction · queue ordering · stage gates

---

## Purpose

Automatically build and resolve the **asset dependency graph** from Department Definition — no human ordering spreadsheets.

---

## Input Sources

| Source | Provides |
|--------|----------|
| `asset-manifest.json` | Per-asset `dependencies[]` |
| `asset-blueprint.md` | Implicit edges (orb → pedestal) |
| `environment-blueprint.md` | Environment task DAG |
| `scene-assembly-blueprint.md` | Placement stack order |
| SDK object class rules | Universal dependencies (orb-pedestal before orb) |

---

## Graph Schema

```json
{
  "$schema": "studio.asset-compiler.v1/dependency-graph.json",
  "packageId": "pkg-creative-direction-golden-v1",
  "nodes": [
    { "id": "env-shell-cds", "stage": 2, "folder": "02_architecture/" },
    { "id": "wall-mood-cds", "stage": 5, "folder": "04_objects/" }
  ],
  "edges": [
    { "from": "env-shell-cds", "to": "wall-mood-cds", "type": "hard" },
    { "from": "lighting-rig-cds", "to": "wall-mood-cds", "type": "hard" },
    { "from": "pedestal-orb-cds", "to": "orb-cds", "type": "stack" }
  ],
  "topologicalOrder": ["env-shell-cds", "env-floor-cds", "…", "seed-library-cds"],
  "stageGates": [
    { "stage": 1, "requires": [] },
    { "stage": 2, "requires": [1] },
    { "stage": 5, "requires": [2, 3, 4] }
  ]
}
```

Output: `14_metadata/dependencies.json`

---

## Edge Types

| Type | Meaning |
|------|---------|
| `hard` | Asset B cannot generate until Asset A cooked |
| `soft` | Runtime prefers A first; generation can proceed with placeholder |
| `stack` | Physical stack order (pedestal → orb) |
| `genome` | B inherits shader slots from A |
| `ceremony` | Ceremony asset requires audio + target object |

---

## Resolution Algorithm

```
1. Ingest all dependency declarations from manifest + blueprints
2. Add universal SDK edges (portal requires shell, etc.)
3. Detect cycles → compile error with build-report path
4. Topological sort → generation queue order
5. Map nodes to pipeline stages (generation-pipeline.md)
6. Validate stage gates (no forward references across stages)
7. Mark reused assets from Design Registry → prune subgraph
8. Write dependencies.json + generation-queue.json
```

---

## Creative Direction Studio™ Critical Path

```
env-shell-cds
  → env-floor-cds, env-ceiling-cds, env-alcove-cds, env-window-cds
  → lighting-rig-cds
  → table-timeline-cds
  → wall-mood-cds, wall-brief-cds, observatory-cds
  → pedestal-orb-cds → orb-cds
  → ceremony-approval-cds (requires table-timeline-cds + audio-ceremony-cds)
```

**Longest path:** shell → lighting → mood wall → validation ≈ 5 stages minimum before hero object ready.

---

## Conflict Detection

| Conflict | Resolution |
|----------|------------|
| Circular dependency | Compile abort |
| Cross-stage violation | Reassign stage or error |
| Missing dependency node | build-report `missing` section |
| Duplicate asset ID | Merge metadata · warn |
| Orphan asset (no path to hero) | Warn · allow if decor optional |

---

## Reuse Short-Circuit

When Design Registry™ provides cooked asset:

```json
{
  "assetId": "orb-cds",
  "reusedFrom": "registry:orb-universal-v2",
  "dependenciesResolved": true,
  "skipGeneration": true,
  "linkPath": "04_objects/orb-cds.glb"
}
```

Dependency descendants still resolve — reused node marked `cooked`.

---

## Runtime Dependency Manifest

Subset exported to `15_runtime/dependency-manifest.json` for Department Runtime load order (matches scene-assembly `worldAssemblyOrder`).

See [runtime-manifest.md](./runtime-manifest.md).
