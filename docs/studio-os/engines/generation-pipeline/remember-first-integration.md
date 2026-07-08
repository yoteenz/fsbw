# Remember-First Integration™

**Engine Module:** `studio.generation-pipeline.v1.remember-first`  
**Status:** Reuse preference across entire pipeline

---

## Law

> **The engine should always prefer reusable assets whenever possible.**

> Reuse Existing™ is the **default recommendation** at Registry Check™ and every founder control gate.

---

## Remember-First in Pipeline Order

```
Prompt Composer™        (references Registry fragments in brief)
         ↓
Scene Planner™          (per-layer inventory scan)
         ↓
★ Asset Registry Check™ ★  (mandatory · per layer)
         ↓
Missing Assets™         (only unresolved gaps)
         ↓
Pre-Generation Estimate (savings rollup)
         ↓
Generation Queue™       (skip reused layers)
```

Registry is consulted **twice**:

| When | Purpose |
|------|---------|
| Scene Planner inventory | Plan-phase classification |
| Registry Check™ stage | Hard gate before Missing Assets resolution |

Results cached by `registrySearchId` — no duplicate scans.

---

## Default Recommendation Logic

```yaml
RecommendationEngine:
  for each layer:
    search Registry
    if exact-match ≥ 95:
      defaultAction: reuse-existing
    elif close-match 85–94:
      defaultAction: reuse-existing OR modify  # Orb explains tradeoff
    elif modifiable 70–84:
      defaultAction: modify
    else:
      defaultAction: generate-new
```

Founder may override — override recorded in Learning Loop™.

---

## Savings Propagation

| Stage | Savings applied |
|-------|-----------------|
| Registry Check™ | Per-layer `estimatedSavings` |
| Missing Assets™ | Remove fulfilled from `missingAssets` |
| Pre-Generation Estimate | `reusableSavings.totalSavings` |
| Generation Queue™ | Skip jobs · zero cost for reused |
| Registry Update™ | `usageCount++` only for reuse |

---

## Reuse Skip in Queue

Layers with `reuse-existing`:

- **Not enqueued** in Generation Queue™
- Marked `approved` after founder confirms
- Unlock dependent layers immediately
- Contribute to `reuseRate` metric

Target mature org: **≥ 40% reuse rate** per [generation-order](../../asset-intelligence-engine/generation-order.md).

---

## Cross-Workspace Reuse

Pipeline may recommend asset from sibling workspace:

> *"Mood Wall™ editorial lighting is compatible with Story Table™ — reuse?"*

[Compatibility Engine™](../../asset-intelligence-engine/compatibility-engine.md) scores cross-context matches.

---

## Pack Entitlement

Unowned Pack™ assets surface as acquire-alternative — not auto-generated:

```yaml
PackAlternative:
  missingAssetId: string
  packId: string
  savingsIfAcquired: number
  vsGenerateCost: number
```

Founder: acquire pack (reuse) vs generate-new.

---

## Variation vs Reuse

| Founder request | Pipeline path |
|-----------------|---------------|
| No explicit request | **Reuse** if match exists |
| *"Something new"* | `create-variation` or `generate-new` |
| *"Use what we have"* | Force `reuse-existing` |
| *"Warmer version of our rig"* | `modify` on parent |

---

## Orb Coaching

| Situation | Orb |
|-----------|-----|
| High reuse | *"Your library covers most of this scene — intelligent production."* |
| Low reuse | *"Several new layers needed — first investment in this workspace."* |
| Override to generate | *"Understood — creating new assets for your collection."* |

---

## Integration with Sub-Engines

| Sub-engine | Remember-first role |
|------------|---------------------|
| [Asset Registry™](../studio-asset-registry/README.md) | Storage · search · auto-register |
| [Generation Gate™](../studio-asset-registry/generation-gate.md) | Pre-enqueue hard block |
| [Scene Planner™](../scene-planner/registry-integration.md) | Plan-phase inventory |
| [Prompt Composer™](../prompt-composer/composition-sources.md) | Registry References source |
| [Asset Intelligence Engine™](../../asset-intelligence-engine/README.md) | Founder-facing explain |

---

_Remember-First Integration™ — own it first, make it last._
