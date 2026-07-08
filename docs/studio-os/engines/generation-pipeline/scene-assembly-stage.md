# Scene Assembly Stage™

**Engine Module:** `studio.generation-pipeline.v1.scene-assembly`  
**Status:** Compositing — Stage 11

---

## Purpose

Scene Assembly™ composites **all approved layers** into a publishable workspace scene.

Runs after Founder Approval™ on all required layers.

---

## Input

```yaml
SceneAssemblyInput:
  pipelineRunId: uuid
  workspaceScene: string
  departmentId: string
  approvedLayers:
    - layerId: string
      artifactRef: string
      registryId: string
      blendOrder: number
  sceneBlueprintId: uuid
```

---

## Assembly Process

```
Collect approved layer artifacts
         ↓
Scene Stack™ compositor (blend order)
         ↓
Apply Camera™ rig metadata
         ↓
Wire Runtime FX™ (Cursor)
         ↓
Wire Interaction Layer™ (Cursor)
         ↓
AssembledWorkspaceScene
         ↓
Founder Approve assembly (optional gate)
         ↓
Registry Update™
```

---

## Blend Order

Aligns with layer generation order:

| blendOrder | Layer |
|------------|-------|
| 1 | Environment™ |
| 2 | Architecture™ |
| 3 | Furniture™ |
| 4 | Hero Objects™ |
| 5 | Materials™ |
| 6 | Lighting™ |
| 7 | Atmosphere™ |
| 8 | Particles™ |
| 9 | Interactive Objects™ |
| 10 | Runtime FX™ |

Lighting often composites as adjustment pass over materials — Scene Stack™ compositor owns blend logic.

---

## Output

```yaml
AssembledWorkspaceScene:
  assemblyId: uuid
  workspaceScene: string
  status: assembled | approved | published
  compositorVersion: string
  layerRefs: LayerAssemblyRef[]
  previewRef: string
  goldenBuildContribution: number
```

---

## Partial Assembly (Incremental)

As each layer approved, compositor may show **progressive preview**:

```
Environment approved → shell visible
+ Lighting approved → lit shell
+ Furniture approved → furnished room
...
```

Full assembly required before Workspace Published™.

---

## Founder Controls

| Action | Effect |
|--------|--------|
| **Approve** | Proceed to Registry Update™ |
| **Reject** | Return specific layer to Regenerate |
| **Regenerate** | Target layer · reassemble |
| **Reuse Existing** | Swap layer registry ref · reassemble |

---

## Sub-Engines

| Engine | Role |
|--------|------|
| [Scene Stack™](../../scene-stack/README.md) | Compositor · blend law |
| Department Runtime™ | Consumes assembled scene |
| Cursor | Runtime FX™ · Interaction wiring |

---

## Registry Update™ Handoff

Assembly complete triggers auto-register for any net-new layer artifacts not yet in Registry.

---

_Scene Assembly Stage™ — layers become a room._
