# 08 — Navigation Engine

**Engine Module:** `studio.department-runtime.v1.navigation`  
**Status:** Spatial travel specification  
**Parent:** SDK [12 — World Routing](../../sdk/12_WORLD_ROUTING.md)

---

## Definition

The **Navigation Engine** manages movement between zones within a department and travel between departments in Headquarters. Departments are **locations** — navigation is physical travel.

---

## Navigation Modes

| Mode | ID | Experience |
|------|----|------------|
| **Walk** | `walk` | Exit portal → transit → entry portal (default) |
| **Quick Travel** | `quick` | World map select → abbreviated transit |
| **Return** | `return` | Last visited or origin department |
| **Orb Dispatch** | `orb` | Voice/command confirmed travel |
| **Deep Link** | `deep-link` | Arrival only — skip transit |
| **Zone Walk** | `zone` | Camera orbit within department |

---

## Intra-Department Navigation

```
User in primary zone → wants secondary zone
    → Camera System: orbit to secondary preset
    → Audio: subtle environmental shift
    → Zone focus: lighting dim inactive 20%
    → Duration: motion-standard (Experience DNA scaled)
```

No tab switching — camera travel only.

---

## Inter-Department Travel Pipeline

```
Phase 1: DEPARTURE
    Current department → UNLOADING or BACKGROUND
    Departure camera → exit portal
    Exit animation (Animation Engine 10)
    Audio crossfade out

Phase 2: TRANSIT
    Corridor / world map / brief flash
    1–3 seconds (mode dependent)
    Breadcrumb update

Phase 3: ARRIVAL
    Target department → LOADING or resume from BACKGROUND
    Entry portal materialize
    Arrival sequence (Camera + Animation + Audio)
    Orb acknowledgment
    State → ACTIVE
```

---

## Department History

```yaml
NavigationHistory:
  entries:
    - departmentId: string
      buildingId: string
      arrivedAt: datetime
      departedAt: datetime | null
      entryMethod: string
  lastVisited: string
  origin: string                    # department that sent work here
  returnStack: string[]             # for "go back"
```

Max history: 50 entries per session.

---

## Breadcrumbs

Informational overlay — not primary navigation:

```
HEADQUARTERS → CREATIVE WING → CREATIVE DIRECTION
```

Click triggers quick travel — not page load.

---

## Connection Indicators

Exit portal shows linked departments from anatomy `connections`:

| Connection Type | Visual |
|-----------------|--------|
| workflow | Directional corridor lighting |
| reference | Doorway + thumbnail |
| approval | Formal portal + seal |
| asset-handoff | Conveyor glow when output ready |

---

## Navigation Events

| Event | Emitted |
|-------|---------|
| `departure-started` | Phase 1 |
| `transit` | Phase 2 |
| `arrival-started` | Phase 3 |
| `arrival-complete` | ACTIVE |
| `zone-changed` | Intra-department |

Consumed by State Manager, Orb, Concierge, Event Bus.

---

## Integration

| Subsystem | Role |
|-----------|------|
| Camera System (09) | Arrival/departure/zone cameras |
| Animation Engine (10) | Portal animations |
| Audio Engine (12) | Crossfade |
| Orb Runtime (06) | Dispatch |
| Marketplace Runtime (17) | New destinations after install |

---

_Next: [09 — Camera System](./09_CAMERA_SYSTEM.md)_
