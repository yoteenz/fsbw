# Movement Not Scroll™

**The department never scrolls vertically**

---

## Purpose

Eliminate **webpage scroll behavior** from Creative Direction Studio™.

Movement comes from **walking · camera · panning · orbiting · zooming · transitioning · opening workstations** — like a game environment.

---

## Core Law

**The room itself NEVER scrolls vertically.**

Only specific workstations may contain **internal** scrolling (e.g., long reference list on Library terminal).

---

## Allowed Movement Types

| Movement | Use |
|----------|-----|
| **Walk** | Default — founder advances through Arrival Zone™ into department |
| **Camera dolly** | Arrival Sequence™ · transitions between zones |
| **Pan** | Look left/right at Mood Wall · gallery |
| **Orbit** | Circle Story Table™ · inspect Timeline |
| **Zoom** | Focus workstation (not browser zoom) |
| **Transition™** | Door to hallway · adjacent zone |
| **Open workstation** | Approach Asset Console — local camera tuck |

---

## Forbidden Movement

| Forbidden | Why |
|-----------|-----|
| Page vertical scroll | Webpage · not room |
| Scroll wheel on room | Breaks immersion |
| Scrollable div over full scene | Dashboard pattern |
| Pinch-zoom entire page | Browser behavior |
| Jump cut without transition | Breaks World Streaming™ |

---

## Camera System (Conceptual)

```typescript
interface DepartmentCamera {
  mode: 'arrival' | 'walk' | 'orbit' | 'workstation' | 'review-seat';
  position: Vector3;
  target: Vector3;
  fov: number;
  constraints: {
    minYaw: number;
    maxYaw: number;
    minPitch: number;
    maxPitch: number;
    noPageScroll: true;  // mandatory
  };
}
```

| Mode | When |
|------|------|
| `arrival` | Entry · limited yaw |
| `walk` | Default exploration |
| `orbit` | Inspect object · Mood Wall |
| `workstation` | Locked to Asset Console · Pipeline board |
| `review-seat` | Seated Review Area™ |

---

## Workstation Internal Scroll

| Workstation | Internal scroll allowed |
|-------------|------------------------|
| Reference Library™ terminal | Yes — catalog list |
| Asset Console™ detail pane | Yes — asset metadata |
| Pipeline board | No — physical pan if overflow |
| Mood Wall™ | No — pan camera along wall |
| Room itself | **Never** |

---

## Mobile Consideration

Mobile-first project — movement on phone:

| Input | Maps to |
|-------|---------|
| Swipe horizontal | Pan / walk strafe |
| Swipe vertical | **Camera pitch or walk forward** — NOT page scroll |
| Tap object | Approach workstation |
| Two-finger | Orbit (optional) |

Prototype's vertical scroll on iPhone = **explicit bug** under this spec.

---

## Relationship to Transitions™

Zone changes use [Transitions™](../world/transitions/README.md) — corridor steps · not scroll.

Walking from Arrival Zone™ to Pipeline board = **camera move through space**.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| `overflow-y: scroll` on room root | Forbidden |
| Sticky header over scene | Web chrome |
| Scroll to pipeline panel | Software not walk |

---

## Cross-References

- [arrival-zone.md](./arrival-zone.md)
- [room-as-interface.md](./room-as-interface.md)
- [runtime-behaviors](../alpha/runtime-behaviors.md)
