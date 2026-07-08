# Camera Language™ — Transition Choreography

**Version:** 1.0.0  
**Status:** Canonical cinematography spec (docs only)

---

## Purpose

**Camera choreography** is how the founder's point of view moves during Transitions™.

Camera language makes travel feel **physical** — dolly · glide · elevator rise · vista pan — never DOM swap.

---

## Camera Principles

| Principle | Rule |
|-----------|------|
| **Continuous motion** | No hard cuts during transition |
| **Founder eye height** | Default ~1.6m walk perspective |
| **Ease luxury** | Editorial ease-in-out — not linear UI slide |
| **Destination foreshadow** | Destination visible or implied before arrival |
| **No snap** | Camera never teleports |
| **Handoff to Set arrival** | Transition camera flows into Arrival Sequence™ final beats |

---

## Preset Catalog

| Preset ID | Use | Motion |
|-----------|-----|--------|
| `exterior-approach-plaza` | Arrival™ into HQ | Slow push toward threshold |
| `corridor-dolly-standard` | Walk™ | Forward dolly · door pass |
| `glass-corridor-vista-dolly` | Glass Hallway™ | Dolly + slight pan to vista |
| `elevator-interior-rise` | Elevator™ | Vertical rise · floor ticks |
| `panoramic-elevator-exterior` | Panoramic Elevator™ | Rise + exterior panorama |
| `skybridge-elevated-walk` | Skybridge™ | Elevated forward · wind light |
| `executive-corridor-formal` | Executive Corridor™ | Slower · wider framing |
| `security-approach-scan` | Security Checkpoint™ | Stop · scan beat · unlock |
| `gallery-slow-pass` | Gallery Walk™ | Lateral pass exhibits |
| `innovation-tunnel-forward` | Innovation Tunnel™ | Accelerating forward |
| `set-arrival-glide` | Set entry finale | Glide through doors into Set |
| `portal-dimensional` | Portal™ (reserved) | TBD |

---

## Camera Phases (Generic Transition)

```
Phase 1 — DEPARTURE (0–15%)
  Camera begins in source Set™ context · begins exit vector

Phase 2 — JOURNEY (15–75%)
  Transition-type choreography · corridor · elevator · bridge

Phase 3 — APPROACH (75–90%)
  Destination threshold visible · lighting shift begins

Phase 4 — HANDOFF (90–100%)
  Merge into Set Arrival Sequence™ final glide · interaction lock until complete
```

---

## Duration vs Camera Speed

| Transition type | Typical duration | Camera feel |
|-----------------|------------------|-------------|
| Walk™ | 3–8s | Steady editorial walk |
| Glass Hallway™ | 5–10s | Walk + vista pause |
| Elevator™ | 5–12s | Vertical · interior |
| Gallery Walk™ | 10–20s | Slow ceremonial |
| Skybridge™ | 8–15s | Elevated purposeful |

Founder Journey™ **Legacy** stage: multiply duration ×1.2 · slower easing.

---

## Mobile Camera Tier

| Tier | Expression |
|------|------------|
| **Full** | 3D perspective camera path |
| **Reduced** | 2D parallax scroll · lateral pan (alpha) |
| **Minimal** | Environmental crossfade with forward motion cue |

Alpha Golden Build: **Reduced tier** until stability confirmed.

---

## Relationship to Arrival Sequence™

Set **Arrival Sequence™** camera is the **terminal phase** of the transition into that Set™:

```
Transition camera (corridor/elevator)
    ↓
Set threshold
    ↓
Arrival Sequence camera (glide · lighting boot · Orb)
    ↓
ACTIVE — founder control
```

---

## Technical Contract (Future)

```json
{
  "cameraChoreography": {
    "presetId": "glass-corridor-vista-dolly-v1",
    "phases": [
      { "id": "departure", "startPct": 0, "endPct": 15, "easing": "luxury-ease-in" },
      { "id": "journey", "startPct": 15, "endPct": 75, "easing": "linear-walk" },
      { "id": "approach", "startPct": 75, "endPct": 90, "easing": "luxury-ease-out" },
      { "id": "handoff", "startPct": 90, "endPct": 100, "handoffTo": "arrival-glide-creative-atelier" }
    ],
    "founderControlLocked": true
  }
}
```

---

## Anti-Patterns

| Anti-pattern | Correction |
|--------------|------------|
| Instant route render | Camera departure phase required |
| Camera jump cut at Set boundary | Handoff phase required |
| Fixed camera during elevator | Vertical motion required |
| Motion sickness speed | Cap acceleration · respect reduced motion |

---

## Cross-References

- [Transition types](./transition-types.md)
- [Arrival system](./arrival-system.md)
- [Movement system](./movement-system.md)
- [Alpha arrival cameras](../../alpha/arrival-experience.md)
