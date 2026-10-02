# Workforce Training System (commercial + Studio cast roles)

Generalizable company training — **AIO** is the reference domain, not a hardcoded-only module.

## Entities (firewall)

| Entity | Kind |
|--------|------|
| Studio World resident | `STUDIO_WORLD_RESIDENT` |
| Human employee | `HUMAN_EMPLOYEE` |
| Client cast trainer | `CAST_ROLE` / company-exclusive trainer |

Residents may be **cast** into client trainer roles without mutating canonical identity (`attachCastRole`).

## Training canon

- Table: `studio_world_workforce_training_canon`
- Approved canon required for policy answers (`evaluateTrainingResponse`)
- Manager corrections → `ProposedCanonCorrection` → **approval required** (`markTrainingCanonCorrectionApproved` + `approveTrainingCanonCorrection`)

## Human employee learning profile

- Table: `studio_world_human_employee_learning_profiles`
- Separate from resident identity (`registerHumanEmployee`)

## Trainer escalation

High-risk unknown → `REQUIRES_LEGAL_OR_COMPLIANCE_REVIEW`; `createEscalation` records exception path.

## Status

**CANONIZED · SCHEMA_DEFINED · PERSISTED · SERVICE_IMPLEMENTED (stubs + gates) · RUNTIME_ACTIVE trainer sessions deferred**
