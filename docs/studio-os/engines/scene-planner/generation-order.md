# Generation Order™

**Engine Module:** `studio.scene-planner.v1.generation-order`  
**Status:** Topological scheduling · parallel stages

---

## Law

> Scene Planner™ determines **generation order** — not Generation Manager™.

> Manager executes the order Scene Blueprint™ defines.

---

## Ordering Principles

| Principle | Rule |
|-----------|------|
| **Shell first** | Environment Shell™ always stage 1 |
| **Structure before surface** | Architecture™ · Hero Landmark™ before Materials™ |
| **Light before atmosphere** | Lighting™ before Atmosphere™ · Particles™ |
| **Visual before Cursor** | All provider layers before Runtime FX™ · Interaction |
| **Respect DAG** | No layer before its `requires` prerequisites |
| **Maximize parallelism** | Independent layers in same stage |

---

## Canonical Stage Sequence

```
Stage 1 — Foundation
  Environment Shell™ · Architecture™ · Camera™

Stage 2 — Hero & Structure
  Hero Landmark™ · Furniture™
  (parallel · depends Stage 1)

Stage 3 — Surface & Light
  Lighting™ · Materials™
  (parallel · depends Stage 1)

Stage 4 — Atmosphere & Sound
  Atmosphere™ · Particles™ · Audio™
  (parallel · depends Stage 3)

Stage 5 — Interaction Visual
  Interactive Objects™
  (depends Stage 2 + 3)

Stage 6 — Cursor Runtime
  Runtime FX™ · Interaction Layer™
  (depends Stage 5 approval · no provider)
```

Stages are **skipped** when all layers in stage are `exact-match` reuse.

---

## GenerationStage Schema

```yaml
GenerationStage:
  stageIndex: number
  stageName: foundation | hero | surface-light | atmosphere | interaction | cursor
  layerIds: string[]
  lineItemIds: string[]           # only generatable items
  parallelizable: boolean
  estimatedStageCost: number
  estimatedStageTimeSeconds: number
  dependsOnStages: number[]
  skipIfAllReuse: boolean         # default true
```

---

## Parallel Execution

Layers in same stage with `parallelizable: true` may enqueue concurrently in Generation Manager™:

```yaml
stageIndex: 3
layerIds: [lighting-systems, materials-surface]
parallelizable: true
# Generation Manager may run both jobs simultaneously
```

**Critical path** = longest chain of sequential stages — drives `estimatedGenerationTime.criticalPathSeconds`.

---

## Single-Layer Regeneration Order

Partial plan emits **one stage**:

```yaml
generationOrder:
  - stageIndex: 1
    stageName: regen-lighting
    layerIds: [lighting-systems]
    dependsOnStages: []           # upstream locked — not regenerated
    parallelizable: false
```

Locked layers listed in `preservedLayers` — not in `generationOrder`.

---

## Skip Rules

| Condition | Stage behavior |
|-----------|----------------|
| All layers `exact-match` | Stage skipped entirely |
| Layer `owner: cursor` | Excluded from provider stages · own cursor stage |
| Layer `generatable: false` | Cursor stage only |
| Founder forced reuse all | `generationOrder: []` — attach only |

---

## Handoff to Generation Manager™

```yaml
GenerationScheduleHandoff:
  sceneBlueprintId: uuid
  approvedEstimateId: string
  stages: GenerationStage[]
  lockedLayers: string[]
  totalJobs: number
  parallelJobCap: number          # org policy default 3
```

Generation Manager [dependency-engine](../generation-manager/dependency-engine.md) respects stage boundaries — does not reorder.

---

## Alignment with Scene Stack™

[Scene Stack golden-build-pipeline](../../scene-stack/golden-build-pipeline.md) layer approval order matches Planner stages for CDS pilot.

| Scene Stack layer | Planner stage |
|-------------------|---------------|
| environment-shell | 1 |
| signature-landmark | 2 |
| furniture | 2 |
| lighting-systems | 3 |
| surface-materials | 3 |
| atmospheric | 4 |
| ambient-motion | 4 |
| interaction-layer | 5–6 |
| runtime-effects | 6 |

---

## Anti-Patterns

| Anti-pattern | Why forbidden |
|--------------|---------------|
| Generate full scene in one job | Violates layer isolation |
| Manager invents order | Planner owns schedule |
| Atmosphere before shell | No depth anchor |
| Cursor before visual approval | Unstable hotspot targets |

---

_Generation Order™ — the studio lot schedule before cameras roll._
