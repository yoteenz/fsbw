# Idle Life™ — System 002

**System:** Idle Life™  
**Status:** Canonical — permanent Studio OS interaction system  
**Pilot:** Creative Direction Studio™ — first establishment  
**Activates:** After Arrival Sequence™ completes

---

## Purpose

Studio OS should **never appear paused**.

The world exists whether or not the founder is interacting.

When the founder stops touching the screen, **headquarters continues living**.

The founder should immediately feel:

> *"This company was already alive before I entered."*

---

## Idle Life Philosophy

| Idle Life Is | Idle Life Is Not |
|--------------|------------------|
| Ambient simulation | Screensaver |
| Subtle continuous motion | Attention-grabbing animation |
| Background intelligence at work | Fake loading indicators |
| Performance-budgeted life | GPU-heavy particle storms |

---

## Standard Idle Behaviors (All Departments)

When founder is not interacting, these behaviors may run — **department expresses which are active**:

| Behavior | Example |
|----------|---------|
| **Orb breath** | Studio Orb™ slowly breathes — vertical sine · glow pulse |
| **Lighting shift** | Subtle warmth drift · section emphasis rotation |
| **Screen rotation** | Monitors cycle through projects · dashboards refresh |
| **Mood Wall transition** | References gently crossfade · new pins appear softly |
| **Particle drift** | Dust · light motes in key beams |
| **Shadow evolution** | Slow sun-angle shift on floor · reflection movement |
| **Ambient audio** | Room tone continues · distant activity texture |
| **AI assistant work** | Concierge subtle activity · document shuffle |
| **Hologram refresh** | Display content updates · data pulse |
| **Door activity** | Occasional portal open · staff pass (background) |
| **Background systems** | Generation queue tick · sync indicators |

**Rule:** Idle behaviors must never block founder interaction when they return.

---

## Creative Direction Studio™ — Idle Life Profile

CDS establishes the **reference idle profile**.

| System | CDS idle spec |
|--------|---------------|
| **Studio Orb™** | 2cm vertical sine · 4s period · genome accent glow · 6s pulse · slow 360° · 120s |
| **Mood Wall™** | Reference crossfade every 45s when 3+ items · soft pin shimmer on active project |
| **Lighting** | Key light warmth ±3% over 90s cycle |
| **Timeline Table** | Event labels subtle highlight rotation |
| **Brief Wall** | Pin edge glow breathe |
| **Particles** | Optional — max 12 motes · alpha only on desktop |
| **Audio** | Room tone 18–22% · no sudden stings |
| **Generation Queue** | Status LED pulse when job active |
| **Concierge** | Background research animation on Library shelf |

### Performance tiers

| Tier | When | Idle density |
|------|------|--------------|
| **Full** | Desktop · Certified™ | All behaviors |
| **Reduced** | Mobile · Golden Build alpha | Orb breath + queue pulse only |
| **Minimal** | `prefers-reduced-motion` | Static ambient · audio optional |

Golden Build alpha: **Reduced tier** until mobile stability confirmed.

---

## Idle vs Active State

```
ACTIVE (founder interacting)
  └─ Idle behaviors at 30% intensity · responsive Orb
IDLE (no touch > 3s)
  └─ Full idle profile · Orb proactive rules throttled
PAUSED (generation job paused by founder)
  └─ Ambient only · no proactive Orb
WALK_THE_ROOM
  └─ Presentation idle — cinematic lighting only
CEREMONY
  └─ Held breath — minimal idle except approval glow
```

---

## Founder Cognitive Load™ Integration

Idle Life must respect founder focus:

| Signal | Idle response |
|--------|---------------|
| Founder reading notes | Reduce proactive Orb · dim non-hero motion |
| Creative time block | Minimal idle · ambient audio only |
| High cognitive load | Shorter Orb proactive interval |
| Return after 24h | One ambient "overnight" storytelling beat |

Max 1 proactive Orb line per 10 min — per [runtime-behaviors](../alpha/runtime-behaviors.md).

---

## Technical Contract (Runtime)

```json
{
  "idleLife": {
    "departmentId": "creative-direction",
    "profileId": "idle-cds-editorial-v1",
    "tier": "reduced",
    "behaviors": [
      { "id": "orb-breath", "enabled": true, "periodMs": 4000 },
      { "id": "mood-wall-crossfade", "enabled": true, "intervalMs": 45000, "minItems": 3 },
      { "id": "lighting-drift", "enabled": false, "reason": "alpha-mobile-stability" },
      { "id": "particles", "enabled": false },
      { "id": "queue-pulse", "enabled": true }
    ],
    "audio": { "ambientLevel": 0.2, "continueWhenIdle": true },
    "respectReducedMotion": true
  }
}
```

---

## Anti-Patterns

| Anti-pattern | Why forbidden |
|--------------|---------------|
| Frozen room when idle | Breaks idle life law |
| Flashing CTAs to "wake up" UI | SaaS pattern |
| Heavy particle systems on mobile | Performance · freeze risk |
| Idle behaviors during arrival | Arrival is scripted — idle starts after unlock |
| Reset animations on every render | Causes jank · infinite loops |

---

## Golden Build™ Requirement

Minimum perceptible idle in Golden Build™:

- Orb breath (CSS-only acceptable in alpha)
- Queue status indication when generating

Full idle profile: **Certified™** tier target.

---

## Cross-References

- [Runtime behaviors Orb idle](../alpha/runtime-behaviors.md)
- [Arrival Sequence™](./arrival-sequence.md) — idle begins after
- [World Persistence™](./world-persistence.md) — idle reflects persisted state
- [Ambient Storytelling™](./ambient-storytelling.md) — idle drives visual story
