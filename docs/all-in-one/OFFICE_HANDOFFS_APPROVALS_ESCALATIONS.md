# Office Handoffs, Approvals & Escalations

## Handoffs

Structured cross-team transitions (e.g. Permitting → Insurance).

| Field | Notes |
|-------|-------|
| fromTeamId / toTeamId | Operational teams |
| organizationId | Customer |
| relatedEntityType / relatedEntityId | Canonical link |
| status | pending → accepted → in_progress → completed (or declined) |

History preserved: creator, accepter, timestamps, notes.

Sprint 13 establishes infrastructure; Sprint 14 may automate chains.

## Approvals

`OfficeApprovalRequest` for protected actions:

- Manual financial adjustments
- Quote overrides (future)
- Sensitive record changes (future)

Statuses: `pending` · `approved` · `rejected` · `cancelled` · `expired`

Reviewers need `approvals.review`. Decisions notify requester via notification engine.

## Escalations

Higher-attention flag — not every overdue item.

Levels: `attention` · `high` · `critical` (critical used sparingly)

Lifecycle: created → acknowledged → resolved with resolution note.

Linked to source work item when applicable.

## Audit

Approval decisions and sensitive changes appear in security audit view (`audit.read`).

Operational activity remains in `/office/activity`.

## Permissions summary

| Capability | Permission |
|------------|------------|
| View approvals | `approvals.read` |
| Review approvals | `approvals.review` |
| View/manage escalations | `escalations.read` / `escalations.manage` |
| Audit log | `audit.read` |
