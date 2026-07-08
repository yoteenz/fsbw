# Implementation Strategy™

**Environment first · workstations second · controls last**

---

## Purpose

Define **build order** for Creative Direction Studio™ V2 reset.

**Do NOT begin by rebuilding controls.**

---

## Core Law

```
ENVIRONMENT  →  WORKSTATIONS  →  CONTROLS
```

Every interaction emerges naturally from the physical environment.

---

## Phase 0 — Freeze Prototype

| Action | Rule |
|--------|------|
| Stop card iteration | No spacing · layout fixes |
| Preserve route | `/admin/studio/department/creative-direction` |
| Preserve learnings | [prototype-lessons.md](./prototype-lessons.md) |
| Document only this sprint | V2 spec before code |

---

## Phase 1 — Environment Architecture

| Deliverable | Priority |
|-------------|----------|
| Spatial envelope · scale · ceiling | P0 |
| Foreground / midground / background meshes | P0 |
| Lighting rig · genome slots | P0 |
| Floor · reflections · windows | P0 |
| Arrival Zone™ camera path | P0 |
| No page scroll enforcement | P0 |

**Exit gate:** Founder can **stand in arrival** · sense scale · no cards visible.

---

## Phase 2 — Arrival & Movement

| Deliverable | Priority |
|-------------|----------|
| Arrival Sequence™ choreography | P0 |
| Walk · pan · orbit camera | P0 |
| Transition™ from headquarters | P1 |
| World Memory™ camera restore | P1 |

**Exit gate:** Arrival recording triggers **"is this a game?"** reaction.

---

## Phase 3 — Physical Workstations

| Deliverable | Priority |
|-------------|----------|
| Story Table™ + Orb anchor | P0 |
| Living Mood Wall™ (architectural) | P0 |
| Pipeline production board (not panel) | P0 |
| Timeline Table™ | P1 |
| Review Area™ seating | P1 |
| Asset Console™ | P1 |
| Gallery · Library · Observatory | P2 |

**Exit gate:** Every feature maps to [room-as-interface.md](./room-as-interface.md).

---

## Phase 4 — Idle Life & World

| Deliverable | Priority |
|-------------|----------|
| Ambient animation pass | P1 |
| Spatial audio | P1 |
| Window · hallway · door cues | P1 |
| World State™ hooks | P2 |

---

## Phase 5 — Orb Host & Intelligence

| Deliverable | Priority |
|-------------|----------|
| Orb spatial behaviors | P1 |
| Pipeline narration | P1 |
| Founder Intelligence integration | P2 |
| Creative Direction Pipeline™ V2 at board | P2 |

---

## Phase 6 — Controls (Last)

| Deliverable | Priority |
|-------------|----------|
| Touch targets on objects | P1 |
| Workstation-local interactions | P1 |
| Director Feedback™ voice/text at console | P2 |
| Creative Review™ in Review Area | P2 |
| Internal scroll only where specified | P2 |

**Exit gate:** No floating pipeline panel · no card grid.

---

## Technology Notes (Non-Prescriptive)

| Layer | Direction |
|-------|-----------|
| Scene | Department Runtime™ · modular assets |
| Camera | Game-style rig · not scroll container |
| UI | Diegetic only · minimal DOM overlay |
| Pipeline | Creative Direction Pipeline™ philosophy |
| Assets | Golden Build™ path · Scene Blueprint™ |

Specific framework (Three.js · R3F · etc.) — implementation decision · not this sprint.

---

## What NOT to Do

| Forbidden |
|-----------|
| Rearrange prototype cards |
| Improve dashboard spacing |
| Add sidebar navigation |
| Embed Notion-style blocks |
| Ship scrollable room wrapper |
| Call V2 done when pipeline panel moved |

---

## Success Gates

| Gate | Test |
|------|------|
| G1 Environment | No cards · arrival only partial room |
| G2 Movement | No vertical room scroll on mobile |
| G3 Workstations | Walk to pipeline board physically |
| G4 Life | Room breathes when idle 30s |
| G5 Benchmark | Screen recording → "game?" reaction |

---

## Cross-References

- [prototype-lessons.md](./prototype-lessons.md)
- [Creative Direction Pipeline™](../creative-direction-pipeline/)
- [Department Runtime™](../engine/department-runtime/README.md)
- [Golden Build™](../production-lifecycle/golden-build.md)
