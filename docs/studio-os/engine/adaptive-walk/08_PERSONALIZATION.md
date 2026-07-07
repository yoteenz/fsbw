# 08 — Personalization

**Engine Module:** `studio.adaptive-walk.v1.personalization`  
**Status:** Continuous walk personalization engine  
**Philosophy:** Every walkthrough becomes increasingly personalized.

---

## Design Principle

> Adaptive Walk learns from **what the founder does** — not only what they say. Skips · dwell time · overrides · delegations reshape future walks.

---

## Observable Signals

| Signal | Personalization Effect |
|--------|------------------------|
| Skips Analytics every morning | Reduce Analytics emphasis · last on path |
| Always visits Creative Direction first | Reorder path · creative-first bias |
| Extra time on project stops | Increase project visibility · deeper project moments |
| Ignores certain alert types | Lower priority weight · move toward ignore |
| Prefers priority walk over full | Default scope → priority |
| Delegates marketing approvals | Auto-delegate similar future items |
| Extends celebration moments | `celebrationFirst` preference strengthened |
| Exits crisis mode early | Tune crisis threshold sensitivity |

---

## Personalization Delta Schema

```yaml
PersonalizationDelta:
  appliedAt: ISO8601
  field: string
  previousValue: unknown
  newValue: unknown
  evidence: string[]              # walk session ids
  confidence: number
```

Requires **3+ consistent signals** before strong personalization (same rule as Critique Memory).

---

## Adaptive Walk Memory Profile

```yaml
AdaptiveWalkMemoryProfile:
  founderId: string
  companyId: string

  routePreferences:
    preferredFirstStop: string | null
    deprioritizedStops: string[]
    preferredScope: enum

  attentionPatterns:
    highDwellDepartments: string[]
    skippedDepartments: string[]
    ignoredAlertCategories: string[]

  leadershipStyle:
    delegationAffinity: number
    crisisTolerance: enum
    celebrationAppreciation: enum
    verbosityPreference: enum

  creativeHabits:
    creativeMorningBias: boolean
    projectReviewDepth: enum

  lastUpdated: ISO8601
```

Shared with Critique Sessions `FounderPreferenceProfile` where overlapping — single source of truth.

---

## Personalization Application

```
Mode Resolution (03)
    ↓
Apply memory biases to mode scores + path order
    ↓
Apply Orb profile overlays (05)
    ↓
Apply priority weight adjustments (06)
    ↓
Log PersonalizationDelta in output
```

**Transparent:** Orb may say:

> "I know you usually start in Creative Direction — we'll begin there unless you'd prefer otherwise."

---

## Boundaries

| Allowed | Forbidden |
|---------|-----------|
| Reduce ignored stop emphasis | Hide critical crisis signals |
| Reorder non-critical stops | Skip mandatory approvals |
| Default scope preference | Force walk without choice |
| Tune Orb verbosity | Change Genome law |

Critical and launch signals **override** personalization.

---

## Cold Start

New founders: Genome + industry defaults only. Personalization accumulates over **7–14 walks** before strong bias.

---

_Next: [09 — Founder Control](./09_FOUNDER_CONTROL.md)_
