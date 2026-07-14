# Environment Package Recovery

## Explicit error codes

- `PACKAGE_NOT_PERSISTED`
- `PACKAGE_NOT_PRODUCTION_READY`
- `PACKAGE_APPROVAL_REQUIRED`
- `PACKAGE_BUDGET_NOT_APPROVED`
- `PACKAGE_OUTPUT_GENERATION_FAILED`
- `PACKAGE_OUTPUT_STORAGE_FAILED`
- `PACKAGE_OUTPUT_IDENTITY_DRIFT`
- `PACKAGE_REQUIRED_OUTPUT_MISSING`
- `PACKAGE_CANONICAL_CONFLICT`
- `CDS_HANDOFF_BLOCKED`
- `SCHEDULER_JOB_LOST`

## Recovery actions

| State | Action |
|-------|--------|
| Partial completion | `POST environment-package-worker` resumes pending/failed only |
| Failed companion | Retry worker tick — desktop master reused |
| Lost polling | Jobs persist in Supabase — worker idempotent |
| Canonical conflict | Prior canonical superseded on explicit promotion |

## Diagnostics

`GET environment-package-status` exports Environment Package Diagnostic JSON fields.
