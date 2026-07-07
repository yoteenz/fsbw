# 10 — Animation Engine

**Engine Module:** `studio.department-runtime.v1.animation`  
**Status:** Motion execution specification  
**Parent:** SDK [08 — Motion Standard](../../sdk/08_MOTION_STANDARD.md)

---

## Definition

The **Animation Engine** plays motion profiles, object animations, camera paths, and ceremonies — scaled by Experience DNA and Genome pacing.

> Everything should feel premium — never utilitarian.

---

## Motion Profile Registry

Canonical profiles from SDK 08:

| Profile | Trigger | Skippable |
|---------|---------|-----------|
| `arrival-sequence` | Department entry | After phase 2 |
| `departure-sequence` | Department exit | Yes |
| `approval-ceremony` | approve verb | No |
| `launch-celebration` | output port satisfied | No |
| `timeline-scrub` | scrub verb | Yes |
| `comparison-split` | compare verb | Yes |
| `panel-attach` | panel open | Yes |
| `object-settle` | item placed | Yes |
| `genome-refresh` | Genome update | Yes |
| `zone-focus` | zone change | Yes |
| `loading-ritual` | LOADING state | Yes |

---

## Animation Categories

### Orb Movement

Idle float · listening pulse · speaking glow · thinking rotation · notification bounce — platform-consistent (06).

### Panel Movement

Float bob · slide attach · frost dismiss · expand/collapse.

### Lighting Transitions

Zone focus brighten/dim · ceremony accent activate · Genome refresh crossfade.

### Object Reveals

Scale fade-in on hydrate · shelf slide-out · timeline event pulse.

### Department Arrival / Departure

Coordinated: Camera + Lighting + Audio + Particles + Orb.

### Approval Ceremonies

Station illuminate → asset elevate → stamp → particles → audio — 3–4s.

### Publishing Launch

Hero shift → celebration particles → ceremony camera → audio swell.

### Idle Animation

Mood Wall breathe · glass shimmer · ambient dust — continuous loops.

---

## Animation Execution

```yaml
AnimationRequest:
  profileId: string
  targets: string[]                   # object instanceIds
  parameters:
    pacingScale: number               # from Genome + Experience DNA
    reducedMotion: boolean
  onComplete: callback

AnimationPlayback:
  id: string
  profileId: string
  startedAt: datetime
  duration: number
  status: enum                        # playing | completed | skipped | cancelled
```

---

## Reduced Motion

When `prefers-reduced-motion` or user preference:

- All profiles → `motion-instant`
- Ceremonies → stamp + audio only
- Particles disabled
- Camera → instant preset

---

## Premium Quality Rules

| Rule | Specification |
|------|---------------|
| No linear UI transitions | Environmental motion only |
| Coordinated multi-system | Camera + light + sound sync |
| Interruptible except ceremonies | User click skips |
| Pacing from Genome | 0.7–1.3× duration scale |
| No animation without purpose | Every motion communicates meaning |

---

_Next: [11 — Particle Engine](./11_PARTICLE_ENGINE.md)_
