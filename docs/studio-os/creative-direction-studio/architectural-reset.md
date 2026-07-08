# Architectural Reset — Master Specification

**Creative Direction Studio™ V2.0**

---

## Core Law

**The room is the interface.**

Every feature must exist **somewhere physically** in the department. Nothing floats as a card on a webpage.

---

## Reset Declaration

The current implementation at `/admin/studio/department/creative-direction` is a **prototype**.

| Prototype proved | Prototype failed |
|------------------|------------------|
| Founders want immersive creative direction | Card-based pipeline panel |
| Orb + Mood Wall + pipeline concept resonates | Entire room visible at once |
| Generation + review in-room is right direction | Page-scroll web layout |
| Department route pattern works | Dashboard embedded in environment shell |

**This sprint does not iterate the prototype. It replaces the philosophy.**

**V3 evolution:** CDS is now the pilot for [Creative Intelligence Engine™](../creative-intelligence-engine/README.md) — engine-first · generated workspace scenes · prompt pipeline. See [engine-first-roadmap.md](../creative-intelligence-engine/engine-first-roadmap.md).

---

## What CDS Is

| CDS **is** | CDS **is not** |
|------------|----------------|
| A department in Studio World™ | A webpage |
| A playable creative headquarters | A dashboard |
| An actual room the founder enters | Software in a page frame |
| A Set™ with workstations | A card grid |
| Part of a living headquarters | An isolated admin screen |

---

## Architectural Principles

| # | Principle | Law |
|---|-----------|-----|
| 1 | **Room as interface** | Features = furniture · architecture · equipment |
| 2 | **Arrival first** | Never expose entire department immediately |
| 3 | **Spatial hierarchy** | Foreground · midground · background |
| 4 | **Movement not scroll** | Walk · camera · pan · orbit — never page scroll |
| 5 | **Orb as host** | Spatial and emotional anchor |
| 6 | **Environmental life** | Department never static |
| 7 | **World context** | Sense of headquarters beyond walls |
| 8 | **Controls last** | Interactions emerge from environment |

---

## Department Identity

| Property | Value |
|----------|-------|
| **Department ID** | `creative-direction` |
| **Set™** | Creative Atelier™ |
| **Package** | `pkg-creative-direction-golden-v1` |
| **Metaphor** | Pixar creative floor · Apple ID lab · Hollywood stage |
| **Emotional register** | Inspired · curious · creative · powerful · focused · supported |
| **Route** | `/admin/studio/department/creative-direction` |

---

## Zone Architecture (V2)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDIO WORLD™ (beyond walls)                  │
│         hallways · doors · ambient sound · other departments     │
├─────────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                      │
│  Architecture · lighting rigs · windows · displays · shelving    │
├─────────────────────────────────────────────────────────────────┤
│  MIDGROUND                                                       │
│  Mood Wall™ · Timeline Table™ · Pipeline board · Asset Console™  │
├─────────────────────────────────────────────────────────────────┤
│  FOREGROUND                                                      │
│  Story Table™ + Orb™ · Founder Notes desk · Review Area™ seating │
├─────────────────────────────────────────────────────────────────┤
│  ARRIVAL ZONE™ (entry — first visible space only)               │
│  Threshold · partial sightlines · curiosity · scale reveal       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Forbidden Patterns (Prototype Era)

| Anti-pattern | Why rejected |
|--------------|--------------|
| Card grid UI | SaaS · not a room |
| Pipeline panel overlay | Floating software |
| Full room visible on load | No discovery · no scale |
| Vertical page scroll | Webpage behavior |
| Orb in corner decoration | Not host |
| Static environment image | Dead room |
| "Nice UI" as success metric | Wrong benchmark |
| Iterate spacing on cards | Treating symptom not disease |
| Dashboard in department shell | Software embedded in page |

---

## Allowed Patterns (Reset Era)

| Pattern | Reference |
|---------|-----------|
| Arrival Sequence™ | [arrival-experience.md](./arrival-experience.md) |
| Walk · orbit camera | [movement-not-scroll.md](./movement-not-scroll.md) |
| Touch workstation objects | [room-as-interface.md](./room-as-interface.md) |
| Idle Life™ ambient motion | [environmental-life.md](./environmental-life.md) |
| Transitions™ between zones | [Transitions™](../world/transitions/README.md) |
| Creative Direction Pipeline™ at physical board | [Creative Direction Pipeline™](../creative-direction-pipeline/) |

---

## Founder Language Law

| Forbidden founder thought | Required founder thought |
|---------------------------|--------------------------|
| "I'm filling out a form" | "I'm at my creative headquarters" |
| "I'm clicking a dashboard" | "I'm walking the department" |
| "I'm editing software" | "I'm directing production" |
| "Nice UI" (observer) | "Is this a game?" (observer) |

---

## Cross-References

- [room-as-interface.md](./room-as-interface.md)
- [arrival-zone.md](./arrival-zone.md)
- [implementation-strategy.md](./implementation-strategy.md)
- [prototype-lessons.md](./prototype-lessons.md)
