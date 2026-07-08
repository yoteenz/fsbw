# Generation Queue — Studio Builder™

**Sprint:** Alpha 002  
**Purpose:** Visual production queue — founder watches progress

---

## Queue Surface

Primary view on department production home + collapsible **Build Queue** drawer.

```
CREATIVE DIRECTION STUDIO™ — Project 001

██████████░░░░░░░░░  52%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT              ✓ Complete
ARCHITECTURE             Generating…
FURNITURE                Queued
LIGHTING                 Queued
GLASS SYSTEMS            Queued
ORB                      Queued
MOOD WALL                Queued
PARTICLES                Queued
PANELS                   Queued
AUDIO                    Queued
ANIMATIONS               Queued

Estimated Remaining Time    12 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ Pause Production ]     [ View Full Queue ]
```

---

## Progress Bar Logic

```
percent = (completeGroups + 0.5 * inProgressGroups) / totalGroups * 100
```

| Group state | Counts as |
|-------------|-----------|
| ✓ Complete | 1.0 |
| Generating… / Reviewing… | 0.5 |
| Queued | 0 |
| Locked | excluded from denominator until unlocked |

Asset-level fraction secondary: `12 / 35 Generated` in header.

---

## Group Row Anatomy

```
┌────────────────────────────────────────────────────────────┐
│ ● ARCHITECTURE                          Generating…    ⋮   │
│   ████████░░░░  67%                                        │
│   Shell · Ceiling · Windows · Portals                      │
│   ~4 min remaining                                         │
└────────────────────────────────────────────────────────────┘
```

| Element | Purpose |
|---------|---------|
| Status dot | Color: gray · amber · green · red |
| Group name | Founder vocabulary |
| Sub-assets | Collapsed list · tap expand |
| Mini bar | Optional in-group progress |
| ETA slice | From Generation Manager |
| ⋮ menu | View assets · Regenerate group (if complete) |

---

## Queue Sort Order

Fixed production order — **not** draggable:

1. Environment  
2. Architecture  
3. Lighting  
4. Furniture  
5. Glass Systems  
6. Mood Wall  
7. Orb  
8. Timeline  
9. Panels  
10. Particles  
11. Audio  
12. Animations  
13. Intelligence / Holograms  
14. Runtime Metadata  

Matches dependency engine — see [dependency-unlocking.md](./dependency-unlocking.md).

---

## Status Icons

| Icon | State |
|------|-------|
| ○ Not Started | Unlocked · no job yet |
| ⟳ Preparing… | Ingest + compile |
| 📋 Prompt Ready | Alpha — awaiting copy |
| ⟳ Generating… | Provider or FAL in flight |
| ↑ Awaiting Upload | Alpha — need file |
| ⟳ Reviewing Quality… | Validation |
| ✓ Complete | Approved |
| ⚠ Needs Revision | Failed validation |
| 🔒 Locked | Dependency |
| ↻ Reused | Registry skip |

---

## ETA Calculation

```
remainingMinutes = sum(estimatedMinutes for queued + generating items)
                 × concurrency factor
                 + validation buffer (10%)
```

Display: rounded to nearest minute · updates on state change.

When unknown: `Calculating…` — never blank.

---

## Full Queue View

Expandable timeline — film strip metaphor:

```
001  Environment     ✓━━━━  8 min actual
002  Architecture    ⟳━━━━  ~6 min
003  Lighting        ○━━━━  queued
004  Furniture       🔒━━━
005  Glass           🔒━━━
…
016  Runtime Meta    🔒━━━
```

Horizontal scroll on mobile · vertical on desktop.

---

## Founder Controls on Queue

| Control | Alpha | Future |
|---------|-------|--------|
| Pause Production | ○ | ✓ |
| Resume | ○ | ✓ |
| Prioritize group | ○ | ✓ (within deps) |
| Cancel job | ○ | ✓ |
| Generate All Ready | ○ | ✓ one tap |

Alpha: single-group **Generate** only.

---

## Live Updates

| Event | UI update |
|-------|-----------|
| Group → Complete | Row green · progress bump · unlock animation on next rows |
| New group unlocked | Lock icon fades · Generate button appears |
| Validation fail | Amber pulse · expand validation summary |
| All complete | **Enter Preview Room** CTA |

WebSocket or poll in implementation — spec requires **< 2s** visible latency.

---

## Notification Strip

Below progress bar when active:

```
⟳ Architecture generating — Studio OS is manufacturing shell and ceiling.
```

Single line — rotates with active job.

---

## Empty State

Blueprint complete · zero generated:

```
Your creative headquarters is ready to build.
Start with Environment — the foundation of the room.

[ Generate Environment ]
```

No empty checklist of docs to read.

---

## Complete State

```
████████████████████  100%

All production groups complete.

[ Walk the Room™ ]    [ Enter Preview Room ]
```

---

_Generation queue — the founder watches the lot, not the logs._
