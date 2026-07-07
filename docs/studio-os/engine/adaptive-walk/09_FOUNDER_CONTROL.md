# 09 — Founder Control

**Engine Module:** `studio.adaptive-walk.v1.founder-control`  
**Status:** Founder override and authority system  
**Philosophy:** The founder remains in complete control.

---

## Design Principle

> Adaptive intelligence **proposes**. Founder **decides**. Every override is remembered — and respected immediately.

---

## Override Types

| Override | Example | Effect |
|----------|---------|--------|
| **Mode override** | "Focus only on Product Launch" | Force Launch Day mode |
| **Scope override** | "Skip today's briefing" | Free explore · async brief |
| **Path override** | "Take me somewhere else" | Immediate navigation |
| **Filter override** | "Only show urgent items" | Crisis-style priority filter |
| **Full walk** | "Walk the entire Headquarters" | All stops · extended duration |
| **Reject mode** | "Not a crisis — standard brief" | Downgrade Crisis → Morning Brief |
| **Extend celebration** | "Tell me more about yesterday" | Lengthen ceremony stop |

---

## Override Schema

```yaml
FounderAdaptiveOverride:
  overrideId: string
  timestamp: ISO8601
  walkId: string

  type: enum
    # mode · scope · path · filter · reject-resolution · extend-moment

  command: string                   # raw founder utterance
  previousState: AdaptiveWalkState
  newState: AdaptiveWalkState
  rationale: string | null

  memoryImpact: boolean             # learn from this override
```

---

## Override Protocol

```
Founder issues override
    ↓
Apply immediately — no confirmation for navigation
    ↓
Mode-changing overrides: Orb confirms once
  "Switching to Launch Day focus — Publishing first."
    ↓
Regenerate path + HQ profile + Orb personality
    ↓
Log override → Memory (10) if pattern-forming
```

**Latency:** Navigation overrides < 500ms (Walk the Business 09).

---

## Skip Today's Briefing

Valid choice:

```
Founder: "Skip today's briefing."

Orb: "Understood. Headquarters is yours. I'll prepare a brief if you want it later."

→ free-explore mode
→ async DailyExecutiveBrief at session end
→ no guilt messaging
```

---

## Override vs Personalization

| Event | Memory Effect |
|-------|---------------|
| One-time "go to Marketplace" | No strong bias |
| 5x "skip Analytics" | Deprioritize Analytics |
| Override Crisis → Brief | Raise crisis threshold |
| Always override to Creative first | `preferredFirstStop` locked |

---

## Multi-Mode Commands

Natural language maps to overrides:

| Phrase | Resolution |
|--------|------------|
| "Focus only on Product Launch" | `launch-day` + project filter |
| "Only urgent" | priority filter = critical + high |
| "Walk everything" | full path · all installed departments |
| "Quiet morning" | quiet atmosphere · minimal Orb |

---

## Founder Always Wins

Adaptive Walk **never** blocks founder navigation to deemphasized department. Dimmed pathway ≠ locked door.

---

_Next: [10 — Long-Term Memory](./10_LONG_TERM_MEMORY.md)_
