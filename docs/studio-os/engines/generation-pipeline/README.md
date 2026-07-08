# Generation Pipeline™ — The Production Engine (v1)

**Version:** 1.0.0  
**Status:** Canonical production engine specification — architecture sprint  
**Type:** Core Studio OS Engine — master orchestrator  
**Engine ID:** `studio.generation-pipeline.v1`  
**Tagline:** *Intent in. Workspace published. Layer by layer.*

---

> **This becomes the production engine of Studio OS.**

> **Generation happens layer-by-layer. Reuse is always preferred.**

---

## Mission

Generation Pipeline™ is the **unified production engine** orchestrating every stage from founder intent to published workspace — planning · estimating · generating · validating · approving · assembling · registering.

It coordinates sub-engines. It does **not** replace them.

---

## Canonical Pipeline

```
Founder Intent™
         ↓
Prompt Composer™
         ↓
Scene Planner™
         ↓
Asset Registry Check™
         ↓
Missing Assets™
         ↓
★ Pre-Generation Estimate ★ (cost · time · provider · savings)
         ↓
Provider Optimizer™
         ↓
Generation Queue™
         ↓
Quality Inspector™
         ↓
Founder Approval™
         ↓
Scene Assembly™
         ↓
Registry Update™
         ↓
Workspace Published™
```

**No provider execution** until pre-generation estimate is approved.

---

## Layer-by-Layer Generation Order

Within Generation Queue™, layers execute in sequence (parallel where dependencies allow):

```
Environment™
      ↓
Lighting™
      ↓
Architecture™
      ↓
Furniture™
      ↓
Hero Objects™
      ↓
Atmosphere™
      ↓
Particles™
      ↓
Runtime FX™
```

Each layer: independent job · independent approval · independent regeneration.

---

## Founder Controls (Every Stage)

| Control | Effect |
|---------|--------|
| **Approve** | Advance to next stage |
| **Reject** | Halt · return to planning or prior stage |
| **Regenerate** | Re-run current layer/stage only |
| **Create Variations** | Fork · branch · new version line |
| **Reuse Existing** | Attach Registry asset · skip provider |

See [founder-controls.md](./founder-controls.md).

---

## Pre-Generation Estimate (Mandatory)

Before Generation Queue™ enqueues, Pipeline must surface:

| Metric | Founder-facing | Internal (Studio Alpha™) |
|--------|------------------|--------------------------|
| **Generation cost** | Estimated Production Cost™ | Provider cost breakdown |
| **Generation time** | Estimated Production Time™ | Per-layer SLA |
| **Provider usage** | Hidden | Provider family + model route |
| **Reusable asset savings** | Estimated Savings™ | Per-asset reuse value |

See [pre-generation-estimates.md](./pre-generation-estimates.md).

---

## Remember-First Law

> The engine should **always prefer reusable assets** whenever possible.

Registry Check™ runs before Missing Assets™. Reuse Existing™ is the **default recommendation** at every founder control gate.

---

## Sub-Engine Map

| Pipeline Stage | Sub-Engine |
|----------------|------------|
| Founder Intent™ | Creative Interpreter™ · Blueprint Engine™ |
| Prompt Composer™ | [prompt-composer/](../prompt-composer/README.md) |
| Scene Planner™ | [scene-planner/](../scene-planner/README.md) |
| Asset Registry Check™ | [studio-asset-registry/](../studio-asset-registry/README.md) |
| Missing Assets™ | Scene Planner inventory + Asset Intelligence |
| Provider Optimizer™ | [prompt-composer/provider-optimizer-handoff.md](../prompt-composer/provider-optimizer-handoff.md) |
| Generation Queue™ | [generation-manager/](../generation-manager/README.md) |
| Quality Inspector™ | Validation Loop™ |
| Founder Approval™ | Creative Approval Pipeline™ · Production Estimates™ |
| Scene Assembly™ | Scene Stack™ compositor |
| Registry Update™ | Auto-Registration™ |
| Workspace Published™ | Department Runtime™ |

Full mapping: [engine-orchestration.md](./engine-orchestration.md).

---

## Document Index

| Document | Contents |
|----------|----------|
| [pipeline-stages.md](./pipeline-stages.md) | Twelve stages · contracts |
| [layer-by-layer-generation.md](./layer-by-layer-generation.md) | Layer execution order |
| [founder-controls.md](./founder-controls.md) | Approve · Reject · Regenerate · Variations · Reuse |
| [pre-generation-estimates.md](./pre-generation-estimates.md) | Cost · time · provider · savings |
| [remember-first-integration.md](./remember-first-integration.md) | Reuse preference law |
| [generation-queue-stage.md](./generation-queue-stage.md) | Queue · per-layer jobs |
| [quality-inspector-stage.md](./quality-inspector-stage.md) | Validation gates |
| [scene-assembly-stage.md](./scene-assembly-stage.md) | Compositing · publish prep |
| [engine-orchestration.md](./engine-orchestration.md) | Sub-engine coordination |
| [future-roadmap.md](./future-roadmap.md) | v1.1+ implementation |

---

## Sprint Constraints

| Allowed | Forbidden |
|---------|-----------|
| Production engine architecture docs | React · Three.js · Supabase |
| Pipeline orchestration contracts | Provider SDK integration |
| Cross-refs · motherboard | UI polish |
| Layer-by-layer spec | Single monolithic generation |

---

## Success Criteria (v1)

- [x] Twelve-stage canonical pipeline documented
- [x] Layer-by-layer generation order
- [x] Founder controls at every stage
- [x] Pre-generation estimate contract
- [x] Remember-first integration
- [x] Sub-engine orchestration map
- [x] Cross-refs to all production engines

---

_Generation Pipeline™ — the production engine that turns intent into published worlds._
