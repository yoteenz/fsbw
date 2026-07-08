# Department Framework™

**Destinations — Not Pages**

---

## Purpose

Define what a **Department™** means in Scene Architecture™ — the second level of the navigation hierarchy, below Headquarters™.

---

## Core Law

**A Department™ is a destination.**

Founders do not "open" departments. Founders **enter** them.

---

## What a Department Is

| Department™ **is** | Department™ **is not** |
|--------------------|------------------------|
| A major business function wing | A sidebar nav item |
| A destination in Studio World™ | A URL segment |
| A collection of scenes | A single screen |
| A living environment (Set™) | A dashboard template |
| Inheritor of headquarters continuity | An isolated micro-app |

---

## Department Identity

Every department requires:

| Property | Description |
|----------|-------------|
| **Department ID** | Stable identifier (`creative-direction`, `hiring`, etc.) |
| **Display name** | Aspirational profession name (Creative Direction Studio™) |
| **Business function** | What class of company work lives here |
| **Emotional register** | How the founder should feel upon entry |
| **Set™** | Physical environment (Creative Atelier™, Talent Studio™, etc.) |
| **Scene inventory** | Focused workspaces inside |
| **Entry scene** | Arrival Scene™ — never full department on load |
| **Exit transitions** | How founder leaves to adjacent departments |

---

## Launch Department Catalog

| Department™ | Function | Emotional register |
|-------------|----------|-------------------|
| **Creative Direction Studio™** | Creative intent · vision · approval | Inspired · powerful · focused |
| **Distribution™** | Launch · channels · growth | Energetic · urgent · confident |
| **Intelligence™** | Genome · memory · prediction | Thoughtful · precise · knowing |
| **Marketing™** | Brand expression · campaigns | Alive · expressive · bold |
| **Hiring™** | Talent · team building | Collaborative · human · decisive |
| **Finance™** | Revenue · planning · health | Clear · structured · reassuring |
| **Customer Experience™** | Journey · support · delight | Empathetic · responsive · warm |
| **Operations™** | Systems · efficiency · scale | Organized · reliable · calm |
| **Research™** | Discovery · analysis | Curious · rigorous · open |
| **Brand™** | Identity · systems · voice | Cohesive · editorial · proud |
| **Automation™** | Workflows · AI operations | Efficient · intelligent · flowing |
| **Analytics™** | Measurement · insight | Analytical · illuminating |
| **Marketplace™** | HQ · sets · creator economy | Aspirational · luxurious · curated |

---

## Department vs Set™ vs Scene™

```
Department™     =  organizational destination (Creative Direction Studio™)
Set™            =  physical built environment (Creative Atelier™)
Scene™          =  navigable workspace inside the Set (Mood Wall Scene™)
```

| Layer | Question it answers |
|-------|-------------------|
| Department™ | *"What business function am I visiting?"* |
| Set™ | *"What does this wing look and feel like?"* |
| Scene™ | *"What specific work happens at this station?"* |

**Source:** [Living Sets™](../world/living-sets.md) · [department-vs-set](../world/department-vs-set.md)

---

## Department Entry

Every department begins with an **Arrival Scene™**.

| Rule | Law |
|------|-----|
| Never expose entire department on entry | Arrival Zone™ · partial sightlines |
| Never spawn from menu alone | Transition™ from headquarters |
| Always acknowledge return visits | Abbreviated re-orientation |

**Source:** [Foundational Experience Systems™ — Arrival Sequence](../foundational-experience-systems/arrival-sequence.md)

---

## Department Continuity

Every department inherits [Headquarters Continuity™](./headquarters-continuity.md):

- Same Orb host behavior (department-aware)
- Same transition grammar (doors · hallways)
- Same material language (luxury editorial baseline)
- Same navigation affordances (walk · pan · station select)
- Same ambient life systems (Idle Life™)

A department may **express** Company Genome™ — it must never **break** Studio World™ continuity.

---

## Department Atmosphere

Each department develops **distinct atmosphere** within unified headquarters:

| Department | Atmosphere keyword |
|------------|-------------------|
| Creative Direction | Editorial atelier |
| Hiring | Collaborative studio |
| Distribution | Launch command center |
| Intelligence | Observatory · library |
| Operations | Command floor |
| Marketing | Living campaign floor |

**Law:** Distinct atmosphere · unified world.

---

## Department Package Relationship

In implementation, departments map to [Department Package™](../engine/department-generator/13_PACKAGE_SPEC.md):

| Package field | Scene Architecture™ mapping |
|---------------|----------------------------|
| `spatial.zones` | Scene inventory (legacy naming — migrating to Scene™) |
| `entryZoneId` | Arrival Scene™ |
| `exitZoneId` | Departure Transition™ |
| `roomDna` | Set™ expression |
| `capabilities` | Workspace affordances |

**Note:** `zones` in department packages are **proto-scenes**. Scene Architecture™ formalizes the vocabulary.

---

## Pilot: Creative Direction Studio™

CDS is the **reference department** — not redesigned in this sprint.

| Scene™ (CDS) | Purpose |
|--------------|---------|
| Arrival Scene™ | Threshold · scale reveal |
| Mood Wall Scene™ | Inspiration · editorial direction |
| Story Table Scene™ | Orb host · creative intent |
| Founder Review Scene™ | Decisions · critique seating |
| Production Pipeline Scene™ | Golden Build™ stages |
| Reference Library Scene™ | Research · volumes |
| Branch Gallery Scene™ | Concept comparison |
| Creative Sandbox Scene™ | Isolated experimentation |
| Golden Build Scene™ | Certification review |

**Source:** [Creative Direction Studio™ V2](../creative-direction-studio/README.md) — implementation exists; philosophy cataloged here.

---

## Forbidden Patterns

| Anti-pattern | Why |
|--------------|-----|
| Department = one page | No scenes · no discovery |
| Department = card dashboard | Software not place |
| Department without arrival | No scale · no ceremony |
| Department without exit transition | Dead end not headquarters |
| Duplicate department for one feature | Feature belongs in scene |

---

## Cross-References

- [scene-framework.md](./scene-framework.md)
- [future-scene-catalog.md](./future-scene-catalog.md)
- [movement-philosophy.md](./movement-philosophy.md)
- [Studio Professionals™](../ecosystem/README.md)
