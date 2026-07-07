# 11 — Post Session Learning

**Engine Module:** `studio.critique-sessions.v1.post-session-learning`  
**Status:** Outcome-based learning system  
**Philosophy:** Learn from real-world results — not assumptions.

---

## Design Principle

> After implementation and launch, compare **recommendations against actual outcomes**. Did the advice work? Did ignored advice prove valuable later?

The system learns from **reality** — not from whether the founder agreed in the moment.

---

## Learning Triggers

| Trigger | When |
|---------|------|
| **Launch milestone** | Project output ships |
| **Scheduled retrospective** | 30d · 60d · 90d post-launch |
| **Metric threshold** | Conversion · engagement · performance crosses boundary |
| **Founder feedback** | Explicit "that worked" / "that didn't" via Orb |
| **Support signal** | Tickets correlated to critiqued area |
| **Validation Evolution** | Validation Loop Evolution System (14) shares signals |

---

## Outcome Assessment Schema

```yaml
OutcomeAssessment:
  assessmentId: string
  sessionId: string
  revisionId: string | null
  recommendationRef: string

  recommendation:
    fromRole: AIRoleId
    suggestion: string
    founderDecision: enum          # approved | rejected | modified | dismissed

  outcome:
    measuredAt: ISO8601
    metricType: enum
      # conversion | engagement | retention | performance | satisfaction | support-volume | qualitative
    before: number | string | null
    after: number | string | null
    delta: number | string | null
    confidence: enum               # high | medium | low

  assessment: enum
    # recommendation-validated | recommendation-failed | rejection-validated | rejection-regretted | inconclusive

  notes: string
  evidence: string[]               # analytics refs · heatmaps · founder quotes
```

---

## Assessment Examples

### Marketing Recommendation Validated

```yaml
OutcomeAssessment:
  recommendation:
    fromRole: marketing-concierge
    suggestion: "Strengthen CTA on first zone"
    founderDecision: approved
  outcome:
    metricType: conversion
    before: 2.1%
    after: 4.8%
    delta: +2.7%
  assessment: recommendation-validated
  notes: "First-visit CTA click-through doubled within 14 days of revision."
```

### Creative Director Recommendation Validated

```yaml
OutcomeAssessment:
  recommendation:
    fromRole: creative-director
    suggestion: "Add memorable focal point to arrival zone"
    founderDecision: approved
  outcome:
    metricType: engagement
    before: avg 45s session
    after: avg 2m 10s session
  assessment: recommendation-validated
  notes: "Heatmaps show prolonged gaze on new focal sculpture. Return visits +18%."
```

### Rejected Advice Proved Valuable

```yaml
OutcomeAssessment:
  recommendation:
    fromRole: marketing-concierge
    suggestion: "Simplify entry experience"
    founderDecision: rejected
    founderRationale: "Luxury audience expects ceremony"
  outcome:
    metricType: retention
    before: null
    after: "Returning user NPS 72 — ceremony cited positively in 34% of feedback"
  assessment: rejection-validated
  notes: "Founder rejection aligned with audience. No regret signal."
```

### Ignored Advice Later Valuable

```yaml
OutcomeAssessment:
  recommendation:
    fromRole: accessibility-concierge
    suggestion: "Add reduced-motion alternative for ceremony"
    founderDecision: dismissed-permanent
  outcome:
    metricType: support-volume
    after: 12 tickets in 30d citing motion discomfort
  assessment: rejection-regretted
  notes: "Dismissed advice correlated with support spike. Recommend resurfacing in next Experience Review."
```

---

## Learning Loop

```
CRITIQUE SESSION
    ↓
FOUNDER DECISIONS + REVISIONS
    ↓
IMPLEMENTATION + LAUNCH
    ↓
OUTCOME DATA COLLECTION (analytics · behavior · support · founder feedback)
    ↓
OUTCOME ASSESSMENT (compare recommendation vs reality)
    ↓
MEMORY UPDATE (strengthen/weaken preference signals)
    ↓
VALIDATION EVOLUTION FEED (shared learning)
    ↓
FUTURE SESSION PERSONALIZATION + SPECIALIST CALIBRATION
```

---

## Specialist Calibration

Repeated outcome assessments tune specialist behavior:

| Pattern | Calibration |
|---------|-------------|
| Marketing CTA advice consistently validated | Increase confidence phrasing · cite past wins |
| Engineering performance warnings consistently ignored without regret | Softer framing · optional mention |
| Accessibility advice rejected then regretted | Orb proactively surfaces in future sessions |
| Creative Director focal-point advice high success rate | Prioritize in opening statements |

Calibration adjusts **emphasis** — not **honesty**.

---

## Project Retrospective Integration

Project Retrospective sessions (02) are the **primary** venue for reviewing outcome assessments:

```
Orb: "Ninety days post-launch. Let's compare our Launch Readiness critique against reality.

  ✓ Marketing's CTA revision — conversion +2.7%
  ✓ Creative's focal point — engagement doubled
  ⚠ Accessibility motion alternative — dismissed, 12 support tickets followed

  What should we carry forward?"
```

Retrospective outputs feed Memory System and may trigger Genome updates.

---

## Relationship to Validation Loop Evolution System

| Critique Post Session Learning (11) | Validation Evolution (14) |
|--------------------------------------|---------------------------|
| Recommendation-level outcome tracking | Department-level continuous validation |
| Conversational advice effectiveness | Scorecard dimension drift |
| Founder decision regret signals | Performance · heatmap · engagement |

**Shared feed:** `LearningEvent` stream consumed by both engines.

---

## Data Sources

| Source | Signals |
|--------|---------|
| Site analytics | Conversion · engagement · paths |
| Department Runtime | Session duration · zone dwell · return visits |
| Heatmaps | Attention · ignored zones |
| Support tickets | Tagged to critiqued features |
| Founder Notes / Orb | Qualitative feedback |
| Marketplace | Buyer reviews · install success |
| A/B branches | Branch experiment outcomes |

---

## Inconclusive Outcomes

When data insufficient:

```yaml
assessment: inconclusive
notes: "Insufficient sample size at 14d. Reassess at 30d."
rescheduleAssessment: ISO8601
```

System does not penalize specialists on inconclusive — patience over false certainty.

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Declare success from vanity metrics | Learning requires meaningful signals |
| Shame founder for rejected advice that failed | Neutral framing · suggest resurfacing |
| Auto-resurface dismissed advice without evidence | Requires rejection-regretted assessment |
| Cross-company outcome comparison | Privacy violation |

---

_Next: [12 — Implementation Guide](./12_IMPLEMENTATION_GUIDE.md)_
