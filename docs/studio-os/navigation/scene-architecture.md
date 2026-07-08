# Scene Architecture™ — Master Specification

**The Workspace System of Studio World™**

---

## Purpose

Define the **navigation philosophy** for all of Studio OS — the operating system layer that replaces page-thinking with place-thinking.

---

## Core Declaration

```
DEPARTMENTS  ≠  PAGES     →  DEPARTMENTS  =  DESTINATIONS
SCENES       ≠  PAGES     →  SCENES       =  WORKSPACES
NAVIGATION   ≠  ROUTING   →  NAVIGATION   =  MOVEMENT
```

---

## The Complete Hierarchy

| Level | What it is | What it is not | Example |
|-------|------------|----------------|---------|
| **Studio World™** | Persistent universe | App shell | The headquarters reality |
| **Headquarters™** | Company's physical home | Dashboard home | Frontal Slayer HQ |
| **Department™** | Major business function destination | Sidebar item | Creative Direction Studio™ |
| **Scene™** | Focused place with one purpose | Screen / view | Mood Wall Scene™ |
| **Workspace™** | Activity happening in the scene | Tab / panel | Content Creation Workspace™ |
| **Interaction™** | Diegetic engagement | Button click | Pin reference to wall |
| **Task™** | Atomic work unit | Form field | Approve concept branch |

### Inheritance Law

Every level **inherits** context, continuity, and architectural language from above.

```
Task™ knows Workspace™
Workspace™ knows Scene™
Scene™ knows Department™
Department™ knows Headquarters™
Headquarters™ knows Studio World™
```

---

## Departments Are Destinations

A department is where a founder **goes** to do a class of work.

| Department™ | Business function |
|-------------|-------------------|
| Creative Direction Studio™ | Creative intent · vision · direction |
| Distribution™ | Launch · channels · campaigns |
| Intelligence™ | Genome · memory · predictions |
| Marketing™ | Brand expression · campaigns |
| Hiring™ | Talent · interviews · offers |
| Finance™ | Revenue · planning · performance |
| Customer Experience™ | Journey · support · delight |
| Operations™ | Efficiency · scaling · systems |
| Research™ | Discovery · analysis · insight |
| Brand™ | Identity · systems · voice |
| Automation™ | Workflows · pipelines · AI ops |
| Analytics™ | Measurement · intelligence |
| Marketplace™ | HQ · sets · creator economy |

**Rule:** A department name should sound like a **wing of a headquarters**, not a software module.

---

## Scenes Are Workspaces

A scene is a **focused place** inside a department.

Scenes answer one question:

> *"What specific work happens here — and nowhere else?"*

| Property | Requirement |
|----------|-------------|
| **Single purpose** | One clear reason the place exists |
| **Emotional register** | Founder feels something specific |
| **Physical anchor** | Can be pointed to in the environment |
| **Separation logic** | Work is distinct from adjacent scenes |

**Scene ≠ Set™:** A [Set™](../world/set-dna.md) is the built environment. A **Scene™** is a navigable workspace within that environment. One Set may contain many scenes.

---

## Workspaces Describe Activity

| Layer | Describes |
|-------|-----------|
| **Scene™** | The **place** |
| **Workspace™** | The **activity** |

A scene may host one or more workspaces.

| Workspace™ | Activity |
|------------|----------|
| Content Creation Workspace™ | Writing · scripting · editorial |
| Asset Creation Workspace™ | Visual · environmental · object production |
| Hiring Workspace™ | Candidate evaluation · team planning |
| Automation Workspace™ | Workflow design · triggers |
| Strategy Workspace™ | Planning · frameworks · decisions |
| Review Workspace™ | Critique · approval · Braintrust |
| Publishing Workspace™ | Distribution prep · channel packaging |

---

## No Page Thinking

| Forbidden question | Required question |
|------------------|-------------------|
| "What page should we build?" | "What workspace would naturally exist inside this department?" |
| "Where does this feature go in the nav?" | "Where would this work physically happen?" |
| "Should this be a modal?" | "What object in the room handles this?" |

---

## Movement Model

```
Founder selects Department™ (destination)
        ↓
Arrival Scene™ (threshold — never full department dump)
        ↓
Explore · walk · pan · orbit between Scenes™
        ↓
Engage Workspace™ at scene
        ↓
Complete Task™
        ↓
Move to next Scene™ or exit via Transition™
```

**Source:** [movement-philosophy.md](./movement-philosophy.md) · [Transitions™](../world/transitions/README.md)

---

## Continuity Requirements

Every department shares [headquarters continuity](./headquarters-continuity.md):

- Arrival Zone™
- Orb™
- Navigation™
- Lighting™
- Ambient Life™
- Hallways™
- Transitions™
- Doors™
- Materials™

The founder always knows they are still inside Studio World™.

---

## Orb Navigation Role

The [Orb™](./orb-context-system.md) accompanies the founder through every level:

- Current department
- Current scene
- Current workspace
- Current task
- Project history
- Founder preferences
- Company context

The Orb behaves as the **intelligent host of the headquarters** — not a chatbot in a corner.

---

## Immersion Requirement

Departments never feel empty. Scenes feel **already active**.

**Source:** [immersion-principles.md](./immersion-principles.md) · [Idle Life™](../foundational-experience-systems/idle-life.md)

The headquarters never waits for the founder. The founder joins work already in progress.

---

## Scene Design Questions

Every scene must answer:

| # | Question |
|---|----------|
| 1 | Why does this place exist? |
| 2 | What work happens here? |
| 3 | Why is this work separated from the previous scene? |
| 4 | What emotional state should the founder feel here? |
| 5 | What should immediately draw attention? |
| 6 | What should remain in the background? |

---

## Long-Term Vision

Every department becomes a destination someone **enjoys visiting**:

| Department | Atmosphere |
|------------|------------|
| Creative | Inspiring |
| Hiring | Collaborative |
| Distribution | Energetic |
| Intelligence | Thoughtful |
| Operations | Organized |
| Marketing | Alive |

Each develops its own atmosphere while preserving **one unified headquarters**.

---

## Relationship to Routes (Non-Prescriptive)

Today, routes like `/admin/studio/department/creative-direction` are **implementation artifacts**.

Scene Architecture™ defines the **destination model** routes must eventually express — not the URL structure itself.

| Today (prototype) | Tomorrow (Scene Architecture™) |
|-------------------|-------------------------------|
| Department route | Department destination |
| Zone/camera panel | Scene™ |
| Embedded form | Workspace™ at physical object |

**Do not conflate** current React routes with the canonical navigation model.

---

## Anti-Patterns

| Anti-pattern | Why rejected |
|--------------|--------------|
| Page-per-feature | Software thinking |
| Sidebar department list | Menu not headquarters |
| Scene as React route only | Implementation ≠ philosophy |
| Dashboard landing per department | No arrival · no scale |
| Modal over entire scene | Breaks place-as-interface |
| Infinite scroll department | Webpage not room |

---

## Cross-References

- [department-framework.md](./department-framework.md)
- [scene-framework.md](./scene-framework.md)
- [workspace-framework.md](./workspace-framework.md)
- [navigation-laws.md](./navigation-laws.md)
- [Studio World™](../world/studio-world.md)
