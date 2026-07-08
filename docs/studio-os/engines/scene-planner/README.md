# Scene Planner™ — The Construction Blueprint (v1)

**Version:** 1.0.0  
**Status:** Canonical scene planning engine specification — architecture sprint  
**Type:** Core Studio OS Engine — not a feature, not a generator  
**Engine ID:** `studio.scene-planner.v1`  
**Tagline:** *Plan the scene. Generate nothing.*

---

> **Before anything is generated, Studio OS must understand how the scene should be constructed.**

> **Every layer becomes independently generatable. Every layer can be regenerated without rebuilding the entire scene.**

---

## Mission

Scene Planner™ breaks every **workspace** into **reusable production layers** and outputs a **Scene Blueprint™** — a complete construction plan describing dependencies · asset inventory · generation order · and production estimates.

Scene Planner™ **does not generate images**. It **only plans the scene**.

---

## Law

```
Understand construction → plan layers → inventory assets → order generation → estimate cost
```

Generation is **forbidden** until Scene Blueprint™ is approved via [Production Estimates™](../../studio-production-estimates/README.md).

| Forbidden | Required |
|-----------|----------|
| Generate images in Planner | Emit Scene Blueprint™ only |
| Single monolithic scene plan | Per-layer LayerPlan™ |
| Skip Registry inventory | Reusable · required · missing asset audit |
| Full-scene regen on layer change | Partial layer regeneration plan |
| Provider prompts | Defer to Prompt Composer™ downstream |

---

## Engine Position

```
Founder Intent™
         ↓
Creative Interpreter™
         ↓
Blueprint Engine™
         ↓
Asset Registry™ (Generation Gate™ — org-wide)
         ↓
★ SCENE PLANNER™ ★ (this engine)
         ↓
Production Estimates™ (founder approve)
         ↓
Creative Budgets™
         ↓
Prompt Composer™ (per GenerationLineItem)
         ↓
Provider Optimizer™ → Generation Manager™
```

Scene Planner sits **after** Blueprint scope is known and **before** any production estimate or compose step.

---

## Example — Story Table™

```
Story Table™ workspace
         ↓
Scene Planner™ decomposes into:
  01 Environment Shell™
  02 Lighting™
  03 Architecture™
  04 Furniture™
  05 Hero Landmark™
  06 Atmosphere™
  07 Materials™
  08 Particles™
  09 Interactive Objects™
  10 Runtime FX™
  11 Audio™
  12 Camera™
         ↓
Scene Blueprint™ (one object — planning only)
```

Each layer → independent `LayerPlan™` with its own reuse · generate · skip resolution.

---

## Output: Scene Blueprint™

Single canonical object per workspace plan:

| Field | Meaning |
|-------|---------|
| `dependencies` | Layer-to-layer DAG · hard/soft edges |
| `reusableAssets` | Registry matches — zero new generation |
| `requiredAssets` | Must exist for scene assembly |
| `missingAssets` | Gaps requiring generation or purchase |
| `generationOrder` | Topological sort · parallelizable stages |
| `estimatedCost` | Abstract production dollars |
| `estimatedGenerationTime` | Wall-clock creative production duration |

Full schema: [scene-blueprint-schema.md](./scene-blueprint-schema.md).

---

## What This Engine Does

| Does | Does Not |
|------|----------|
| Decompose workspace → production layers | Call AI providers |
| Query Registry per layer | Compose prompts (Prompt Composer™) |
| Resolve layer dependencies | Execute generation (Generation Manager™) |
| Classify reusable · required · missing | Build UI |
| Compute generation order | Assemble runtime scenes (Scene Assembly™) |
| Feed Production Estimates™ | Skip founder approval |

---

## Document Index

| Document | Contents |
|----------|----------|
| [workspace-layer-decomposition.md](./workspace-layer-decomposition.md) | Workspace → layer breakdown |
| [layer-plan-spec.md](./layer-plan-spec.md) | Per-layer LayerPlan™ |
| [scene-blueprint-schema.md](./scene-blueprint-schema.md) | Canonical Scene Blueprint™ |
| [dependency-resolution.md](./dependency-resolution.md) | Layer DAG · asset deps |
| [asset-inventory.md](./asset-inventory.md) | Reusable · required · missing |
| [generation-order.md](./generation-order.md) | Ordering · parallelism |
| [regeneration-planning.md](./regeneration-planning.md) | Per-layer regen without full rebuild |
| [production-estimate-handoff.md](./production-estimate-handoff.md) | Cost · time · estimate contract |
| [registry-integration.md](./registry-integration.md) | Remember-first at plan phase |
| [future-roadmap.md](./future-roadmap.md) | v1.1+ implementation |

---

## Sprint Constraints

| Allowed | Forbidden |
|---------|-----------|
| Engine architecture · schema · pipeline docs | React · Three.js · Supabase |
| Scene Blueprint™ contract | Image generation |
| Cross-refs · motherboard | Provider integration |
| CDS Story Table™ walkthrough | UI polish |

---

## Success Criteria (v1)

- [x] Mission · law · pipeline position documented
- [x] Workspace layer decomposition (12 layers + Cursor boundary)
- [x] Scene Blueprint™ canonical schema
- [x] Dependency · inventory · order rules
- [x] Per-layer regeneration planning
- [x] Production Estimate handoff contract
- [x] Cross-refs to CIE · Scene Stack · Registry · Prompt Composer

---

_Scene Planner™ — construction understood before a single pixel is commissioned._
