# 02 — Review Pipeline

**Engine Module:** `studio.validation-loop.v1.review-pipeline`  
**Status:** Mandatory validation pipeline  
**Philosophy:** Nothing is approved immediately. This pipeline is non-optional.

---

## The Mandatory Pipeline

```
GENERATE
    ↓
SELF REVIEW
    ↓
AI BRAINTRUST
    ↓
COMPANY GENOME VALIDATION
    ↓
EXPERIENCE REVIEW
    ↓
CREATIVE REVIEW
    ↓
FOUNDER REVIEW
    ↓
┌─ REVISION → REVALIDATION (loop)
└─ APPROVAL
    ↓
LEARNING
    ↓
RUNTIME (HQ install authorized)
```

**No stage may be skipped** except where artifact type declares reduced scope (see Artifact Profiles).

---

## Stage Definitions

### Stage 0: Generate

| Property | Value |
|----------|-------|
| Owner | Generator + Asset Compiler |
| Output | Department Package™ (cooked) + Runtime preview session |
| Validation role | Submit artifact to Validation Loop |

Generation completes. Validation begins. **No direct path to Runtime.**

---

### Stage 1: Self Review

| Property | Value |
|----------|-------|
| Owner | Source engine QA (Generator 16 · Compiler 12 · Runtime 20) |
| Duration | Automated · < 30s |
| Pass criteria | Schema · dependencies · modularity · anti-SaaS scan · assembly dry-run |

```yaml
SelfReviewResult:
  technicalPass: boolean
  sdkCompliance: boolean
  modularityAudit: boolean
  antiSaaSScan: boolean
  runtimeDryRun: boolean
  failures: string[]
```

**Hard fail** → return to Generator/Compiler — does not advance to Braintrust.

---

### Stage 2: AI Braintrust™

| Property | Value |
|----------|-------|
| Owner | AI Braintrust (07) |
| Duration | Parallel critique · 2–5 min equivalent |
| Pass criteria | No unanimous critical fail · actionable report generated |

Independent specialists critique **before** founder sees output. Goal: thoughtful critique, not consensus.

---

### Stage 3: Company Genome Validation

| Property | Value |
|----------|-------|
| Owner | Genome Validation (05) |
| Duration | Automated + Braintrust Brand Concierge |
| Pass criteria | Inevitability YES · Transferability NO |

**The cardinal rule:**

> Would this experience work for another company? If yes — validation fails.

---

### Stage 4: Experience Review

| Property | Value |
|----------|-------|
| Owner | Experience Review (04) |
| Evaluates | Place · exploration · ownership · immersion · delight · aliveness · return intent · HQ fantasy |

Runs against Runtime preview session — not static screenshots.

---

### Stage 5: Creative Review

| Property | Value |
|----------|-------|
| Owner | Creative Review (03) |
| Evaluates | Originality · composition · art direction · hierarchy · luxury · storytelling · brand personality · confidence · editorial quality · intentionality |

**Nothing should feel generic.**

---

### Stage 6: Department Review (Department Packages Only)

| Property | Value |
|----------|-------|
| Owner | Department Review (06) |
| Evaluates | Every asset individually + holistic whole |
| Scope | Environment · objects · lighting · audio · interactions · motion · particles · AI · navigation · runtime · marketplace |

Skipped for single-asset or workflow-only artifacts.

---

### Stage 7: Scorecard Aggregation

| Property | Value |
|----------|-------|
| Owner | Scorecard System (08) |
| Output | Studio Scorecard™ with explained dimensions |
| Threshold | Configurable per artifact type · departments require ≥ 70 overall |

---

### Stage 8: Founder Review

| Property | Value |
|----------|-------|
| Owner | Founder (mandatory for departments) |
| Input | Scorecard + Braintrust summary + Genome result + revision suggestions |
| Options | Approve · Reject · Request revisions · Branch alternatives · Override |

Founder always has final authority (12).

---

### Stage 9: Revision Loop

| Property | Value |
|----------|-------|
| Owner | Revision Engine (09) |
| Trigger | Any stage fail · founder revision request |
| Action | Scoped regeneration → re-enter pipeline at appropriate stage |

```
Revision Scope → Regenerate → Revalidate (scoped stages only)
```

Never regenerate everything unless founder explicitly requests full rebuild.

---

### Stage 10: Approval

| Property | Value |
|----------|-------|
| Owner | Approval Engine (11) |
| Types | AI conditional · Founder · Executive · Department · Marketplace |
| Output | `validationApprovalToken` |

---

### Stage 11: Learning

| Property | Value |
|----------|-------|
| Owner | Learning Engine (10) |
| Captures | Approval/rejection · overrides · revision patterns · scorecard deltas |
| Feeds | Future Generator · Braintrust · Scorecard weights |

---

### Stage 12: Runtime Install

| Property | Value |
|----------|-------|
| Owner | Department Runtime + HQ Engine |
| Gate | Valid `validationApprovalToken` required |
| Action | HQ install · Marketplace publish · production unlock |

---

## Artifact Profiles

| Artifact Type | Stages Required |
|---------------|---------------|
| **Department Package** | Full pipeline (0–12) |
| **Single asset regen** | Self Review → Department Review (asset) → Founder (optional) → Approval |
| **AI recommendation** | Braintrust → Founder → Learning |
| **Workflow** | Self Review → Experience → Genome → Founder |
| **Marketplace listing** | Full + Certification (13) |

---

## Revalidation Scoping

| Revision Type | Re-enter At |
|---------------|-------------|
| Lighting only | Self Review → Department Review (lighting) → Scorecard delta |
| Mood Wall only | Self Review → Creative Review → Experience Review |
| Interaction map | Self Review → Department Review (interactions) → Experience |
| Full department | Stage 1 (Self Review) |

---

## Pipeline State Machine

```yaml
ValidationState:
  - submitted
  - self-review
  - braintrust
  - genome-validation
  - experience-review
  - creative-review
  - department-review
  - scorecard
  - founder-review
  - revision
  - approved
  - rejected
  - certified
  - installed
```

Transitions logged for Learning Engine and Evolution System.

---

## Anti-Patterns

| Forbidden | Correct |
|-----------|---------|
| Skip Braintrust for speed | Full pipeline |
| Auto-approve on high scorecard | Founder gate for departments |
| Validate blueprint without Runtime preview | Preview session required |
| Bypass Validation for internal builds | All HQ installs validated |
| Infinite revision loop without learning | Learning Engine captures patterns |

---

_Next: [03 — Creative Review](./03_CREATIVE_REVIEW.md)_
