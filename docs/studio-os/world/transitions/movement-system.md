# Movement System™ — Travel & World Continuity

**Version:** 1.0.0  
**Status:** Canonical (docs only)

---

## Purpose

Define how founders **move** through Headquarters during Transitions™ — speed · continuity · input · persistence.

Movement is **travel** — not navigation.

---

## Movement Principles

| Principle | Rule |
|-----------|------|
| **Continuous motion** | Founder or camera always in motion during transition |
| **World never pauses** | Idle Life™ continues at reduced or full intensity |
| **No freeze frame** | Ever |
| **Speed matches context** | Walk vs elevator vs gallery — DNA-driven |
| **Input optional** | Founder may cancel to destination on repeat routes (future) |
| **Persistent state** | Position in HQ graph saved |

---

## Movement Speed Profiles

| Profile ID | Use | Feel |
|------------|-----|------|
| `editorial-walk` | Walk™ · Glass Hallway™ | Calm purposeful |
| `executive-walk` | Executive Corridor™ | Measured authority |
| `gallery-pace` | Gallery Walk™ | Slow reflective |
| `elevator-standard` | Elevator™ | Smooth vertical |
| `elevator-panoramic` | Panoramic Elevator™ | Slower · vista |
| `skybridge-walk` | Skybridge™ | Elevated breeze |
| `crisis-urgent` | Crisis™ modifier | 15% faster · tighter |
| `legacy-ceremonial` | Legacy journey | 20% slower |

---

## Founder Input During Transition

| Phase | Input |
|-------|-------|
| **Journey** | Optional look-around (future) · no mandatory |
| **Repeat route** | Optional skip-to-threshold (with shortened arrival) |
| **Cancel** | Not allowed mid-security checkpoint |

Alpha: **passive travel** — founder watches journey complete.

---

## World Continuity During Movement

While founder travels, headquarters **continues**:

| System | Behavior during transition |
|--------|---------------------------|
| **Idle Life™** | `continue` — default |
| **Background staff** | Ambient animation loops |
| **Doors** | Open/close in corridor |
| **Elevators** | Other cabs move (background) |
| **Displays** | Tick updates |
| **Lights** | Section handoff |
| **Generation queue** | Jobs progress |
| **Audio** | Crossfade — never silence gap |

`idleLifeDuring: pause` is **forbidden**.

---

## Headquarters Graph Position

Founder position on HQ graph persists:

```json
{
  "headquartersPosition": {
    "currentSetId": "discovery-lab-v1",
    "previousSetId": "creative-atelier-v1",
    "lastTransitionId": "creative-to-discovery-glass-hallway",
    "graphNode": "creative-wing.discovery-lab",
    "visitedAt": "ISO8601"
  }
}
```

Return visits may restore **last Set™** or **entry plaza** — configurable per Founder Journey™.

---

## Adaptive Walk™ Integration

Adaptive Walk™ selects **route** across transition graph:

| Input | Output |
|-------|--------|
| Pending approvals | Route via relevant Set™ |
| Orb suggestion | Detour transition |
| Founder Journey stage | Pace + transition type preference |
| Crisis state | Shortest path · urgent Orb |

Movement system executes chosen path — Adaptive Walk plans it.

---

## Mobile Movement Tier

| Tier | Expression |
|------|------------|
| **Full** | Camera path + parallax corridor |
| **Reduced** | Horizontal scene pan simulating walk |
| **Minimal** | Quick environmental crossfade + Orb line (repeat routes only) |

Stability gate: Reduced tier in alpha.

---

## Anti-Patterns

| Anti-pattern | Correction |
|--------------|------------|
| `display: none` swap between routes | Stream next Set during motion |
| `pointer-events: none` freeze | Motion continues |
| Wait for API before moving | Stream Set shell · hydrate async |
| Reset queue on transition | World Persistence™ |

---

## Cross-References

- [World streaming](./world-streaming.md)
- [Transition DNA](./transition-dna.md)
- [Idle Life™](../../foundational-experience-systems/idle-life.md)
