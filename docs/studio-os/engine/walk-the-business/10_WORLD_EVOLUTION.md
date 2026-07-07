# 10 — World Evolution

**Engine Module:** `studio.walk-the-business.v1.world-evolution`  
**Status:** Visible Headquarters growth system  
**Philosophy:** The founder should feel proud watching their business grow.

---

## Design Principle

> The Headquarters should **visibly evolve** — new buildings, department expansions, awards, marketplace installs, new AI employees, project decorations, achievements embedded in the world.

---

## Evolution Signals

| Signal | Visual Expression |
|--------|-------------------|
| **New building** | Construction complete · ribbon moment on walk |
| **Department expansion** | Wing added · new zones online |
| **Award / achievement** | Trophy · plaque · Founder Walk inscription |
| **Marketplace Expansion installed** | New building type appears on lot |
| **New AI employee** | Concierge introduces themselves first walk |
| **Project milestone** | Project artifact decorates relevant department |
| **Revenue tier** | Campus Evolution tier — architecture upgrade |
| **Maturity progression** | Company Maturity Engine unlocks visual tier |

---

## Evolution Event Schema

```yaml
WorldEvolutionEvent:
  eventId: string
  type: enum
  occurredAt: ISO8601
  firstWalkSurfaced: boolean

  spatialChange:
    addedBuildings: string[]
    modifiedDepartments: string[]
    newObjects: WorldObject[]
    removedScaffolding: string[]

  narrative:
    orbAnnouncement: string
    ceremony: string | null
    prideMoment: boolean            # founder acknowledgment encouraged

  campusEvolutionRef: string | null  # link to Campus Evolution Engine
```

---

## First Walk After Evolution

When founder arrives after overnight evolution:

```
Arrival sequence includes:

Orb: "While you were away, the Podcast Production Expansion finished installing.
      The new building is on the east lot — I'll point it out on today's walk."

Camera briefly acknowledges new structure — not full tour unless requested.
```

---

## Achievements as Architecture

Achievements are **not** badge grids:

| Achievement | World Form |
|-------------|------------|
| First launch | Launch plaque in Publishing |
| 100 customers | Customer Experience garden object |
| Marketplace seller | Creator pavilion flag |
| Genome maturity tier | Observatory visualization upgrade |

Integrates with Founder Walk™ · Campus Evolution Engine™.

---

## Pride Without Gamification

| Allowed | Forbidden |
|---------|-----------|
| Visible growth · ceremony · inscription | Points · streaks · leaderboards |
| Orb acknowledgment | Push notifications for badges |
| Organic discovery on walk | Achievement popup modals |

Game design philosophy from Headquarters Engine — meaningful progression · not gamification.

---

## Evolution Memory

```yaml
HeadquartersTimeline:
  companyId: string
  events: WorldEvolutionEvent[]
  currentTier: string
  nextMilestone: MilestonePreview | null
```

Founder: "What changed this month?" → Orb walking timeline at Founder Walk or Observatory.

---

## Relationship to Marketplace

Headquarters Expansions™ install as **buildings** — surfaced on daily walk when new:

> Marketplace Concierge: "The Education Department Expansion is live. First walk-through?"

---

_Next: [11 — Walk Conclusion](./11_WALK_CONCLUSION.md)_
