# Implementation Strategy™

**Engine first · environment generated · controls last**

---

## Purpose

Define **build order** for Creative Direction Studio™ **V3** — Creative Intelligence Engine™ pilot.

**Do NOT begin by rebuilding controls or polishing the prototype.**

---

## Core Law (V3)

```
CREATIVE INTELLIGENCE ENGINE™  →  SCENE GENERATION  →  ASSEMBLY  →  PRESENTATION  →  CONTROLS
```

V2 began with visual environment. **V3 begins with generation pipeline** — then engine builds worlds.

Detail: [engine-first-roadmap.md](../creative-intelligence-engine/engine-first-roadmap.md).

---

## Phase 0 — Freeze Prototype

| Action | Rule |
|--------|------|
| **Stop all CDS UI polish** | No cards · spacing · dashboard fixes |
| Preserve route | `/admin/studio/department/creative-direction` |
| Preserve pipeline logic | Stores · state machines — new diegetic UI |
| Document only this sprint | V3 engine spec before code |

---

## Phase 1 — Creative Intelligence Pipeline

| Deliverable | Priority |
|-------------|----------|
| Founder Intent™ contract | P0 |
| Scene Planner™ · Prompt Composer™ | P0 |
| Quality Inspector™ gates | P0 |
| Provider Optimizer™ handoff to Generation Manager™ | P0 |
| Asset Registry search-before-generate | P0 |

**Exit gate:** One layer generates end-to-end without founder prompt.

---

## Phase 2 — Scene Stack Generation (CDS)

| Deliverable | Priority |
|-------------|----------|
| Six workspace scene manifests | P0 |
| Per-layer Generation Manager™ jobs | P0 |
| Scene Assembly™ compositor | P0 |
| First proof scene (Story Table™ or Arrival™) | P0 |

**Exit gate:** One workspace scene assembled from generated layers.

---

## Phase 3 — Environment Architecture (Generated)

| Deliverable | Priority |
|-------------|----------|
| Spatial envelope from layers — not mockup | P0 |
| Foreground / midground / background from stack | P0 |
| Arrival Zone™ camera on generated scene | P0 |
| No page scroll enforcement | P0 |

**Exit gate:** Founder stands in **generated** arrival · no cards.

---

## Phase 4 — Arrival & Movement

| Deliverable | Priority |
|-------------|----------|
| Arrival Sequence™ choreography | P0 |
| Walk · pan · orbit camera | P0 |
| Transition™ from headquarters | P1 |
| World Memory™ camera restore | P1 |

**Exit gate:** Arrival recording triggers **"is this a game?"** reaction.

---

## Phase 5 — Physical Workstations (Diegetic)

| Deliverable | Priority |
|-------------|----------|
| Story Table™ + Orb anchor | P0 |
| Mood Wall™ (generated editorial wall) | P0 |
| Pipeline™ production board (not panel) | P0 |
| Notes Desk™ · Library™ | P1 |

**Exit gate:** Six [workspace scenes](../creative-intelligence-engine/workspaces-as-scenes.md) navigable.

---

## Phase 6 — Idle Life & Orb Host

| Deliverable | Priority |
|-------------|----------|
| Ambient animation pass | P1 |
| Spatial audio | P1 |
| Window · hallway · door cues | P1 |
| World State™ hooks | P2 |

---

## Phase 7 — Controls (Last)

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
| Polish CDS environmental CSS pass |
| Chase pixel-perfect room renders before pipeline |
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
