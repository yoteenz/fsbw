# 11 — Approval Engine

**Engine Module:** `studio.validation-loop.v1.approval-engine`  
**Status:** Multi-tier approval gate system  
**Philosophy:** No output bypasses required approvals.

---

## Design Principle

> Approval is not a checkbox — it is a **recorded authorization** with context, scorecard, and downstream effects.

---

## Approval Tiers

| Tier | Authority | Required For |
|------|-----------|--------------|
| **AI Conditional Approval** | Braintrust advisory + auto gates | Technical self-review pass only — never final for departments |
| **Founder Approval** | Founder | All department packages · Marketplace publish · major revisions |
| **Executive Approval** | Chief of Staff · C-suite concierges | Cross-department impact · maturity-gated features |
| **Department Approval** | Source department AI lead | Downstream production unlock (e.g., Creative Direction → Production) |
| **Marketplace Certification** | Validation Loop + Marketplace rules | Public listing publish |

---

## Approval Record Schema

```yaml
ApprovalRecord:
  validationId: string
  approvalToken: string             # validationApprovalToken — Runtime gate
  tier: ApprovalTier
  approver: string                  # founder-id | ai-conditional | executive-role
  approvedAt: ISO8601
  scorecard: StudioScorecard
  conditions: string[]              # e.g., "monitor performance 30 days"
  expiresAt: ISO8601 | null         # optional revalidation deadline
  downstreamEffects:
    - runtimeInstallAuthorized: boolean
    - productionUnlock: boolean
    - marketplacePublish: boolean
    - departmentConnections: string[]
```

---

## Approval Flow by Artifact

### Department Package

```
Self Review PASS
    ↓
Braintrust + Reviews + Scorecard
    ↓
Founder Approval (mandatory)
    ↓
Department Approval (if production-adjacent — Creative Direction lock)
    ↓
validationApprovalToken issued
    ↓
Runtime install authorized
```

### Marketplace Listing

```
Department Package approved
    ↓
Marketplace Certification (13)
    ↓
Founder Approval (publish intent)
    ↓
Listing live
```

### AI Recommendation

```
Braintrust review
    ↓
Founder Approval (mandatory)
    ↓
Execute recommendation
```

---

## AI Conditional Approval

| Condition | Allowed |
|-----------|---------|
| Self Review technical pass | Auto-advance to Braintrust |
| Scorecard ≥ 90 all dimensions | Flag fast-track for founder — **not** auto-approve |
| Braintrust unanimous strong | Advisory only |
| No founder on record | **Never** install department |

**Rule:** AI never issues final `validationApprovalToken` for department packages.

---

## Department Approval (Production Unlock)

When Creative Direction department approves:

| Effect | Target |
|--------|--------|
| `productionUnlock` | Studio Production Engine departments read locked direction |
| Ceremony | creative-approval already executed in Runtime |
| Validation | Records direction hash in approval record |

Story · Production · Review departments check `creative-direction.approved` permission.

---

## Executive Approval Triggers

| Trigger | Executive |
|---------|-----------|
| Cross-org Marketplace publish | Chief of Staff |
| Maturity-gated department install | Relevant C-suite concierge |
| Genome major version change + reinstall | Brand Concierge + Founder |
| Executive HQ modifications | Chief of Staff |

---

## Approval Token Runtime Contract

```yaml
RuntimeInstallGate:
  requires: validationApprovalToken
  validate:
    - token not expired
    - package version matches token
    - organizationId matches
    - approval tier sufficient for install type
  onFail: block install · surface Validation status in Orb
```

Department Runtime refuses HQ install without valid token.

---

## Revalidation on Expiry

| Condition | Action |
|-----------|------|
| Token expires | Soft block · prompt revalidation |
| Genome major update | Mandatory revalidation · new token |
| Marketplace package update minor | Patch revalidation scoped |
| Marketplace package major | Full pipeline |

---

## Anti-Patterns

| Forbidden | Correct |
|-----------|---------|
| Skip founder for internal testing on production HQ | Preview mode only without token |
| Permanent token | Expiry or Genome version binding |
| Approve without scorecard | Scorecard required in record |
| Silent auto-install on high score | Founder gate always for departments |

---

_Next: [12 — Founder Override](./12_FOUNDER_OVERRIDE.md)_
