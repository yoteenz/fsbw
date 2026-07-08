# Scene Analytics™

**Module:** `studio-alpha.production-dashboard.v1.scenes`  
**Status:** Scene Stack™ layer production visibility

---

## Purpose

Every scene in Studio World™ is assembled from [Scene Stack™](../../studio-os/scene-stack/README.md) layers — not single images.

Scene Analytics™ tracks each layer's production state · cost · reuse · approval · golden version.

---

## Scene Layer Inventory

Every scene contains:

| Layer | Scene Stack™ ID |
|-------|-----------------|
| **Environment Shell™** | `environment-shell` |
| **Hero Landmark™** | `signature-landmark` |
| **Furniture™** | `furniture` |
| **Lighting™** | `lighting-systems` |
| **Atmosphere™** | `atmospheric` |
| **Surface Detail™** | `surface-materials` |
| **Runtime FX™** | `runtime-effects` |
| **Interaction™** | `interaction-layer` |
| **Personalization™** | `founder-personalization` |

---

## Layer Analytics Schema

```yaml
SceneLayerAnalytics:
  sceneId: string
  sceneLabel: string
  departmentId: string
  layerId: string
  layerLabel: string
  status:
    - not_started
    - estimated
    - queued
    - generating
    - pending_approval
    - approved
    - golden
    - deprecated
  costUsd: number                   # cumulative generation cost for layer
  generationCount: number           # total generation attempts
  reuseCount: number                # times layer reused without regen
  approvalStatus: pending | approved | rejected | revision
  goldenVersionId: string | null
  goldenVersionLabel: string | null
  assignedBlueprintId: string | null
  lastGeneratedAt: ISO8601 | null
```

---

## Layer Panel Layout

```
Scene: Story Table™ (Creative Direction Studio™)
────────────────────────────────────────────────────────
Layer              Status      Cost    Gen  Reuse  Approval
Environment Shell  Golden      $0.42   2    14     Approved
Hero Landmark      Approved    $0.85   3    8      Approved
Furniture          Approved    $0.31   1    22     Approved
Lighting           Generating  $0.18   4    31     Pending
Atmosphere         Golden      $0.12   1    45     Approved
Surface Detail     Approved    $0.24   2    18     Approved
Runtime FX         Not Started —       —    —      —
Interaction        Approved    $0.00   0    —      Approved (Cursor)
Personalization    Waiting     $0.08   1    0      Pending
```

---

## Golden Version

**Golden Version** = approved layer version designated as canonical for:

- Department runtime assembly
- Blueprint inheritance
- Marketplace reference scenes

Only one golden version per layer at a time. Prior versions archived — never deleted.

---

## Cost Attribution

Layer `costUsd` = sum of all generation jobs for that layer including retries.

Reuse events add to `reuseCount` but do not increment generation cost when zero-cost reuse path taken.

---

## Scene Completion

```
sceneCompletion = approvedRequiredLayers / requiredLayersForGoldenBuild

Required layers (minimum): environment-shell · signature-landmark · lighting-systems
```

Aligns with [Scene Stack™ golden-build-pipeline](../../studio-os/scene-stack/golden-build-pipeline.md).

---

_Scene Analytics™ — layered environments, layer accountability._
