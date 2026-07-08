# Generation Queue Stage™

**Engine Module:** `studio.generation-pipeline.v1.generation-queue`  
**Status:** Layer job execution — Stage 8

---

## Purpose

Generation Queue™ is Pipeline Stage 8 — executes approved layer jobs via [Generation Manager™](../generation-manager/README.md).

**Prerequisite:** Pre-Generation Estimate approved · Provider Optimizer payloads ready.

---

## Queue Construction

```yaml
PipelineGenerationQueue:
  queueId: uuid
  pipelineRunId: uuid
  sceneBlueprintId: uuid
  estimateId: uuid
  approvedAt: ISO8601

  items: PipelineQueueItem[]
  layerOrder: string[]              # canonical layer sequence
  currentLayerIndex: number
  status: pending | running | paused | complete | failed
```

Built from Scene Blueprint `generationOrder` filtered to non-reused layers only.

---

## PipelineQueueItem

```yaml
PipelineQueueItem:
  itemId: uuid
  layerId: string
  layerCategory: AssetCategory
  position: number
  status:
    pending | queued | generating | complete | failed | cancelled | skipped-reuse

  # Links
  generationLineItemId: uuid
  optimizedPayloadId: uuid
  generationManagerJobId: string | null

  # Reuse skip
  reuseSkipped: boolean
  registryId: string | null

  # Results
  artifactRef: string | null
  qualityReportId: string | null
```

---

## Execution Rules

| Rule | Enforcement |
|------|-------------|
| Layer order | Environment → Lighting → Architecture → Furniture → Hero → Atmosphere → Particles → Runtime FX |
| Dependency lock | No enqueue until prerequisites `approved` |
| Reuse skip | `skipped-reuse` — no provider call |
| One layer failure | Pause queue · offer Regenerate or Reject |
| Parallel groups | Scene Planner parallel stages respected |

---

## Handoff to Generation Manager™

```yaml
ManagerHandoff:
  pipelineQueueItemId: uuid
  optimizedPayload: OptimizedProviderPayload
  pipelineRunId: uuid
  layerId: string
  onComplete: quality-inspector-stage
  onFail: founder-controls.regenerate | reject
```

Generation Manager owns retry · failover · artifact storage — Pipeline owns stage progression.

---

## Progress (Founder-Facing)

| Label | Never show |
|-------|------------|
| *"Producing environment layer…"* | Provider name |
| *"Lighting layer complete — reviewing quality."* | Model slug |
| *"3 of 8 layers complete."* | Token count |

---

## Pause · Resume · Prioritize

Founder controls at queue stage:

| Action | Effect |
|--------|--------|
| **Reject** | Cancel current job |
| **Regenerate** | Cancel · re-enqueue target layer |
| Pause (future) | Hold queue after current job |
| Prioritize layer (future) | Reorder within dependency constraints |

---

## Build Report

Per queue completion:

```yaml
QueueBuildReport:
  queueId: uuid
  layersCompleted: number
  layersReused: number
  layersFailed: number
  totalCostActual: number
  totalTimeActualSeconds: number
  providerUsageActual: ProviderUsageActual
```

Feeds Studio Alpha™ · Registry Update™.

---

_Generation Queue Stage™ — layer jobs in order, reuse skipped, quality next._
