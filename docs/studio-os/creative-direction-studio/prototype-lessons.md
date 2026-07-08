# Prototype Lessons™

**What the current implementation proved**

---

## Purpose

Document the **Alpha Sprint 001 prototype** — honor what worked · reject what failed · do not iterate.

---

## Prototype Inventory

| Artifact | Path / component |
|----------|------------------|
| Department room shell | `DepartmentVerticalSliceRoom` |
| Pipeline UI | `CreativeApprovalPipelinePanel` |
| Review UI | `CreativeReviewPanel` |
| Pipeline logic | `studio-builder/approval-pipeline-store.ts` |
| Hook | `useCreativeApprovalPipeline` |
| Route | `/admin/studio/department/creative-direction` |
| Generation API | `api/_lib/studioBuilderGeneration.ts` |

---

## What the Prototype Proved ✓

| Proof | Evidence |
|-------|----------|
| **Concept works** | Immersive department route viable |
| **Founders want in-room creative direction** | Mood Wall · Orb · pipeline in one destination |
| **Generation in department context** | FAL integration from room |
| **Creative Review™ in-room is right** | Braintrust gate belongs in department |
| **Department package pattern scales** | `pkg-creative-direction-golden-v1` reusable |
| **Mobile can load department** | Route works on phone (storage bugs fixed) |
| **Pipeline stages map to production** | 10-stage model directionally correct |

**The prototype succeeded as a hypothesis test.**

---

## What the Prototype Got Wrong ✗

| Failure | Symptom |
|---------|---------|
| **Software-in-page philosophy** | Pipeline panel floats over environment |
| **Card-based UI** | `CreativeApprovalPipelinePanel` = dashboard |
| **Entire room on one screen** | Wide static shot · no arrival |
| **Page scroll** | Vertical scroll on mobile web |
| **Orb as decoration** | Not spatial host |
| **Static environment** | Shell image · minimal Idle Life |
| **Controls before place** | Pipeline first · room second |
| **Review as modal/panel** | Not Review Area™ seating |
| **"Nice UI" benchmark** | Feels like styled admin |

**The prototype failed as Studio World™ execution.**

---

## Explicit Non-Actions

Do **NOT**:

- Rearrange cards in `CreativeApprovalPipelinePanel`
- Improve spacing in pipeline console
- Redesign dashboard layout within shell
- Add sidebar to prototype
- Polish card typography as "V2"

These treat the disease as styling. **V2 is architectural replacement.**

---

## What to Preserve (Logic · Not UI)

| Preserve | Migrate to V2 as |
|----------|------------------|
| Pipeline state machine | Creative Pipeline™ board lights |
| Braintrust review flow | Review Area™ experience |
| Director Feedback™ parsing | Asset Console™ voice/text |
| Director's Notes store | Founder Notes™ desk |
| FAL generation | Asset Console™ operate |
| Project genome notes | Story Table™ context |
| Storage wrapper pattern | Same stores · new presentation |

---

## Prototype → V2 Translation

```
PROTOTYPE                          V2
─────────────────────────────────────────────────────
Environment shell image      →    Full spatial scene + arrival
Floating pipeline panel      →    Pipeline production wall
CreativeReviewPanel          →    Review Area™ + Orb
Scrollable room container    →    Camera movement rig
Corner Orb text              →    Orb host above Story Table
All zones visible            →    Arrival Zone™ + discovery
Card approve buttons         →    Physical approve gestures
```

---

## Mobile Crash Lesson

`approval-pipeline-store` array storage bug (fixed) — V2 stores survive; **presentation** must change not storage philosophy.

---

## Decision Record

| Date | Decision |
|------|----------|
| 2026-07-08 Alpha | Ship prototype to prove concept |
| 2026-07-08 Reset | Concept validated · architecture rejected · V2 docs |

---

## Cross-References

- [architectural-reset.md](./architectural-reset.md)
- [implementation-strategy.md](./implementation-strategy.md)
- [Alpha Sprint 001](../../motherboard/CORE.md) (CORE line)
