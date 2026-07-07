# 12 — Founder Override

**Engine Module:** `studio.validation-loop.v1.founder-override`  
**Status:** Final authority system  
**Philosophy:** The founder always has final authority. Every override teaches the system.

---

## Design Principle

> Validation serves the founder — it does not replace them. Override is a **first-class feature**, not a failure of the system.

---

## Override Powers

| Action | Description |
|--------|-------------|
| **Approve anyway** | Install despite below-threshold scorecard or failed dimension |
| **Reject anyway** | Reject despite high scores or Braintrust approval |
| **Request revisions** | Scoped or full — bypasses auto-revision priority |
| **Branch alternatives** | Spawn parallel package validation paths |
| **Override AI recommendations** | Disregard Braintrust revision suggestions |
| **Create exceptions** | Policy exceptions with expiry and scope |

---

## Founder Override Schema

```yaml
FounderOverride:
  id: string
  validationId: string
  founderId: string
  action: enum
    - approve-anyway
    - reject-anyway
    - request-revision
    - branch-alternative
    - override-braintrust
    - create-exception
  reason: string                    # founder voice or text — required
  affectedDimensions: string[]
  scorecardAtOverride: StudioScorecard
  braintrustSummary: string
  exception:
    scope: string
    expiresAt: ISO8601 | null
  timestamp: ISO8601
```

---

## Approve Anyway

| Scenario | System Behavior |
|----------|-----------------|
| Scorecard 65 · founder loves it | Issue token · record override · Learning Engine captures |
| Genome marginal fail · founder accepts | Issue token with `genomeException: true` · flag in Observatory |
| Braintrust critical · founder disagrees | Issue token · reduce Braintrust weight for similar future critiques |

**Required:** Founder `reason` — even brief voice note.

---

## Reject Anyway

| Scenario | System Behavior |
|----------|-----------------|
| Scorecard 92 · founder feels generic | Reject · Revision Engine full creative scope |
| Braintrust loves · founder disagrees | Reject · capture override pattern |
| Near approval · founder wants different direction | Branch alternative package |

---

## Override Memory (Learning)

Every override feeds Learning Engine (10):

| Learned | Application |
|---------|-------------|
| Founder approves below threshold on luxury dimension | Lower luxury weight in scorecard for this org |
| Founder rejects high editorial scores repeatedly | Raise editorial bar · adjust Braintrust |
| Founder always overrides Motion Director | Reduce motion critique weight |
| Founder voice reason patterns | Improve Chief Concierge brief framing |

**Goal:** Better understand founder's creative judgment — not override it away.

---

## Branch Alternatives

```
Founder: "Show me three directions"
    ↓
Generator spawns 3 package variants (Sandbox isolation)
    ↓
Parallel Validation pipelines (scoped)
    ↓
Founder compares scorecards
    ↓
Approve one · reject others · merge optional
```

Each branch gets independent `validationId`.

---

## Exception Policy

```yaml
ValidationException:
  id: string
  organizationId: string
  scope: string                     # e.g., "skip-genome-swap-test for asset X"
  reason: string
  founderId: string
  expiresAt: ISO8601
  singleUse: boolean
```

Exceptions logged · never silent · reviewable in Evolution dashboard.

---

## Chief Concierge Role

Chief Concierge presents override context fairly:

| Present | Do Not |
|---------|--------|
| Scorecard summary | Hide failures |
| Braintrust disagreements | Pressure founder |
| Revision cost estimate | Block override |
| Learning note ("you often approve here") | Judge decision |

---

## Anti-Patterns

| Forbidden | Correct |
|-----------|---------|
| Hide override option | Always visible at founder review |
| Override without reason | Reason required |
| Forget override history | Learning Engine memory |
| Override bypasses audit log | Full record in validation history |

---

_Next: [13 — Marketplace Certification](./13_MARKETPLACE_CERTIFICATION.md)_
