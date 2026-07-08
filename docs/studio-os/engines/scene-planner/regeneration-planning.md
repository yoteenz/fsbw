# Regeneration Planning™

**Engine Module:** `studio.scene-planner.v1.regeneration`  
**Status:** Per-layer regen without full scene rebuild

---

## Law

> **Every layer can be regenerated without rebuilding the entire scene.**

> Scene Planner™ produces **partial Scene Blueprints™** for single-layer regeneration.

---

## Use Cases

| Founder says | Planner scope |
|--------------|---------------|
| *"Warmer lighting on Story Table"* | `lighting-systems` only |
| *"Replace the hero landmark"* | `hero-landmark-story-table` only |
| *"More haze in the atmosphere"* | `atmosphere-editorial` + maybe `particles-ambient` |
| *"Regenerate furniture only"* | `furniture-story-table` only |

---

## Partial Plan Mode

```yaml
PartialScenePlanRequest:
  orgId: string
  workspaceScene: story-table
  scope: single-layer | layer-group
  targetLayerIds: string[]
  preserveUpstream: true          # default — lock prerequisites
  founderIntentId: uuid
```

Output: `SceneBlueprint™` with **subset** `layerManifest` — same schema, narrowed scope.

---

## Locked Layers

Layers not in regen scope are **locked**:

```yaml
LockedLayer:
  layerId: string
  registryId: string
  lockReason: upstream-preserved | founder-request | golden-approved
  regenForbidden: true
```

Locked layers:

- Excluded from `generationOrder`
- Excluded from `missingAssets` scan (already fulfilled)
- Referenced as dependency anchors only

---

## Dependency Check on Regen

Before regen plan emits:

| Check | Result |
|-------|--------|
| Target layer exists in workspace | Proceed |
| Upstream locked layers approved | Proceed |
| Regen would violate layer isolation | Warn · require isolation flag |
| Regen affects downstream layers | Recommend downstream review |

Example: Regenerating **Environment Shell™** may **invalidate** downstream layers — Planner warns:

> *"Regenerating the environment shell may require reviewing lighting and furniture layers."*

Founder must confirm scope expansion or accept downstream stale risk.

---

## Downstream Staleness

```yaml
StaleRisk:
  layerId: string
  staleReason: scale-changed | lighting-motivation-changed | mount-surface-changed
  recommendedAction: review | regen | ignore
  severity: low | medium | high
```

High severity → Planner adds downstream layers to optional regen group.

---

## Regeneration Inventory

Per-layer regen re-runs Registry search **for target layer only**:

```
Regenerate lighting-systems
         ↓
Registry search: category Lighting™ · workspace story-table
         ↓
Recommend: modify existing rig OR generate-new OR reuse sibling station rig
         ↓
Partial SceneBlueprint with 1 LayerPlan + 1 GenerationLineItem (or ReuseLineItem)
```

Aligns with [Scene Stack regeneration](../../scene-stack/regeneration-system.md).

---

## Estimate on Partial Plan

```yaml
partialEstimate:
  totalEstimatedCost: 0.18        # one layer only
  totalSeconds: 22
  reuseSavings: 0.00
  complexity: low
  scopeLabel: "Lighting layer regeneration"
```

Production Estimates™ treats partial plans as first-class — not full workspace quotes.

---

## Version Lineage

Regenerated layer creates new Registry version:

```yaml
RegenLineage:
  parentRegistryId: registry:lighting-editorial-rig-v3
  newVersionBranch: v4
  supersedePolicy: preserve-parent | deprecate-parent
  layerId: lighting-systems
```

Stored on Canonical Asset Record™ after approval.

---

## Forbidden

| Forbidden | Alternative |
|-----------|-------------|
| Full scene regen on lighting tweak | Single-layer partial plan |
| Regen without locked upstream | `preserveUpstream: true` default |
| Skip inventory on regen | Per-layer Registry search |
| Auto-regen downstream without founder | `StaleRisk` recommendation only |

---

_Regeneration Planning™ — change the light without tearing down the room._
