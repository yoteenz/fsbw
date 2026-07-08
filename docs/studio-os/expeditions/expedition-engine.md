# Expedition Engine™

**Orchestration of Transformation**

---

## Purpose

Define how Studio OS **orchestrates Expeditions™** — stage progression · milestone detection · unlock logic · pause/resume · and completion.

**Philosophy only — no implementation this sprint.**

---

## Core Law

The Expedition Engine™ orchestrates **transformational arcs**.

[Routine Engine™](../routines/routine-engine.md) orchestrates **operational legs** within stages.

---

## Engine Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Expedition selection** | Match intent to transformation catalog |
| **Stage activation** | Current stage on Expedition Map™ |
| **Milestone tracking** | Meaningful moments detected · recorded |
| **Stage unlock** | Next stage when criteria met |
| **Routine dispatch** | Spawn routines within stage |
| **Block detection** | Strategic blockers · dependencies |
| **Timeline write** | Living Timeline™ persistence |
| **HQ evolution trigger** | Signal headquarters changes |
| **Pause & Resume™** | Multi-week state preservation |
| **Completion & memory** | Expedition Memory™ · Founder's Story™ |

---

## Orchestration Flow

```
Founder declares transformation ("Launch the company")
        ↓
Expedition Engine™ selects Expedition™
        ↓
Expedition Start™ ceremony (roadmap reveal)
        ↓
Stage 1 active on Expedition Map™
        ↓
LOOP per stage:
  Dispatch Routine(s)™ within stage
        ↓
  Monitor milestone™ + task completion
        ↓
  Write Living Timeline™ entries
        ↓
  Trigger HQ evolution beats as earned
        ↓
  On stage complete → unlock next stage · celebration
        ↓
UNTIL final stage complete
        ↓
Expedition Complete™ ceremony
        ↓
Expedition Memory™ · Chronicle entry · HQ permanent change
```

---

## Expedition States

| State | Description |
|-------|-------------|
| **Contemplated** | Orb surfaced · not started |
| **Active** | In progress · stage active |
| **Paused** | Pause & Resume™ — weeks allowed |
| **Blocked** | Strategic dependency · Orb explains |
| **Stage Complete** | Milestone beat · transitioning |
| **Complete** | Transformation recorded |
| **Legendary** | Archived · revisit mode in Founder's Story™ |

---

## Stage Unlock Logic

Stages unlock when:

| Criterion | Example |
|-----------|---------|
| **Prior stage milestones** | Brand Golden Brand™ before Launch stage |
| **Required routines complete** | Legal routine done |
| **Founder explicit gate** | "We're ready for fundraising" |
| **External signal** | First sale detected · unlock Growth |
| **Time-based optional** | Soft suggest · never hard block without reason |

Unlock is **celebrated** — not silent.

---

## Expedition Start™ Ceremony

| Beat | Content |
|------|---------|
| 1. **Arrival** | Headquarters · strategic context |
| 2. **Orb framing** | Scale · duration · commitment |
| 3. **Expedition Map™ reveal** | All stages · current position |
| 4. **Living Timeline™** | Empty scroll · ready to record |
| 5. **First stage brief** | What happens now |
| 6. **HQ preview** | How headquarters will grow |
| 7. **Begin** | Stage 1 activates |

---

## Pause & Resume™

Expeditions persist across **weeks and months**:

| Saved state | Detail |
|-------------|--------|
| **Current stage** | Stage ID · percent |
| **Active routines** | Nested routine resume stacks |
| **Open decisions** | Uncommitted strategic choices |
| **Completed milestones** | Never re-litigated |
| **Pending approvals** | Golden Builds · legal · board |
| **Blocked tasks** | With blocker reason |
| **Timeline position** | Scroll restore |

Resume ceremony (abbreviated):

> *"Welcome back to Launch Company™. We're in the Marketing stage — two milestones remain before Launch."*

---

## Routine Integration

```typescript
interface ExpeditionStage {
  id: string;
  displayName: string;
  order: number;
  departments: string[];
  routines: string[];           // Routine IDs to dispatch
  milestones: MilestoneId[];
  unlockCriteria: UnlockRule[];
  hqEvolutionBeat?: string;
  orbStageIntro: string;
}
```

Routine Engine™ receives `expeditionContext` — shortcuts still apply within stages.

---

## Block Detection

| Blocker type | Engine response |
|--------------|-----------------|
| **Missing prerequisite stage** | Orb route to prior stage |
| **Legal hold** | Pause stage · surface Legal routine |
| **Funding gap** | Suggest Fundraising expedition branch |
| **Founder absence** | Auto-pause · no data loss |
| **Conflicting expedition** | Orb presents choice |

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Engine = project management | Transformation not tasks |
| Stages unlock arbitrarily | Milestones must mean something |
| No pause across months | Real expeditions interrupt |
| Lose nested routine state | Resume must be exact |
| Silent stage completion | Celebration required |

---

## Cross-References

- [living-roadmaps.md](./living-roadmaps.md)
- [milestone-system.md](./milestone-system.md)
- [Routine Engine™](../routines/routine-engine.md)
