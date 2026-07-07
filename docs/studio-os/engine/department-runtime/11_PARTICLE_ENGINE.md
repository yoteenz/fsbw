# 11 — Particle Engine

**Engine Module:** `studio.department-runtime.v1.particles`  
**Status:** Atmospheric particle specification  
**Parent:** SDK [07 — Visual Language](../../sdk/07_VISUAL_LANGUAGE.md)

---

## Definition

The **Particle Engine** renders atmospheric, environmental, interactive, and ceremonial particle systems defined in package `particles/*.json`.

---

## Particle Categories

| Category | Examples | Intensity |
|----------|----------|-----------|
| **Floating dust** | Ambient depth motes | Very subtle |
| **Glass reflections** | Shimmer on glass interaction | Brief |
| **Ambient particles** | Hero zone atmosphere | Continuous low |
| **Celebration particles** | Approval, launch bursts | Medium, 2–3s |
| **Environmental** | Light motes at anchors | Subtle |
| **Interactive** | Spark on verb feedback | 0.5s |
| **Genome-driven** | Color from colorPrinciples | Genome injection |

---

## Particle System Schema

```yaml
ParticleSystem:
  id: string
  emitterPosition: Vector3            # zone anchor
  maxParticles: number
  lifetime: number
  velocity: Vector3
  colorSlot: null                     # Genome fills at injection
  density: number                     # Experience DNA scaled
  enabled: boolean
  category: string
```

---

## Runtime Behavior

| State | Particles |
|-------|-----------|
| LOADING | Dormant |
| ASSEMBLING | Dormant |
| ACTIVE | Ambient enabled |
| Ceremony | Burst + ambient duck |
| BACKGROUND | Paused |
| Reduced motion | All disabled |

---

## Performance

| Rule | Limit |
|------|-------|
| Max visible particles | 50 department-wide |
| Max systems active | 5 |
| GPU budget | Low — particles yield to geometry |
| Mobile | Density × 0.5 |

---

## Genome Injection

`colorSlot` filled from `colorPrinciples` + `brandEmotions` at injection (13). Celebration particles may use `signatureAnimations`.

---

_Next: [12 — Audio Engine](./12_AUDIO_ENGINE.md)_
