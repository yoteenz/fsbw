# 06 — Executive Priorities

**Engine Module:** `studio.adaptive-walk.v1.executive-priorities`  
**Status:** Attention allocation intelligence  
**Philosophy:** The founder never wastes time.

---

## Design Principle

> Adaptive Walk determines **what deserves attention · what can wait · what should be delegated · what should be celebrated · what should be ignored**.

---

## Priority Stack

```yaml
ExecutivePriorityStack:
  generatedAt: ISO8601
  modeId: WalkModeId

  items:
    - priorityId: string
      rank: number
      category: enum
        # attention-now · attention-today · delegate · celebrate · ignore · defer

      title: string
      departmentId: string
      projectId: string | null
      urgency: enum                 # critical · high · medium · low
      estimatedMinutes: number
      rationale: string
      spatialStop: boolean          # include on walk path?

      disposition: enum
        # founder-required · concierge-can-handle · automated · informational

  ignoredSignals:
    - signalId: string
      reason: string                # low confidence · duplicate · founder-dismissed-pattern
```

---

## Category Definitions

| Category | Meaning | Walk Treatment |
|----------|---------|----------------|
| **Attention now** | Founder required immediately | Path stop · crisis path |
| **Attention today** | Important this session | Likely stop · brief item |
| **Delegate** | Concierge or team owns | Mention · not stop |
| **Celebrate** | Win to acknowledge | Moment or opening ceremony |
| **Ignore** | Noise · low value | Not surfaced to founder |
| **Defer** | Valid but not today | Brief footer · schedule |

---

## Priority Scoring Factors

| Factor | Weight |
|--------|--------|
| Launch proximity | High |
| Revenue/customer impact | High |
| Founder-only approval | High |
| Blocker on critical path | Critical |
| Genome strategic priority | Medium |
| Founder memory (always visits X) | Medium |
| Founder memory (skips analytics) | Negative weight |
| Repeated deferral | Decay |
| Age of signal | Escalate over time |

---

## Delegation Intelligence

```yaml
DelegationRecommendation:
  priorityId: string
  assignee: enum                    # concierge · department · ai-automation
  assigneeId: string
  confidence: number
  founderApprovalRequired: boolean  # for irreversible actions
```

Orb:

> "Marketing Concierge can finalize the CTA variant — unless you want to weigh in. Delegate?"

Founder: yes → removed from stop list · logged as delegated.

---

## Ignore vs Defer

| Ignore | Defer |
|--------|-------|
| Low signal · repeated dismiss pattern | Valid · wrong day |
| Never resurface unless signal strengthens | Resurfaces tomorrow or on trigger |
| Example: vanity metric fluctuation | Example: Marketplace expansion — interesting but not today |

Ignore requires **pattern evidence** from Memory (10) — not arbitrary suppression.

---

## Time Budget

```yaml
FocusTimeEstimate:
  criticalPathMinutes: number
  optionalStopsMinutes: number
  totalRecommended: number
  modeAdjustment: string            # "Crisis — plan 45 min before other work"
```

Feeds Walk the Business Conclusion (11).

---

## Founder Never Wastes Time

| Guardrail | Detail |
|-----------|--------|
| Max stops per mode | Crisis 4 · Launch 6 · Brief 9 |
| No empty stops | Every stop has `narrativeRole` |
| Skip duplicates | Same approval not two stops |
| Delegate by default | When concierge-capable |
| Priority walk < 15 min target | Unless founder extends |

---

_Next: [07 — Headquarters Storytelling](./07_HEADQUARTERS_STORYTELLING.md)_
