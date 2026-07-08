# Golden Build™ — First Production-Quality Proof

**Lifecycle Stage:** 2 of 6  
**Status:** Canonical  
**Predecessor:** Blueprint™  
**Successor:** Certified™

---

## Purpose

Golden Build™ is the **first production-quality implementation** of any Studio OS experience.

It is not an MVP. It is not a prototype. It is the standard for proving a department — or any experience — before expanding it.

> Think like a AAA game studio: before building an entire game, they prove the engine with one exceptional playable experience.

Golden Build™ proves:

- The **engine**
- The **production pipeline**
- The **founder experience**
- The **runtime**
- The **immersive vision**

---

## Golden Build™ Nature

| Attribute | Definition |
|-----------|------------|
| **Experience complete** | Founder immediately understands the vision |
| **Not feature complete** | Depth comes in Evolution™ |
| **Engine validation** | Reusable systems — not one-off code |
| **Smallest magical version** | Minimum scope that already feels alive |

---

## Critical Engineering Rule

Golden Build™ implementations must **not** be special cases.

Nothing built during Golden Build may be hardcoded for one department. Uniqueness comes only from:

- Department Definition
- Company Genome™
- Project Genome™
- Room DNA™

If implementation requires department-specific logic inside reusable systems — **stop and redesign the abstraction**.

---

## Required Outputs

| Output | Purpose |
|--------|---------|
| **Interactive experience** | Navigable immersive room — a place, not a page |
| **Walk the Room™** | Guided spatial proof |
| **Initial runtime** | Department Runtime boot · zones · atmosphere |
| **Core interactions** | Hero objects respond — Mood Wall · Notes · Orb |
| **First asset generation** | Generate Environment™ validates full pipeline |
| **Production validation** | Queue · FAL · Registry · preview |

---

## Golden Build™ Experiences (Minimum Set)

For department Golden Builds, prove these six:

| # | Experience | Reusable object |
|---|------------|-----------------|
| 1 | Environment Shell™ | `department-room/` |
| 2 | Studio Orb™ | `studio-orb-runtime/` |
| 3 | Living Mood Wall™ | `studio-objects/living-mood-wall/` |
| 4 | Founder Notes™ | `studio-objects/founder-notes/` |
| 5 | Generation Queue™ | `studio-builder/queue-store` |
| 6 | Generate Environment™ | `studio-builder/` + FAL pipeline |

---

## Success Criteria

Golden Build™ succeeds when the founder can:

| # | Criterion |
|---|-----------|
| 1 | Open the room |
| 2 | Walk around naturally |
| 3 | Meet Studio Orb™ |
| 4 | Use core interactive objects |
| 5 | Press Generate Environment™ |
| 6 | Watch Generation Queue update |
| 7 | Trigger existing FAL pipeline |
| 8 | View generated preview |
| 9 | Confirm major objects are reusable by future departments |

---

## Pilot — Creative Direction Studio™

**First Golden Build in Studio OS history.**

| Attribute | Value |
|-----------|-------|
| Department | Creative Direction Studio™ |
| Package ID | `pkg-creative-direction-golden-v1` |
| Route | `/admin/studio/department/creative-direction` |
| Status | Golden Build™ achieved (Sprint 001) |
| Next | Certified™ — full Validation Loop + Walk the Room |

---

## Golden Build™ vs Other Language

| Term | Relationship |
|------|--------------|
| MVP | Rejected — Golden Build is production-quality proof |
| Prototype | Rejected — Golden Build ships to founders |
| Vertical Slice | Deprecated product language — use Golden Build™ |
| Alpha | Platform phase — Golden Build is per-experience stage |
| Golden Department | Predecessor certification language — maps to Certified™ |

---

## Exit Criteria — Golden Build Gate

| # | Criterion | Validator |
|---|-----------|-----------|
| 1 | All six minimum experiences functional | Founder walkthrough |
| 2 | Generate Environment™ end-to-end | FAL + Registry + Queue |
| 3 | Reusable engine — no department hardcoding | Code review |
| 4 | Founder understands vision in 30 seconds | Golden Rule |
| 5 | Walk the Room™ partial or full | Walk engine |
| 6 | Blueprint artifacts consumed — not bypassed | Package audit |

**Gate detail:** [quality-gates.md](./quality-gates.md#golden-build-gate)

---

## Founder Experience in Golden Build™

| Signal | Founder sees |
|--------|--------------|
| Stage badge | **Golden Build™** |
| Room state | Immersive shell · core interactions live |
| Orb behavior | Guiding · project-aware · instructional |
| Primary verbs | Walk · interact · generate · validate feel |

Founder language: *"Our Creative Direction Studio reached Golden Build™."*

---

## Relationship to Existing Systems

| System | Golden Build™ role |
|--------|-------------------|
| [Studio Builder™](../alpha/studio-builder/README.md) | Founder production interface |
| [Department Package](../../src/studio-os-core/department-package/) | Data-only uniqueness |
| [Production Stages 02–07](../production/README.md) | Manufacturing execution |
| [Alpha Sprint 001](../alpha/creative-direction-alpha.md) | CDS Golden Build charter |

---

## Transition

**Golden Build™ → Certified™** when Golden Build Gate passes and full certification review begins.

Next: [certification-system.md](./certification-system.md)
