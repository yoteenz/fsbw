# Founder Controls™

**Engine Module:** `studio.generation-pipeline.v1.founder-controls`  
**Status:** Universal actions at every stage

---

## Law

> **Every stage supports:** Approve · Reject · Regenerate · Create Variations · Reuse Existing.

Founder never writes prompts. Founder **directs production**.

---

## Five Controls

| Control | ID | Effect |
|---------|-----|--------|
| **Approve** | `approve` | Advance stage · unlock dependents |
| **Reject** | `reject` | Halt · return to planning or cancel job |
| **Regenerate** | `regenerate` | Re-run current layer/stage production |
| **Create Variations** | `create-variation` | Fork · branch · new version line |
| **Reuse Existing** | `reuse-existing` | Attach Registry asset · skip provider |

---

## Approve

```yaml
ApproveAction:
  stage: PipelineStage
  layerId: string | null
  scope: layer | batch | estimate | workspace
  approvedAt: ISO8601
  approvedBy: founder
```

| Stage | Approve meaning |
|-------|-----------------|
| Scene Planner™ | Accept construction plan |
| Pre-Generation Estimate | **Authorize production** — unlock queue |
| Quality Inspector™ | Layer passes validation |
| Founder Approval™ | Layer golden · ready for assembly |
| Scene Assembly™ | Composited scene accepted |

---

## Reject

```yaml
RejectAction:
  stage: PipelineStage
  layerId: string | null
  reason: string | null
  returnTo: scene-planner | missing-assets | estimate | queue-cancel
```

| Stage | Reject effect |
|-------|---------------|
| Scene Planner™ | Revise blueprint |
| Pre-Generation Estimate | Return to Missing Assets™ |
| Generation Queue™ | Cancel in-flight job |
| Quality Inspector™ | Block layer · optional regen |
| Founder Approval™ | Send back to Quality or Regenerate |

---

## Regenerate

```yaml
RegenerateAction:
  layerId: string
  preserveUpstream: true          # default
  preserveDownstream: false       # warn on stale
  newEstimateRequired: boolean    # true if cost changes
  variationOf: string | null      # parent registryId
```

Triggers partial pipeline re-run from Registry Check for target layer only.

Orb: *"Regenerating lighting layer — environment shell preserved."*

---

## Create Variations

```yaml
CreateVariationAction:
  parentRegistryId: string
  layerId: string
  variationIntent: string         # founder natural language
  branchPolicy: preserve-parent | supersede-parent
```

| Path | Behavior |
|------|----------|
| Duplicate & Modify™ | Fork parent · delta generation |
| Generate Completely New™ | Fresh line · no inheritance |
| Style variation | Same structure · new material/lighting |

Creates new `GenerationLineItem` with `explicitVariation: true`.

---

## Reuse Existing

```yaml
ReuseExistingAction:
  layerId: string
  registryId: string
  matchType: exact-match | close-match
  overrideRecommendation: boolean  # founder picked non-default candidate
```

| Effect |
|--------|
| Layer → `reused` status |
| No provider job |
| Savings applied to estimate |
| `usageCount++` on Registry item |
| Dependents unlocked |

**Default recommendation** at Registry Check™ — Pipeline prefers this path.

---

## Stage Availability Matrix

| Stage | Approve | Reject | Regenerate | Variations | Reuse |
|-------|---------|--------|------------|------------|-------|
| Founder Intent™ | — | — | — | ✓ | — |
| Prompt Composer™ | — | — | — | ✓ | ✓ |
| Scene Planner™ | ✓ | ✓ | — | ✓ | ✓ |
| Registry Check™ | — | — | — | ✓ | ✓ |
| Missing Assets™ | — | ✓ | — | ✓ | ✓ |
| Pre-Gen Estimate | ✓ | ✓ | — | ✓ | ✓ |
| Provider Optimizer™ | — | — | — | — | — |
| Generation Queue™ | — | ✓ | ✓ | ✓ | ✓ |
| Quality Inspector™ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Founder Approval™ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Scene Assembly™ | ✓ | ✓ | ✓ | — | ✓ |
| Registry Update™ | — | — | — | — | — |
| Workspace Published™ | — | — | ✓ | ✓ | ✓ |

Post-publish regen re-enters pipeline at target layer.

---

## Founder Control Record

```yaml
FounderControlRecord:
  recordId: uuid
  pipelineRunId: uuid
  stage: PipelineStage
  layerId: string | null
  action: approve | reject | regenerate | create-variation | reuse-existing
  timestamp: ISO8601
  context: object
```

Feeds Learning Loop™ · Founder Taste Genome™.

---

## Orb Narration

| Action | Orb says |
|--------|----------|
| Reuse recommended | *"We already own this — attaching from your library."* |
| Regenerate | *"Regenerating lighting only — shell preserved."* |
| Variation | *"Creating a variation from your editorial rig."* |
| Reject estimate | *"Returning to planning — we can reduce scope."* |

---

_Founder Controls™ — five verbs. Full production authority. Zero prompt writing._
