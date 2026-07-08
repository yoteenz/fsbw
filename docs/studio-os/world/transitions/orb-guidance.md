# Orb Guidance™ — Transition Companion

**Version:** 1.0.0  
**Status:** Canonical (docs only)

---

## Purpose

During Transitions™, the **Studio Orb™** becomes the **guide** — contextual companion, not loading mascot.

Transitions are opportunities for **conversation** · status · story.

---

## Orb Roles During Transition

| Role | Description |
|------|-------------|
| **Guide** | Names destination · orients founder |
| **Messenger** | Department updates · approvals needed |
| **Narrator** | Optional subtle story (Gallery Walk™) |
| **Companion** | Reduces isolation during long transitions |
| **Router** | Adaptive Walk™ suggestions |

Orb does **not** say "Loading…" ever.

---

## Guidance Modes

| Mode | When | Register |
|------|------|----------|
| `contextual-brief` | Walk™ · short corridors | One line |
| `department-update` | Pending work at destination | Two lines max |
| `floor-briefing` | Elevator™ | Floor identity + status |
| `vista-narration` | Skybridge™ · Glass Hallway™ | Wing overview |
| `security-confirm` | Security Checkpoint™ | Authorization ack |
| `reflective` | Gallery Walk™ · Archive approach | Chronicle tone |
| `urgent` | Crisis™ modifier | Direct · short |
| `celebratory` | Celebration™ modifier | Warm milestone ack |

---

## Example Lines (Canonical)

| Context | Orb line |
|---------|----------|
| → Creative Atelier™ | *"Creative Direction has prepared new concepts."* |
| → Marketing War Room™ | *"Marketing has requested approval."* |
| → Finance Vault™ | *"We've reached the Finance Vault."* |
| → Discovery Lab™ | *"The Discovery Lab has completed research."* |
| → Hall of Legacy™ | *"The Archive remembers where you began."* |
| Elevator to executive | *"Founder Office is on this floor."* |
| Gallery Walk™ | *"Your first Golden Build is preserved here."* |

Lines compiled from: org state · queue · chronicle · department AI feeds.

---

## Orb Behavior During Transition

| Phase | Orb |
|-------|-----|
| Departure | Brief ack of leaving Set™ |
| Journey | Primary guidance line(s) |
| Approach | Destination preview line |
| Handoff | Silence into Set Arrival Orb awakening |

Max **2 lines** per standard transition — respects Founder Cognitive Load™.

---

## Data Sources for Guidance

| Source | Example trigger |
|--------|-----------------|
| Generation queue | Job completed at destination |
| Department AI | Marketing approval pending |
| Project Genome™ | Active project at destination |
| Chronicle | Milestone on Gallery route |
| Founder Journey™ | Journey-appropriate tone |
| Business state | Crisis · Celebration modifiers |

---

## Technical Contract

```json
{
  "orbGuidance": {
    "transitionId": "creative-to-discovery-glass-hallway",
    "mode": "department-update",
    "lines": [
      { "atMs": 1000, "text": "Discovery has completed overnight research.", "priority": 1 },
      { "atMs": 4500, "text": "The Lab is ready when you are.", "priority": 2 }
    ],
    "voiceProfile": "genome-voice-editorial",
    "suppressIfCognitiveLoadHigh": true
  }
}
```

---

## Relationship to Studio Orb Runtime

Reuses `studio-orb-runtime` — transition profile extension:

| Context | Runtime mode |
|---------|--------------|
| Set ACTIVE | Instructional · operational |
| Transition | Guide · brief |
| Set Arrival | Awakening · greeting |
| Archive™ | Reflective |

No separate Orb — same Orb · mode switch.

---

## Anti-Patterns

| Anti-pattern | Correction |
|--------------|------------|
| "Please wait…" | Contextual story only |
| Tutorial modal during walk | Orb single line |
| Orb blocks transition | Guidance is parallel |
| Verbose paragraph | Two lines max |

---

## Cross-References

- [Transition DNA](./transition-dna.md)
- [Arrival system](./arrival-system.md)
- [Founder Journey™](../../alpha/founder-journey.md)
