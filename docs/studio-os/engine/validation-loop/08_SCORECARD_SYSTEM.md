# 08 — Scorecard System

**Engine Module:** `studio.validation-loop.v1.scorecard`  
**Status:** Studio Scorecard™ aggregation system  
**Philosophy:** Scores include explanations — not just numbers.

---

## Studio Scorecard™

Every validated artifact receives a **Studio Scorecard™** — a multi-dimensional quality profile with explained scores, evidence, and revision pointers.

---

## Score Dimensions

| Dimension | Source Stage | Weight (Department) |
|-----------|--------------|---------------------|
| **Brand Authenticity** | Genome Validation (05) | 12% |
| **Creative Direction** | Creative Review (03) | 10% |
| **Editorial Quality** | Creative Review (03) | 8% |
| **Visual Identity** | Creative Review (03) | 8% |
| **Interaction Quality** | Department Review (06) | 8% |
| **Immersion** | Experience Review (04) | 10% |
| **Navigation** | Experience + Department Review | 6% |
| **Runtime Readiness** | Self Review + Department Review | 8% |
| **Accessibility** | Braintrust Accessibility Concierge | 6% |
| **Performance** | Department Review | 6% |
| **Marketplace Readiness** | Department Review | 6% |
| **Maintainability** | Modularity audit | 6% |
| **Emotional Impact** | Experience Review (04) | 8% |
| **Overall Experience** | Experience Review aggregate | 6% |

Weights sum to 100%. Adjustable per artifact profile via Learning Engine.

---

## Score Schema

```yaml
DimensionScore:
  dimension: string
  score: number                     # 0–100
  weight: number
  explanation: string               # required — min 2 sentences
  evidence: string[]                # specific observations
  braintrustInput: string[]         # which roles contributed
  revisionPointer: string | null    # if score < threshold
  trend: enum | null                # up | down | stable vs prior validation
```

```yaml
StudioScorecard:
  validationId: string
  artifactId: string
  artifactVersion: semver
  dimensions: DimensionScore[]
  overallScore: number              # weighted aggregate
  overallExplanation: string        # Chief Concierge synthesis
  passThreshold: number             # default 70 for departments
  pass: boolean
  highlights: string[]              # top 3 strengths
  concerns: string[]                # top 3 concerns
  comparisonToGolden: number | null # creative pipeline only
```

---

## Score Bands

| Band | Range | Meaning |
|------|-------|---------|
| **Exceptional** | 90–100 | Reference quality · fast-track founder review |
| **Strong** | 75–89 | Pass likely · minor revisions optional |
| **Conditional** | 60–74 | Revision recommended before founder |
| **Weak** | 40–59 | Revision required |
| **Unacceptable** | 0–39 | Should not advance to founder without major rework |

---

## Explanation Requirement

**Forbidden:**

```yaml
brandAuthenticity: 72
```

**Required:**

```yaml
brandAuthenticity:
  score: 72
  explanation: >
    Materials and lighting express Frontal Slayer warmth convincingly on floor
    and walls. Mood Wall seed imagery still leans generic editorial — could
    serve NDX without Genome filter. Swap test passed but marginally.
  evidence:
    - "Rose-gold pin rails present on Brief Wall"
    - "Mood Wall default seeds lack beauty texture tags"
  revisionPointer: "Regenerate mood-wall seeds with photographyDirection modifier"
```

---

## Golden Department Comparison

Creative pipeline departments receive `comparisonToGolden`:

| Score | Meaning |
|-------|---------|
| 95+ | Indistinguishable from Golden Department intent |
| 80–94 | Strong inheritance · minor gaps |
| 60–79 | Recognizable gaps vs CDS |
| < 60 | Fails Golden Department standard |

---

## Scorecard Thresholds by Artifact

| Artifact Type | Pass Threshold | Founder Required |
|---------------|----------------|------------------|
| Department Package | 70 overall · no dimension < 50 | Yes |
| Single asset | 65 overall | Optional |
| AI recommendation | 60 overall | Yes |
| Marketplace listing | 75 overall · Marketplace Readiness ≥ 80 | Yes + Certification |

---

## Scorecard in Founder Review

Founder receives:

1. Overall score + explanation
2. Dimension heatmap (visual in future UI)
3. Top strengths and concerns
4. Braintrust disagreements
5. One-click revision scopes for failed dimensions

Founder may approve below threshold via Override (12).

---

_Next: [09 — Revision Engine](./09_REVISION_ENGINE.md)_
