# World Streaming™

**Continuous headquarters — never a page load**

---

## Purpose

The founder should **never feel like pages are loading**.

Studio World™ **streams** experiences naturally — the illusion of one continuous headquarters must never break.

---

## The Streaming Promise

| Forbidden | Required |
|-----------|----------|
| Full-screen loader | Corridor · elevator · bridge visible |
| Fade to black | Environmental handoff |
| Spinner | Ambient motion continues |
| "Loading…" copy | Orb contextual guidance |
| Route swap freeze | Founder keeps moving |
| Blank white flash | Shell geometry immediate |

**Transitions are not loaders.** World Streaming™ is the umbrella policy; [Transitions™ world-streaming](./transitions/world-streaming.md) is the movement-layer implementation.

---

## Streaming Layers

```
LAYER 4 — INTERACTIVE
    Full Set™ interactivity when destination ready

LAYER 3 — CONTENT
    Objects · textures · hero assets · audio stems

LAYER 2 — SHELL
    Architecture · lighting rig · collision · signage

LAYER 1 — PRESENCE
    Camera path · transition geometry · Orb · ambient life
```

Founder always occupies **Layer 1+** minimum. Never zero layers.

---

## Proximity Activation Model

As the founder walks the lot:

| Distance | Set™ state | Behavior |
|----------|------------|----------|
| **Inside** | Active | Full interactivity · Idle Life™ · audio |
| **Adjacent** | Warm | Shell + key objects · reduced life |
| **Nearby** | Dormant | Shell cached · no simulation |
| **Distant** | Cold | Map node only · no GPU |
| **In transition** | Streaming | Destination warms along path |

```
        [Distant: cold]
              │
    [Nearby: dormant cache]
              │
    [Adjacent: warm shell]
              │
    ═══ TRANSITION PATH ═══
              │
    [ACTIVE SET™ ← founder here]
```

---

## Transition-Buffered Loading

During [Transitions™](./transitions/README.md):

1. **T+0ms** — Transition shell visible (corridor mesh / elevator cab)
2. **T+0–300ms** — Destination **Layer 2** streams behind door / viewport
3. **T+mid-journey** — Orb delivers contextual line (masks latency)
4. **T+arrival** — Layer 4 interactive when threshold crossed
5. **T+post** — Arrival Sequence™ beat (if Certified™)

Generation jobs continue during transit — [World Persistence™](../foundational-experience-systems/world-persistence.md).

---

## Priority Queue

| Priority | Asset class |
|----------|-------------|
| P0 | Transition shell · camera · lighting |
| P1 | Destination shell · signage |
| P2 | Hero object · Orb context |
| P3 | Secondary props · ambient NPCs |
| P4 | Distant wing previews |
| P5 | Optional narration stems |

Founder path **always wins** over background prefetch.

---

## Bandwidth & Device Tiers

| Tier | Policy |
|------|--------|
| **Desktop** | Full warm adjacent Sets™ |
| **Mobile** | Active + transition only; adjacent on-demand |
| **Reduced motion** | Static shell path · skip parallax stream |
| **Low bandwidth** | Shell + hero only; defer P3+ |

Golden Build™ mobile constraints apply until Certified™ performance gates pass.

---

## Failure Recovery

| Failure | Recovery |
|---------|------------|
| Destination shell timeout | Continue transition · Orb acknowledges · retry Layer 2 |
| Hero asset fail | Set™ live with placeholder hero · queue regen |
| Mid-transition disconnect | [World Memory™](./world-memory.md) resume |
| Partial cache corrupt | Cold fetch · never black screen |

Never show error spinner in corridor — errors are **environmental** (flickering light · Orb explanation).

---

## Relationship to Department Runtime™

| Runtime responsibility | Streaming responsibility |
|------------------------|-------------------------|
| Assemble active Set™ package | Decide *when* to assemble |
| Object manager · interactions | Proximity activation |
| Performance budgets | Tier downgrade |

Studio World™ orchestrates **when** Runtime loads — Runtime executes **what** loads.

---

## Metrics (Certified™ Gates)

| Metric | Target |
|--------|--------|
| Time to walkable shell | < 300ms perceived |
| Black frames per navigation | 0 |
| Spinner displays | 0 |
| Interactive destination after transition | < Certified™ Set™ SLA |
| Mobile adjacent prefetch | 0 mandatory (optional) |

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| `React.Suspense` fullscreen fallback | Breaks continuous world |
| Await all assets before showing corridor | Violates streaming promise |
| Unload origin Set™ before transition starts | Visual pop |
| Load entire HQ on boot | Violates proximity model |

---

## Cross-References

- [Transitions™ — world-streaming.md](./transitions/world-streaming.md)
- [movement-system.md](./transitions/movement-system.md)
- [headquarters-engine.md](./headquarters-engine.md)
- [future-roadmap.md](./future-roadmap.md)
