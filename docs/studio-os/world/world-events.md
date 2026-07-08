# World Events™

**Surprises that prove the headquarters is alive**

---

## Purpose

The Headquarters should **occasionally surprise** the founder — earned moments that feel like the world noticed something real.

World Events™ are **one-shot or short-lived experiences** that may trigger [World States™](./world-states.md) but are distinct: they are **narrative beats**, not atmosphere profiles.

---

## Philosophy

| World Events™ are | World Events™ are not |
|-------------------|----------------------|
| Earned · data-driven | Random gamification |
| Spatial · environmental | Toast notifications only |
| Memorable | Noisy · constant |
| Optional to engage | Blocking modals |
| Part of company story | Generic confetti on every click |

The world should feel **alive** — not **alarmist**.

---

## Canonical Event Types

| Event | Trigger | Experience |
|-------|---------|------------|
| **Golden Build Completed™** | Set™ reaches Golden Build™ stage | Wing lighting pulse · Orb ceremony · path to Set™ |
| **Certified™ Achievement** | Validation Loop approval | Hall of Legacy™ preview exhibit queued |
| **Launch Success™** | Campaign metrics threshold | Marketing War Room™ celebration ambient |
| **Concierge Meeting Request** | AI employee queue | Orb badge · path to Guest Lounge™ |
| **Marketplace Pack Arrived™** | Install complete | Plaza delivery moment · unwrap transition |
| **Award Earned™** | Studio Awards · milestone | Trophy case lighting in Legacy wing |
| **Founder Anniversary™** | Calendar | Hall of Legacy™ personal exhibit |
| **New Legacy Exhibit™** | Archive curator | Gallery Walk™ invitation |
| **Generation Milestone™** | Nth asset Certified™ | Factory Floor™ display tick |
| **Braintrust Ready™** | Critique session scheduled | Discovery Lab™ door accent |
| **Crisis Resolved™** | Issue cleared | Lighting warm-shift · Orb acknowledgment |
| **Department Pack Installed™** | Expansion Center | New wing reveal on map |

---

## Event Lifecycle

```
1. DETECT     — real signal (lifecycle · metrics · schedule · AI queue)
2. QUALIFY    — not duplicate · not spam · founder relevance
3. STAGE      — spatial anchor chosen (wing · plaza · Orb)
4. PRESENT    — environmental cue (not modal-first)
5. ENGAGE     — founder may walk toward · dismiss · snooze
6. RESOLVE    — append to memory · optional Legacy™
7. COOLDOWN   — prevent repeat fatigue
```

---

## Presentation Rules

### Environmental First

| Good | Bad |
|------|-----|
| Lights brighten on Marketing wing | "Success!" popup |
| Orb: "Marketing is celebrating — walk over?" | Blocking fullscreen video |
| New plaque materializes in Hall of Legacy™ | Badge count +1 |
| Elevator chime + floor indicator | Sound effect only |

### Founder Agency

- **Dismiss** — event acknowledged, not repeated soon
- **Snooze** — remind after transition or time
- **Walk to** — Orb plots path via Walk the Business™
- **Ignore** — ambient continues · no punishment

### Frequency Caps

| Tier | Max per day (default) |
|------|----------------------|
| Celebration class | 2 |
| Informational | 5 |
| Critical (Crisis™) | unlimited |

Quiet Focus™ suppresses non-critical events.

---

## Event → State Mapping

Some events **promote** to World State™:

| Event | May activate |
|-------|--------------|
| Launch Success™ | Celebration™ (timed) |
| Crisis detected | Crisis™ |
| Founder Anniversary™ | Company Anniversary™ overlay |
| Studio Event™ scheduled | Studio Event™ |

Short events may **not** need full state — a 30-second wing pulse suffices.

---

## Spatial Anchors

| Event category | Default anchor |
|----------------|----------------|
| Production wins | Relevant Set™ threshold |
| Legacy moments | Hall of Legacy™ · Gallery Walk™ |
| Marketplace | Arrival Plaza™ |
| Executive | Executive Corridor™ |
| AI requests | Concierge station · Orb |

Every event resolves `anchorSetId` + `anchorObjectId` when possible.

---

## Data Model (Conceptual)

```typescript
interface WorldEvent {
  eventId: string;
  type: WorldEventType;
  priority: 'critical' | 'high' | 'normal' | 'low';
  anchor: { setId?: string; objectId?: string; wingId?: string };
  presentation: 'lighting' | 'orb' | 'ambient' | 'signage' | 'audio';
  copy: { orb?: string; environmental?: string };
  trigger: { source: string; signalId: string };
  createdAt: ISO8601;
  expiresAt?: ISO8601;
  statePromotion?: WorldStateId;
  legacyAppend?: boolean;
}
```

---

## Relationship to Idle Life™

**Idle Life™** = continuous background motion.  
**World Events™** = punctuated narrative beats.

Both run without founder input. Events are **rarer** and **significant**.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Event on every navigation | Trains ignore |
| Fake celebrations | Breaks trust |
| Modal-only events | Not spatial |
| Events with no data trigger | Feels random |
| Permanent event UI chrome | Violates environmental law |

---

## Cross-References

- [world-states.md](./world-states.md)
- [world-evolution.md](./world-evolution.md) — permanent changes vs events
- [world-memory.md](./world-memory.md) — event acknowledgment persistence
- [Production Lifecycle™](../production-lifecycle/production-lifecycle.md)
- [Ambient Storytelling™](../foundational-experience-systems/ambient-storytelling.md)
