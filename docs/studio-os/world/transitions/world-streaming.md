# World Streaming™ — Continuous Headquarters Illusion

**Version:** 1.0.0  
**Status:** Canonical (docs only)

---

## Purpose

**World Streaming™** ensures the next Set™ **loads while the founder continues moving** — no freeze · no black fade · no spinner.

The illusion of **one continuous Headquarters** must never break.

---

## Core Law

> The founder continues moving while the next Set™ streams in naturally.

Transitions are **not loaders**. Streaming is **invisible infrastructure** supporting cinematic travel.

---

## Streaming Model

```
Transition begins (founder in motion)
    ↓
T+0ms: Source Set™ begins exit choreography
    ↓
T+preloadAtMs: Begin prefetch destination Set™ package
    ↓
T+journey: Corridor/elevator geometry visible (lightweight shell)
    ↓
T+streamDuring: Destination Set™ atmosphere + shell stream behind threshold
    ↓
T+handoffAtMs: Destination Set™ merges · lighting handoff complete
    ↓
T+end: Set Arrival Sequence™ final beats · ACTIVE
```

Founder **never sees** empty void or loading chrome.

---

## Streaming Tiers

| Tier | When | Technique |
|------|------|-----------|
| **Shell-first** | Alpha · mobile | Atmosphere · floor · threshold · zones placeholder |
| **Object-stream** | Golden Build+ | Hero object + critical interactives |
| **Full-stream** | Certified™ | Full asset manifest · Idle Life hooks |
| **Predictive** | Live™ + ML | Preload likely next Set from Adaptive Walk™ |

Alpha Golden Build: **Shell-first** minimum.

---

## Prefetch Strategy

| Signal | Preload |
|--------|---------|
| Founder selects destination | Target Set™ package |
| Adaptive Walk™ route planned | Full route Set chain |
| Repeat daily path | Cache hot Set shells |
| HQ entry | Likely first Set of day |

Prefetch uses `department-package` + Set DNA™ — department-agnostic.

---

## Corridor Shell (Transition Geometry)

During journey, render **lightweight transition geometry**:

| Element | Weight |
|---------|--------|
| Corridor mesh / CSS perspective | Low |
| Lighting handoff shader | Low |
| Signage textures | Low |
| Background activity sprites | Minimal |
| Audio crossfade | Low |

**No** full destination Set during mid-corridor — only approach threshold.

---

## Failure Handling

| Failure | Founder experience |
|---------|-------------------|
| Prefetch slow | Extend corridor beat · Orb contextual line · never spinner |
| Asset missing | Degrade to Set shell · regenerate async |
| Network offline | Cached last-known Set shell · queue sync later |

**Never** show error modal mid-corridor — environmental degrade only.

---

## Relationship to Generation Queue

| Queue state | Streaming behavior |
|-------------|-------------------|
| Job generating at destination | Console pulse visible on arrival · not blocking transition |
| Job complete | Preview slot illuminated on arrival |
| Job failed | Orb brief on approach · retry in Set |

Generation continues during transition — World Persistence™.

---

## Technical Contract

```json
{
  "worldStreaming": {
    "transitionId": "creative-to-discovery-glass-hallway",
    "preloadAtMs": 1500,
    "prefetchTargets": ["discovery-lab-v1"],
    "streamDuring": true,
    "handoffAtMs": 6000,
    "tier": "shell-first",
    "fallback": "extend-corridor-2000ms",
    "forbiddenUI": ["spinner", "progress-bar", "fade-to-black"]
  }
}
```

---

## Performance Budget (Mobile Alpha)

| Budget | Limit |
|--------|-------|
| Transition total duration | ≤12s default |
| Concurrent DOM layers | Minimal |
| Prefetch payload | Shell only · no hero images |
| Animation | CSS transform only |
| Audio | Single crossfade track |

Aligns with Golden Build stability requirements.

---

## Anti-Patterns

| Anti-pattern | Correction |
|--------------|------------|
| `Suspense` fallback spinner | Corridor shell hold |
| Route `lazy()` visible gap | Prefetch before navigation |
| Await `fetch()` before animate | Animate first · hydrate |
| White flash between views | Atmosphere color match handoff |

---

## Cross-References

- [Movement system](./movement-system.md)
- [Transition philosophy](./transition-philosophy.md)
- [Department package](../../../src/studio-os-core/department-package/)
