# 10 — Learning Engine

**Engine Module:** `studio.validation-loop.v1.learning-engine`  
**Status:** Continuous improvement from validation outcomes  
**Philosophy:** Every approval and rejection teaches Studio OS.

---

## Design Principle

> Future generations become smarter over time. Validation is not a gate — it is a **teaching loop**.

---

## Learning Inputs

| Event | Captured Data |
|-------|---------------|
| **Approval** | Scorecard · founder comments · override absent |
| **Rejection** | Reasons · failed dimensions · Braintrust consensus |
| **Revision** | Scope · outcome · iterations to pass |
| **Founder override** | Approve-below-threshold · reject-above-threshold · exceptions |
| **Genome update** | Revalidation outcomes post-update |
| **Post-launch evolution** | Analytics · feedback (14) |

---

## Learning Domains

| Domain | What Improves |
|--------|---------------|
| **Founder preferences** | Ceremony weight · motion pace · luxury level · voice tone |
| **Repeated revisions** | Patterns → Generator prompt modifiers |
| **Common critiques** | Braintrust emphasis calibration |
| **Successful patterns** | Golden patterns library per industry |
| **Failed patterns** | Anti-pattern corpus · Anti-SaaS expansion |
| **Creative evolution** | Company creative trajectory over time |
| **Genome drift** | When Project diverges from Genome repeatedly |
| **Scorecard weights** | Dimension importance per founder/org |

---

## Learning Event Schema

```yaml
LearningEvent:
  id: string
  validationId: string
  organizationId: string
  artifactType: string
  outcome: enum                     # approved | rejected | revised-then-approved
  scorecard: StudioScorecard
  founderAction: FounderAction
  revisionHistory: RevisionItem[]
  override: FounderOverride | null
  genomeVersion: string
  departmentType: string | null
  timestamp: ISO8601
  insights: string[]                # auto-extracted patterns
```

---

## Founder Preference Profile

```yaml
FounderPreferenceProfile:
  organizationId: string
  founderId: string
  updatedAt: ISO8601

  creativePreferences:
    luxuryLevel: number             # 0–100 learned
    editorialVsBold: number           # -100 editorial ← → bold +100
    ceremonyWeight: number
    motionPace: number
    particleDensity: number

  revisionPatterns:
    frequentScopes: string[]          # e.g., mood-wall, lighting
    avoidedScopes: string[]           # founder rarely approves full rebuild

  overridePatterns:
    approveBelowThreshold: number     # count
    commonOverrideDimensions: string[]

  braintrustTrust:
    roleWeights: Record<AIRoleId, number>  # founder agrees with role X often
```

Feeds Generator compile modifiers and Braintrust weighting.

---

## Pattern Libraries

### Successful Patterns

| Pattern | Source | Application |
|---------|--------|-------------|
| CDS arrival sequence | Golden Department approval | Creative pipeline default |
| NDX concrete gallery | NDX approvals | Financial industry modifier |
| Frontal Slayer salon warmth | FS approvals | Beauty industry modifier |

### Failed Patterns

| Anti-Pattern | Source | Prevention |
|--------------|--------|------------|
| 101 featured overview modules | Performance incident | Generator cap enforcement |
| Generic mood seeds | Genome fails | photographyDirection modifier strengthen |
| Chat bubble Orb | Creative fails | SDK + Validation hard reject |

---

## Feedback Loops

```
Validation Outcome
       ↓
Learning Engine extracts insights
       ↓
┌─ Generator: prompt modifier updates
├─ Braintrust: role calibration
├─ Scorecard: weight adjustment
├─ Revision Engine: priority tuning
└─ Evolution System: post-launch criteria update
```

---

## Privacy & Scope

| Rule | Specification |
|------|---------------|
| Learning is org-scoped | Patterns do not leak across companies |
| Override memory is founder-scoped | Creative judgment is personal |
| Marketplace patterns anonymized | Industry-level only |
| Opt-out available | Founder can disable learning per org |

---

## Learning Metrics

| Metric | Purpose |
|--------|---------|
| Revision rate | Generator quality trend |
| First-pass approval rate | Pipeline health |
| Override rate | Scorecard calibration |
| Dimension improvement delta | Revision effectiveness |
| Time-to-approval | Friction indicator |

---

_Next: [11 — Approval Engine](./11_APPROVAL_ENGINE.md)_
