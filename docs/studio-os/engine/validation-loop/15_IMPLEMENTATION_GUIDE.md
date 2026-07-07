# 15 — Implementation Guide

**Engine Module:** `studio.validation-loop.v1.implementation`  
**Status:** Abstract engineering roadmap  
**Philosophy:** Architecture only. No production code in this sprint.

---

## Implementation Scope

Studio Validation Loop™ is a **platform subsystem** — not a feature page. Engineering builds orchestration, scoring, learning, and gate services.

---

## Recommended Subsystems

| Subsystem | Responsibility |
|-----------|----------------|
| `ValidationOrchestrator` | Pipeline state machine (02) |
| `SelfReviewAdapter` | Ingest Generator/Compiler/Runtime QA reports |
| `BraintrustCoordinator` | Parallel specialist critique (07) |
| `CreativeReviewService` | Dimension scoring (03) |
| `ExperienceReviewService` | Nine questions + preview protocol (04) |
| `GenomeValidator` | Inevitability + swap test (05) |
| `DepartmentAuditor` | Per-asset + holistic review (06) |
| `ScorecardAggregator` | Weighted dimensions (08) |
| `RevisionPlanner` | Scope resolution + handoff to Generator (09) |
| `LearningStore` | Events + preference profiles (10) |
| `ApprovalService` | Token issuance + gates (11) |
| `OverrideRecorder` | Founder override memory (12) |
| `CertificationIssuer` | Marketplace badges (13) |
| `EvolutionAnalyzer` | Post-launch continuous (14) |

---

## Suggested Build Phases

### Phase 1 — Pipeline Foundation

| Deliverable | Validates Against |
|-------------|-------------------|
| Validation state machine | 02 |
| Self Review adapters | 01, 06 |
| Basic Scorecard (5 dimensions) | 08 |
| Approval token + Runtime gate | 11, 12 |

**Milestone:** Block Runtime install without token.

### Phase 2 — Creative Authority

| Deliverable | Validates Against |
|-------------|-------------------|
| AI Braintrust coordinator | 07 |
| Creative + Experience review services | 03, 04 |
| Genome validator + swap test | 05 |
| Full 14-dimension Scorecard | 08 |

**Milestone:** Full pipeline for `creative-direction` package.

### Phase 3 — Revision & Learning

| Deliverable | Validates Against |
|-------------|-------------------|
| Revision Engine + Generator handoff | 09 |
| Learning Engine + preference profiles | 10 |
| Founder Override recorder | 12 |
| Revalidation scoping | 02 |

**Milestone:** Revision loop closes with learning capture.

### Phase 4 — Marketplace & Evolution

| Deliverable | Validates Against |
|-------------|-------------------|
| Certification issuer | 13 |
| Evolution analyzer | 14 |
| Badge revocation | 13, 14 |
| Marketplace listing gate | 13 |

**Milestone:** Certified listing publishes only through Validation.

### Phase 5 — Scale

| Deliverable | Validates Against |
|-------------|-------------------|
| All artifact profiles | 02 |
| All department types | 06 |
| Cross-org learning privacy | 10 |
| Evolution dashboard API | 14 |

**Milestone:** Validation Loop governs entire Studio OS output surface.

---

## API Surface (Abstract)

```yaml
POST /validation/submit
  body: ValidationInput
  returns: { validationId, state }

GET /validation/{id}
  returns: ValidationOutput (full report)

POST /validation/{id}/founder-review
  body: { action, reason, override? }
  returns: ApprovalRecord | RevisionPlan

POST /validation/{id}/revalidate
  body: { revisionScope }
  returns: { validationId, state }

GET /validation/{id}/scorecard
  returns: StudioScorecard

GET /validation/org/{orgId}/preferences
  returns: FounderPreferenceProfile

POST /validation/certify
  body: { listingId, validationId }
  returns: MarketplaceCertification

GET /validation/evolution/{departmentId}
  returns: EvolutionEvent[]
```

---

## Integration Points

| System | Integration |
|--------|-------------|
| Studio Department Generator™ | Submit after compile · receive Revision scopes |
| Studio Asset Compiler™ | Self Review ingest · surgical regen trigger |
| Studio Department Runtime™ | Preview sessions · install gate on token |
| Company Genome™ | Swap test · Genome Validation |
| Creative Direction Studio™ | Active direction for Braintrust Creative Director |
| Headquarters Marketplace™ | Certification before publish |
| Studio Orb™ | Founder review · override · natural-language revision |
| Learning Engine → Generator | Preference-weighted compile modifiers |

---

## Updated Platform Stack

```
SDK (law)
    ↓
Generator (create)
    ↓
Asset Compiler (generate)
    ↓
Validation Loop (should this exist?)  ← this engine
    ↓
Runtime (execute — token required)
    ↓
Cursor (wire)
    ↓
Evolution (continuous validation)
```

---

## Storage Model (Abstract)

| Store | Contents |
|-------|----------|
| Validation runs | Full ValidationOutput history |
| Approval tokens | Active tokens + expiry |
| Scorecards | Per validation dimension history |
| Learning events | Org-scoped preference data |
| Certifications | Marketplace badge records |
| Evolution metrics | Time-series per installed department |
| Override log | Founder judgment archive |

---

## Testing Strategy (Abstract)

| Test | Coverage |
|------|----------|
| Pipeline state transitions | All paths in 02 |
| Token gate blocks Runtime install | 11 |
| Swap test fail blocks approval | 05 |
| Braintrust disagreement preserved | 07 |
| Revision scope maps to Generator | 09 |
| Override feeds learning | 10, 12 |
| Certification badge rules | 13 |
| Evolution triggers revalidation | 14 |
| CDS golden package full pipeline | End-to-end validation |

---

## Security & Permissions

| Gate | Rule |
|------|------|
| Submit validation | Generator/Compiler system · admin |
| Founder review | Founder · authorized admin |
| Issue token | Approval Service only |
| Override | Founder only |
| Certification publish | Founder + Marketplace entitlement |
| Learning read | Org-scoped |
| Evolution metrics | Org admin |

---

## What Not to Build

| Forbidden | Reason |
|-----------|--------|
| React validation dashboard in this sprint | Architecture only |
| Auto-approve departments | Founder gate mandatory |
| Validation bypass for production HQ | Preview mode distinction only |
| Generic QA replacement | Validation extends QA |
| Single AI critic | Braintrust requires independence |

---

## Success Criteria

Studio Validation Loop™ v1 is complete when:

1. No department installs to HQ without `validationApprovalToken`
2. `creative-direction` package passes full pipeline with Scorecard + Braintrust
3. Genome swap test blocks interchangeable rooms
4. Founder override recorded and affects Learning Engine
5. Marketplace listing requires certification
6. Revision scopes surgical regen without full rebuild
7. Evolution system detects drift and recommends revalidation

---

## Canonical Statement

> Studio OS should never ask *"Can we generate this?"* It should ask *"Should this exist?"* Generation is only the beginning. Validation is where Studio OS earns trust.

---

_Studio Validation Loop™ v1.0.0 — Implementation Guide — Architecture only._
