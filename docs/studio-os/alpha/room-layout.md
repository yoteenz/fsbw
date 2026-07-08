# Room Layout — Creative Direction Studio™ Alpha

**Discipline owners:** Level design · Environment art · Technical art  
**Envelope:** 18m × 12m · 120m² · Stage template · double-height hero

---

## Level Design Intent

This layout is a **stage set** — composed for camera exploration, not menu navigation. Every zone is a **destination** the founder walks to.

Topology is **fixed across all companies**. Materials and light vary by Genome.

---

## Top-Down Layout

```
                    N (Mood Wall / Hero)
    ┌─────────────────────────────────────────────────────────────┐
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ LIVING MOOD WALL ™ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    │                                                             │
W   │  ┌──────────┐                              ┌────────────┐ │   E
E   │  │ BRIEF    │         TIMELINE TABLE ™      │ REFERENCE  │ │   A
S   │  │ WALL ™   │    ┌─────────────────────┐   │ LIBRARY ™  │ │   S
T   │  │          │    │   glass · branches  │   │  + glass   │ │   T
    │  │ pin rails│    └─────────────────────┘   │  exterior  │ │   │
    │  └──────────┘              │                └────────────┘ │   │
    │       ┌────────┐           │    SANDBOX ™                   │   │
    │       │GENOME  │           │    (behind table)              │   │
    │       │OBSERV ™│     ┌────┴────┐                           │   │
    │       └────────┘     │  ORB    │  BRANCH COMPARE ™         │   │
    │                      │ PEDESTAL│  (screen · right)         │   │
    │                      └─────────┘                           │   │
    │  ┌────────┐   INSPIRATION DROP ™   ┌──────────────────┐  │   │
    │  │ ENTRY  │                        │ FOUNDER REVIEW ™ │  │   │
    │  │ PORTAL │                        │ approval pedestal│  │   │
    │  └────────┘                        └──────────────────┘  │   │
    │                                          ┌──────────┐   │   │
    │                                          │  EXIT    │   │   │
    │                                          │  PORTAL  │   │   │
    │                                          └──────────┘   │   │
    └─────────────────────────────────────────────────────────────┘
                    S (Entry / Departure edge)
```

---

## Zone Registry

| Zone ID | Display Name | Type | Footprint | Hero? |
|---------|--------------|------|-----------|-------|
| `arrival-threshold` | Arrival Zone | entry | 2×3m | — |
| `brief-wall` | Creative Brief Wall™ | secondary | left wall 3.5×6m | — |
| `mood-wall` | Living Mood Wall™ | **hero** | full width × 6.5m height | ✓ |
| `observatory` | Company Genome Observatory™ | secondary | alcove 3×2.5m | — |
| `timeline-table` | Project Timeline Table™ | primary | 4×1.2m glass | — |
| `sandbox` | Creative Sandbox™ | secondary | 3×2m behind table | — |
| `branch-comparison` | Branch Comparison Area™ | secondary | compare screen zone | — |
| `reference-library` | Reference Library™ | secondary | right flank shelves | — |
| `founder-review` | Founder Review Area™ | primary | pedestal + clearance | — |
| `orb-command` | Orb Command Center™ | orb | pedestal 1m dia | — |
| `departure-threshold` | Exit → Discover | exit | 2×3m | — |

---

## Sightlines from Entry

| Look direction | Primary visual |
|----------------|----------------|
| Forward-center | Mood Wall — 70% of vertical FOV at hero camera |
| Left 30° | Brief Wall pin rails — brass catch light |
| Right 30° | Glass exterior + Library shelves |
| Up 15° | Coffered ceiling · diffused panel |
| Down | Polished floor reflection — depth |

---

## Vertical Section (East-West Cut)

```
    6.5m ┤     ╭── double volume hero ──╮
         │     │    MOOD WALL full height │
    4.0m ┤     │                          │    standard ceiling
         │     │                          ├────────────────
    3.2m ┤─────┴──────────────────────────┘
         │  floor ───────────────────────── reflection
    0.0m ┤
```

Hero zone only at Mood Wall bay. Work zones at standard 3.2m — intimate scale for table work.

---

## Walkable Volume

| Area | Walk | Notes |
|------|------|-------|
| Main floor | ✓ | Full envelope minus furniture collision |
| Timeline Table surface | ✗ | Interact across · not on top |
| Sandbox | ✓ | Approach from table rear |
| Observatory alcove | ✓ | Single-founder intimacy |
| Pedestal | ✗ | Orbit only |
| Mood Wall | ✗ | Scrub via camera · not physical walk-through |
| Entry/Exit portals | ✓ | Threshold triggers only |

**Nav mesh:** Continuous · no invisible walls except object collision.

---

## Object Anchors (World Space)

Normalized origin: room center at (0, 0, 0). +Z toward Mood Wall.

| Object | Approx position (x, y, z) | Anchor |
|--------|---------------------------|--------|
| Entry Portal | (-7, 0, -5) | floor |
| Mood Wall | (0, 3, 6) | wall-center |
| Brief Wall | (-8, 2, 2) | wall-center |
| Timeline Table | (0, 0.75, 1) | floor-center |
| Orb Pedestal | (2, 0, 0) | floor |
| Observatory | (-6, 0, 4) | alcove platform |
| Library | (7, 0, 2) | wall-mounted |
| Approval Pedestal | (4, 0, -3) | founder-review |
| Exit Portal | (6, 0, -5) | floor |
| Inspiration Drop | (-2, 0, -2) | floor zone |

Exact transforms ship in `scene-assembly-blueprint.md` — layout doc defines **relationships**, not millimeter CAD.

---

## Camera Exploration Paths

| Path ID | Route | Use |
|---------|-------|-----|
| `arrival` | Entry → hero → primary | First entry |
| `brief-focus` | Primary → orbit left | Brief work |
| `mood-immerse` | Primary → hero hold | Inspiration |
| `sandbox-reveal` | Primary → pull back | Branch isolation |
| `observatory-intimate` | Primary → alcove | Genome inspect |
| `approval-ceremony` | Wide elevated → pedestal | Founder approve |
| `walk-the-room` | Sequential zone markers | Critique |
| `departure` | Review → exit portal | Leave to Discover |

---

## Collision & Interaction Radii

| Zone | Interaction radius | Multi-user (future) |
|------|-------------------|---------------------|
| Mood Wall | 4m approach | 1 founder focus |
| Timeline | 2m surround | 1 active scrub |
| Orb | 3m speak | 1 conversation |
| Brief Wall | 2m pin reach | — |
| Library | 2m browse | — |

Alpha: single-founder session only.

---

## Scale Reference

Human eye height: **1.65m** equivalent.  
Timeline Table surface: **0.75m** — comfortable lean.  
Mood Wall pin height band: **1.2–4.5m** — reach + gaze.  
Orb center: **1.4m** — eye contact height.

All furniture sized for **one founder + Orb** — not conference room for twelve.

---

## Layout Golden Rule

> Walking from Entry to Mood Wall to Timeline to Orb must feel like **crossing a designed set** — never like scrolling a page.

Pass: Continuous floor · no teleport tabs.  
Fail: Zone jump without camera travel.

---

_Room layout — the stage blocking for Creative Direction._
