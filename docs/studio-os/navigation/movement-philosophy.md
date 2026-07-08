# Movement Philosophy™

**Physical Navigation — Not Page Changes**

---

## Purpose

Define how founders **move** through Studio World™ — departments · scenes · workspaces — as physical travel, not software navigation.

---

## Core Law

**Movement should feel physical.**

The founder enters a department · arrives · looks around · moves naturally between scenes.

Transitions feel like walking through **one continuous environment** — not changing webpages.

---

## Movement Hierarchy

| Movement scope | Mechanism |
|----------------|-----------|
| **Studio World™ → Headquarters™** | Arrival · elevator · skybridge |
| **Headquarters™ → Department™** | Transition™ · corridor · door |
| **Department™ entry** | Arrival Scene™ · camera dolly |
| **Scene™ → Scene™** | Walk · pan · orbit · station nav |
| **Scene™ → Workspace™** | Approach object · camera tuck |
| **Department™ → Department™** | Hallway · Transition™ · Orb route |

---

## Allowed Movement Types

| Movement | Use | Source |
|----------|-----|--------|
| **Walk** | Default department exploration | [Transitions™ — Walk](../world/transitions/transition-types.md) |
| **Camera dolly** | Arrival · scene focus | [camera-language](../world/transitions/camera-language.md) |
| **Pan** | Horizontal look (Mood Wall · gallery) | CDS V2 prototype |
| **Orbit** | Inspect object · Story Table | [movement-not-scroll](../creative-direction-studio/movement-not-scroll.md) |
| **Zoom** | Workstation focus (not browser zoom) | Department Runtime™ |
| **Transition™** | Between departments · Sets™ | [Transitions™](../world/transitions/README.md) |
| **Station select** | Mobile · accessibility fallback | Floor nav · zone buttons |
| **Orb route** | "Take me to hiring" | [orb-context-system](./orb-context-system.md) |

---

## Forbidden Movement

| Forbidden | Why |
|-----------|-----|
| Vertical page scroll (room-level) | Webpage behavior |
| Scroll wheel on full scene | Breaks immersion |
| Pinch-zoom entire page | Browser not room |
| Instant teleport without transition | Breaks continuity |
| Browser back as primary nav | Software not headquarters |
| Full department visible on entry | No arrival · no scale |

**Exception:** Internal scroll **inside** a workstation (long reference list · pipeline detail) — permitted.

---

## Arrival Movement

Every department entry follows Arrival Sequence™:

```
1. Transition™ approach (corridor · door)
2. Threshold pause (scale hint)
3. Arrival Scene™ (partial sightlines only)
4. Camera dolly (optional · 2–4s)
5. Orb welcome line
6. Exploration unlock
```

**Source:** [Arrival Sequence™](../foundational-experience-systems/arrival-sequence.md)

Reduced motion: 1s shell + Orb line only.

---

## Inter-Scene Movement

Inside a department:

```
Founder at Scene A
        ↓
Initiates move (walk · nav · Orb)
        ↓
Camera transitions (dolly · pan — not cut)
        ↓
Scene B foreground · Scene A background
        ↓
Workstation available
```

| Platform | Primary | Fallback |
|----------|---------|----------|
| Desktop | Walk · orbit | Station nav |
| Mobile | Horizontal pan · station nav | Swipe between scenes |
| Reduced motion | Station select only | — |

---

## Inter-Department Movement

Founders never feel they "clicked to another app."

| Transition type | When |
|-----------------|------|
| **Executive Corridor™** | Adjacent departments same floor |
| **Elevator™** | Floor change |
| **Skybridge™** | Cross-wing |
| **Gallery Walk™** | Marketplace · showcase path |
| **Portal™** | Deep link · return visit |

**Source:** [Transitions™](../world/transitions/README.md) · [World Streaming™](../world/transitions/world-streaming.md)

Next Set™ streams in while founder moves — **not loaders**.

---

## Movement and World Memory™

| Memory | Effect on movement |
|--------|-------------------|
| Last scene in department | Camera restores on return |
| Last department visited | Abbreviated arrival |
| In-progress workspace | Scene highlights unfinished work |
| Founder Journey™ stage | Transition tone adapts |

---

## Movement Performance (Mobile)

| Rule | Requirement |
|------|-------------|
| GPU-friendly transforms | `translate3d` not layout thrash |
| No blur on movement | iPhone Safari stability |
| Touch targets ≥ 44px | Station nav · objects |
| `prefers-reduced-motion` | Disable dolly · pulse |
| No vertical room scroll | Horizontal pan only |

---

## Prototype Reference

CDS V2 (`CreativeDirectionStudioRoom`) implements:

- 6-scene horizontal camera track
- Arrival-first · progressive unlock
- Floor zone navigation
- No floating pipeline panel

**Philosophy validated · not the final Scene Runtime™.**

---

## Cross-References

- [headquarters-continuity.md](./headquarters-continuity.md)
- [navigation-laws.md](./navigation-laws.md)
- [World Immersion™](../world/world-immersion.md)
