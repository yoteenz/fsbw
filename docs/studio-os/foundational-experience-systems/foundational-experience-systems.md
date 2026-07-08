# Foundational Experience Systems™ — Master Specification

**Version:** 1.0.0  
**Status:** Canonical  
**Schema:** `studio.foundational-experience.v1`

---

## Purpose

Two **permanent interaction systems** — plus three supporting experience laws — define how every Studio OS department feels alive, persistent, and emotionally intentional.

Creative Direction Studio™ is the **first department to establish** these systems. All future departments **inherit** them.

---

## System Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              FOUNDATIONAL EXPERIENCE SYSTEMS™                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ENTRY                                                                      │
│  System 001 · Arrival Sequence™     Cinematic introduction                  │
│         ↓                                                                   │
│  ACTIVE                                                                     │
│  System 002 · Idle Life™            World lives when founder is still       │
│  System 003 · World Persistence™    State survives across sessions          │
│  System 004 · Ambient Storytelling™ Environment tells the story             │
│  System 005 · Emotional Design™     Department-specific feeling             │
│         ↓                                                                   │
│  EXIT / RETURN                                                              │
│  Persistence restores · Idle resumes · Storytelling reflects new state      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## System 001 — Arrival Sequence™

**Rule:** A founder should **never instantly appear** inside a department.

| Attribute | Definition |
|-----------|------------|
| **Nature** | Introduction — not loading screen |
| **Outcome** | "I have arrived." |
| **Anti-pattern** | "The page loaded." |
| **Uniqueness** | Every department has its own arrival reflecting personality |

**Detail:** [arrival-sequence.md](./arrival-sequence.md)

---

## System 002 — Idle Life™

**Rule:** Studio OS should **never appear paused**.

| Attribute | Definition |
|-----------|------------|
| **Nature** | Ambient simulation when founder is not interacting |
| **Outcome** | Headquarters was already alive |
| **Anti-pattern** | Frozen screenshot waiting for click |

**Detail:** [idle-life.md](./idle-life.md)

---

## System 003 — World Persistence™

**Rule:** Every department **remembers** its previous state.

| Attribute | Definition |
|-----------|------------|
| **Nature** | Session + cross-session state continuity |
| **Outcome** | Nothing resets because page reopened |
| **Anti-pattern** | Empty room on every visit |

**Detail:** [world-persistence.md](./world-persistence.md)

---

## System 004 — Ambient Storytelling™

**Rule:** Rooms **quietly communicate** what is happening — without requiring the founder to read text.

| Attribute | Definition |
|-----------|------------|
| **Nature** | Environmental narrative |
| **Outcome** | Headquarters visually evolves with the company |
| **Anti-pattern** | Status labels explaining everything |

**Detail:** [ambient-storytelling.md](./ambient-storytelling.md)

---

## System 005 — Emotional Design Principle™

**Rule:** Every department makes the founder **feel something** — from the environment, not explanatory copy.

| Department | Target emotion |
|------------|----------------|
| Creative Direction Studio™ | Inspired |
| Discovery | Curious |
| Production | Focused |
| Marketing | Energized |
| Finance | Confident |
| Legal | Protected |
| Customer Experience | Empathetic |
| The Archive™ | Nostalgic |

**Detail:** [emotional-design-principle.md](./emotional-design-principle.md)

---

## Inheritance Law

| Principle | Rule |
|-----------|------|
| **Systems are universal** | Arrival · Idle · Persistence · Storytelling · Emotion apply to all departments |
| **Expression is unique** | Timing · materials · audio · objects come from Room DNA™ + Department Definition |
| **No department hardcoding** | Reusable runtime modules — CDS is first package, not special case |
| **Golden Build proves feel** | Arrival + Idle must be perceptible in Golden Build™ — not Sprint 010 polish |

---

## Applicability Matrix

| Entity | Arrival | Idle Life | Persistence | Storytelling | Emotion |
|--------|:-------:|:---------:|:-----------:|:------------:|:-------:|
| Departments | ✓ | ✓ | ✓ | ✓ | ✓ |
| Headquarters | ✓ | ✓ | ✓ | ✓ | ✓ |
| The Archive™ | ✓ (ceremonial) | ✓ (reflective) | ✓ | ✓ | ✓ |
| Marketplace Packs™ | ✓ (install) | — | ✓ | ✓ | ✓ |
| AI Employees | ✓ (wake) | ✓ | ✓ | ✓ | — |

---

## Interaction Availability Gate

**Critical sequencing law:**

```
Arrival Sequence™ completes
         ↓
Interaction becomes available
         ↓
Idle Life™ runs in background when not interacting
         ↓
World Persistence™ saves on meaningful state change
         ↓
Ambient Storytelling™ reflects saved state visually
```

Founders cannot interact during arrival — walk · verbs · generate blocked until sequence completes.

---

## CDS Pilot Mapping

| System | Alpha reference | Golden Build status |
|--------|-----------------|---------------------|
| Arrival Sequence™ | [arrival-experience.md](../alpha/arrival-experience.md) | Spec complete · implementation pending stability |
| Idle Life™ | [runtime-behaviors.md](../alpha/runtime-behaviors.md) Orb idle | Spec complete · lightweight breath next |
| World Persistence™ | localStorage mood wall · notes · queue | Partial alpha |
| Ambient Storytelling™ | [environment-storytelling.md](../alpha/environment-storytelling.md) | Spec complete |
| Emotional Design | Inspired · editorial luxury | Partial in atmosphere |

---

## Anti-Patterns (Platform-Wide)

| Anti-pattern | Why forbidden |
|--------------|---------------|
| Instant spawn in department center | Breaks arrival law |
| Progress bar "Loading department…" | Loading screen masquerading as arrival |
| Static room when idle | Breaks idle life law |
| Reset mood wall on refresh | Breaks persistence law |
| Explain status in paragraph text | Breaks ambient storytelling |
| Generic SaaS emotion (neutral, efficient) | Breaks emotional design |

---

## Cross-References

| Document | Path |
|----------|------|
| Production Lifecycle Golden Build | [golden-build.md](../production-lifecycle/golden-build.md) |
| Walk the Room | [walk-the-room.md](../alpha/walk-the-room.md) |
| Founder Journey temporal modulation | [founder-journey.md](../alpha/founder-journey.md) |
| Future implementation | [future-roadmap.md](./future-roadmap.md) |

---

## Final Rule

Think in terms of **worlds**.

The founder inhabits their company — they do not navigate software.
