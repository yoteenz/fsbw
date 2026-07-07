# 10 — Long-Term Memory

**Engine Module:** `studio.adaptive-walk.v1.long-term-memory`  
**Status:** Institutional executive walk memory  
**Philosophy:** The Headquarters should feel like it knows its founder.

---

## Design Principle

> Adaptive Walk remembers favorite routes · preferred departments · review habits · leadership style · creative habits · decision patterns · meeting preferences — across months and years.

---

## Memory Domains

| Domain | Examples |
|--------|----------|
| **Favorite routes** | Creative-first · ops-heavy Fridays |
| **Preferred departments** | High dwell · frequent deep-dives |
| **Review habits** | Walk the Room after Production stop |
| **Leadership style** | Delegate marketing · hands-on creative |
| **Creative habits** | Morning mood board reviews |
| **Decision patterns** | Approves fast · wants evidence for spend |
| **Meeting preferences** | Short walks before external calls |
| **Override history** | Crisis sensitivity tuning |
| **Celebration response** | Linger vs brief acknowledgment |

---

## Memory Event Schema

```yaml
AdaptiveWalkMemoryEvent:
  eventId: string
  walkId: string
  timestamp: ISO8601
  eventType: enum
    # stop-visited · stop-skipped · dwell-time · override · delegation
    # mode-confirmed · mode-rejected · moment-deferred · approval-style

  payload: object
  signalStrength: number
```

---

## Emergent Founder Model

After sufficient events, system proposes **emergent traits** (founder confirms optional):

```yaml
EmergentFounderTrait:
  trait: string
  description: string
  confidence: number
  examples: string[]
```

Example:

> "You tend to delegate operational approvals but stay hands-on for creative direction."

Stored in `AdaptiveWalkMemoryProfile` · surfaced to Orb sparingly.

---

## HQ Feels Like It Knows You

| Memory | HQ Expression |
|--------|---------------|
| Creative-first preference | Path lighting hints Creative Direction wing at arrival |
| Skips Analytics | Observatory dim unless anomaly |
| Celebration appreciation | Longer ceremony staging |
| Delegation affinity | Concierges proactively offer "I can handle this" |
| Prior walk on Project 014 | Room Memory ghost at Production station |

---

## Retention & Privacy

| Rule | Detail |
|------|--------|
| Per-company isolation | Never cross-company learning |
| Per-founder within company | Co-founder profiles separate |
| Indefinite retention | Walk history · compressed summaries |
| Founder may reset | "Forget my walk preferences" — rare |

---

## Integration with Critique & Validation Memory

| Engine | Shared Data |
|--------|-------------|
| Critique Sessions Memory (10) | Creative philosophy · delegation |
| Validation Founder Override (12) | Approval style |
| Walk the Business Room Memory | Spatial decision history |

Single `FounderExecutiveProfile` service recommended (Implementation 12).

---

## Memory-Informed Arrival

```
Orb (personalized):

"Good morning. Last three walks you started in Creative Direction — 
 shall we do that again? Marketing also has a launch update."
```

Offers choice — does not assume.

---

_Next: [11 — Future Evolution](./11_FUTURE_EVOLUTION.md)_
