# Future Roadmap — Scene Planner™

**Engine:** `studio.scene-planner.v1`  
**Last updated:** 2026-07-08

---

## v1.0.0 — Architecture Sprint (This Sprint) ✓

| Deliverable | Status |
|-------------|--------|
| Engine README · mission · law | ✓ |
| Workspace Layer Decomposition™ (12 layers) | ✓ |
| LayerPlan™ spec | ✓ |
| Scene Blueprint™ schema (7 mandated fields) | ✓ |
| Dependency Resolution™ | ✓ |
| Asset Inventory™ (reusable · required · missing) | ✓ |
| Generation Order™ · parallel stages | ✓ |
| Regeneration Planning™ | ✓ |
| Registry Integration™ | ✓ |
| Production Estimate Handoff™ | ✓ |
| Cross-refs CIE · Scene Stack · Registry | ✓ |

**No implementation · no UI · no image generation.**

---

## v1.1 — Plan Service

| Item | Priority |
|------|----------|
| `planSceneBlueprint()` API contract | P0 |
| Workspace template catalog (6 CDS workspaces) | P0 |
| Per-layer Registry search integration | P0 |
| Partial plan (single-layer regen) API | P0 |
| Estimate rollup functions | P0 |
| CDS Story Table™ first full plan | P0 |

---

## v1.2 — Intelligence Upgrades

| Item | Priority |
|------|----------|
| Cross-workspace reuse recommendations | P1 |
| StaleRisk downstream detection | P1 |
| Pack entitlement suggestions | P1 |
| Founder Control override recording | P0 |
| Registry search cache (Generation Gate share) | P1 |

---

## v1.3 — Studio Alpha Analytics

| Item | Priority |
|------|----------|
| PlannerRegistryAudit storage | P2 |
| Plan vs actual cost reconciliation | P2 |
| Reuse rate by workspace dashboard | P2 |

---

## v1.4 — Multi-Workspace Planning

| Item | Priority |
|------|----------|
| Department-wide plan (all 6 CDS scenes) | P1 |
| Shared layer deduplication across workspaces | P1 |
| Batch estimate for department Golden Build™ | P1 |

---

## Dependencies

| Upstream | Relationship |
|----------|--------------|
| Creative Interpreter™ | Structured request |
| Blueprint Engine™ | Layer overrides · scope |
| Asset Registry™ | Inventory · dependencies |
| Production Estimates™ | Founder quote · approval |
| Creative Budgets™ | Capacity gate |
| Prompt Composer™ | Consumes GenerationLineItems |
| Generation Manager™ | Executes generationOrder |

---

## Forbidden Until v2+

- Image generation inside Planner
- Full-scene single-job plans
- Provider prompt assembly
- Skipping Registry per-layer inventory
- Auto-approve estimates without founder

---

_Future Roadmap — plan completely, generate later._
