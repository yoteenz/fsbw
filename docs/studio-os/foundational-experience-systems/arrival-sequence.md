# Arrival Sequence™ — System 001

**System:** Arrival Sequence™  
**Status:** Canonical — permanent Studio OS interaction system  
**Pilot:** Creative Direction Studio™ — first establishment  
**Predecessor:** None — mandatory for every department entry

---

## Purpose

A founder should **never instantly appear** inside a department.

Every department begins with a **cinematic arrival**.

This is not a loading screen.  
This is an **introduction**.

The founder should feel:

> *"I have arrived."*

Never:

> *"The page loaded."*

---

## Arrival Philosophy

| Arrival Is | Arrival Is Not |
|------------|----------------|
| Threshold crossing | Page paint |
| Cinematic introduction | Spinner · skeleton · progress bar |
| Department personality expression | Generic fade-in |
| Interaction gate | Instant usability |

---

## Standard Arrival Beats (All Departments)

Every department Arrival Sequence™ includes these beats — **timing and expression vary by Room DNA™**:

| # | Beat | Description |
|---|------|-------------|
| 1 | **Departure fade** | Previous department / doorway fades away naturally |
| 2 | **Exterior camera** | Camera begins outside the room |
| 3 | **Doors open** | Entry portal opens automatically |
| 4 | **Glide in** | Camera slowly glides into the space |
| 5 | **Lighting boot** | Architectural lighting powers on section by section |
| 6 | **Audio fade** | Ambient music fades in · environmental sounds begin |
| 7 | **Orb awakening** | Studio Orb™ awakens — pulse · rotate · greet |
| 8 | **Display boot** | Holographic displays · monitors boot · live content appears |
| 9 | **Hero object illuminate** | Department hero object gradually illuminates (CDS: Living Mood Wall™) |
| 10 | **Ambient activation** | Particles · reflections · assistant resume |
| 11 | **Interaction unlock** | THEN interaction becomes available |

**Interaction is blocked until beat 11 completes.**

---

## Creative Direction Studio™ — Arrival Sequence

CDS establishes the **reference arrival** for all future departments.

### Sensory progression

```
Previous space fades
    ↓
Exterior — marble threshold · editorial signage
    ↓
Doors part — warm interior glow visible
    ↓
Camera glide — dolly forward into Creative Direction floor
    ↓
Lighting — ceiling bloom · Mood Wall rim · floor reflection
    ↓
Audio — room tone 0% → 20% · subtle environmental texture
    ↓
Orb — pedestal pulse · 15° rotate toward founder · greeting line
    ↓
Mood Wall — crossfade neutral → project palette · pins illuminate
    ↓
Displays — Brief Wall sequential pin light · Timeline hydrate
    ↓
Particles — subtle dust in key light (optional alpha)
    ↓
ACTIVE — walk · verbs · generate enabled
```

### Duration

| Visit type | Duration | Reference |
|------------|----------|-----------|
| Standard return | 5 seconds | [arrival-experience.md](../alpha/arrival-experience.md) |
| First visit ever | 7 seconds | Extended Orb zone orientation |
| Founder Journey: Legacy | 8+ seconds | Ceremonial · reflective pacing |

### Orb greeting (example)

*"Welcome back to Creative Direction. Your project is loaded — the mood wall remembers where we left off."*

First visit:

*"This is Creative Direction — your brief lives on the left wall, inspiration on the hero wall, and decisions on the timeline. I'm here when you need me."*

---

## Department Uniqueness Law

Every department has its **own unique Arrival Sequence™** reflecting its personality.

| Department | Arrival character |
|------------|-------------------|
| **Creative Direction** | Editorial glide · warm luxury · Mood Wall hero reveal |
| **Discovery** | Curious slow reveal · data streams · map illumination |
| **Production** | Industrial power-on · conveyor hum · status boards activate |
| **Marketing** | Energetic snap-in · campaign reels · bold lighting |
| **Finance** | Measured · precise lighting grid · calm authority |
| **Legal** | Protected · vault door · formal silence breaking |
| **The Archive™** | Soft fade · music shift · reflective Orb |

Uniqueness comes from **Room DNA™ + Department Definition** — not hardcoded per-department code paths.

---

## Technical Contract (Runtime)

```json
{
  "arrivalSequence": {
    "departmentId": "creative-direction",
    "version": "arrival.v1",
    "durationMs": 5000,
    "firstVisitDurationMs": 7000,
    "beats": [
      { "id": "departure-fade", "atMs": 0, "durationMs": 400 },
      { "id": "exterior-camera", "atMs": 400, "durationMs": 600 },
      { "id": "doors-open", "atMs": 1000, "durationMs": 800 },
      { "id": "glide-in", "atMs": 1800, "durationMs": 1200 },
      { "id": "lighting-boot", "atMs": 2400, "durationMs": 1000 },
      { "id": "audio-fade", "atMs": 2600, "durationMs": 1200 },
      { "id": "orb-awaken", "atMs": 3000, "durationMs": 1000 },
      { "id": "hero-illuminate", "atMs": 3400, "durationMs": 1000 },
      { "id": "ambient-activate", "atMs": 4000, "durationMs": 600 },
      { "id": "interaction-unlock", "atMs": 5000, "durationMs": 0 }
    ],
    "blockedVerbs": ["walk", "interact", "generate", "speak"],
    "cameraPreset": "arrival-glide-cds-v1"
  }
}
```

Compiled from Department Package · Room DNA™ · Founder Journey™ stage.

---

## Anti-Patterns

| Anti-pattern | Correct approach |
|--------------|------------------|
| "Loading Creative Direction Studio…" text | Environmental arrival only |
| Skip arrival on return visit | Shorten — never skip |
| Founder spawns at room center | Always enter from portal |
| Interaction available during glide | Block until unlock beat |
| Same arrival for all departments | Unique sequence per package |

---

## Golden Build™ Requirement

Golden Build™ must include a **perceptible arrival** — even alpha-lightweight:

- Minimum: fade from black · 2s glide feel · Orb greeting · interaction unlock
- Full cinematic: all 11 beats per alpha arrival spec

CDS Golden Build current state: **instant entry** — arrival implementation is next experiential gate post-mobile stability.

---

## Cross-References

- [Alpha arrival timing](../alpha/arrival-experience.md)
- [Runtime state machine](../alpha/runtime-behaviors.md) — ASSEMBLING → ACTIVE
- [Animation compiler arrival](../engine/department-generator/09_ANIMATION_COMPILER.md)
- [Idle Life™](./idle-life.md) — begins after arrival completes
