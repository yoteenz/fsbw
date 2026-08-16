# Office Work Model

## OfficeWorkItem

Conceptual internal work abstraction referencing canonical domain records.

| Field | Description |
|-------|-------------|
| `sourceDomain` | Origin system (service_request, document, insurance, dispatch, etc.) |
| `sourceEntityType` / `sourceEntityId` | Canonical record reference |
| `organizationId` | Customer organization |
| `title` / `description` | Staff-facing action text |
| `workType` | review, follow_up, document_review, billing, etc. |
| `division` | Operational team division |
| `queueId` | Operational queue membership |
| `priority` | urgent · high · normal · low |
| `status` | Staff-facing lifecycle (see below) |
| `waitingOn` | Explicit dependency (customer, all_in_one, government, etc.) |
| `assignedUserId` / `assignedTeamId` | Ownership |
| `dueAt` | Internal follow-up deadline (not legal expiration) |
| `version` | Optimistic concurrency for assignment |

## Status model

| Status | Label |
|--------|-------|
| `new` | New |
| `assigned` | Assigned |
| `in_progress` | In Progress |
| `waiting_on_customer` | Waiting on Customer |
| `waiting_externally` | Waiting Externally |
| `waiting_internal` | Waiting Internal |
| `ready_for_review` | Ready for Review |
| `completed` | Completed |
| `cancelled` | Cancelled |

## Waiting on

`customer` · `all_in_one` · `external_provider` · `government` · `carrier` · `shipper` · `insurance_partner` · `factoring_provider` · `other` · `none`

## Assignment history

`OfficeAssignmentRecord` preserves assignee, assigner, timestamp, optional reassign reason — history is append-only.

## Queues

Queue counts derive from work item state — no manual counter fields.

Examples: `new_service_requests`, `document_review`, `customers_waiting_on_us`, `unassigned`, `approvals`.

## Aging & stale detection

- **Overdue:** `dueAt < now` and status active
- **Stale:** no update for `STALE_WORK_DAYS` (default 5) — labeled "No recent activity" internally

## Attention deduplication

`OfficeAttentionAggregator` uses `dedupeKey` (e.g. `insurance-expiry:{orgId}:{date}`) to merge cross-domain signals into one staff attention item.

## Completion

Completed/cancelled items leave active queues but remain in history and activity log.
