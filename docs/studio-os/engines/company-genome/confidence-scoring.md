# Confidence Scoring™

**Engine Module:** `studio.company-genome.v2.confidence`  
**Status:** Belief confidence model

---

## Purpose

Every Genome belief carries a **confidence score** (0–100%).

Studio OS expresses beliefs as:

> *"Studio OS believes: Founder prefers warm editorial lighting — **Confidence 97%**"*

---

## Confidence Scale

| Range | Meaning | Behavior |
|-------|---------|----------|
| 0–39 | Speculative | Ask clarifying question · low compose weight |
| 40–59 | Emerging | Apply with hedge · Orb mentions uncertainty |
| 60–79 | Established | Default apply in generation |
| 80–94 | Strong | Auto-inherit in Prompt Composer™ |
| 95–100 | Canon | Near-certain · negative override requires explicit reject |

---

## Confidence Update Rules

```yaml
ConfidenceUpdate:
  baseDelta:
    approved: +2 to +5
    rejected: -5 to -12 on trait · +8 to +15 on negative mirror
    reused: +1 to +3
    regenerated: +1 (direction signal)
    favorite: +8 to +12
    purchased: +4 to +8
    archived: -10 on trait

  modifiers:
    repeatedSignal: multiply × 1.2    # same trait 3+ times in 30d
    founderOverride: × 0.5 on conflicting update
    crossWorkspaceConsistency: +2     # same preference in 2+ scenes
    timeDecay: -0.1 per 90d inactive   # optional v2.1
```

---

## Negative Constraints

Dislikes are first-class beliefs:

```yaml
negativeBelief:
  key: heavy-industrial-materials
  strand: visual
  confidence: 95
  type: dislike
```

Injected into Prompt Composer™ negative stack automatically.

---

## Confidence Aggregation

```yaml
StrandConfidence:
  visualIdentityConfidence: number    # avg top visual beliefs
  creativeConfidence: number
  brandConfidence: number
  operationalConfidence: number
  generationAccuracy: number          # recommendation match rate
```

Displayed in [CDS presentation](./cds-presentation.md) — not a settings page.

---

## Example Belief Set

```yaml
beliefs:
  - key: warm-editorial-lighting
    strand: visual
    confidence: 97
    evidenceCount: 42
  - key: floating-architecture
    strand: visual
    confidence: 92
    evidenceCount: 28
  - key: heavy-industrial-materials
    strand: visual
    confidence: 95
    type: dislike
    evidenceCount: 18
```

---

## Calibration

| Metric | Target |
|--------|--------|
| Recommendation acceptance when confidence ≥ 80 | ≥ 70% |
| Founder override when confidence < 60 | Expected |
| Generation accuracy (30d rolling) | Improves month-over-month |

---

_Confidence Scoring™ — Studio OS knows what it knows._
