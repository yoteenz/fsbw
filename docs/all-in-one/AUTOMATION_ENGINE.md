# All In One — Automation Engine

**Sprint:** 14  
**Module:** `src/all-in-one/workflow/domainEvents.ts`

---

## Event taxonomy

Initial events: `SERVICE_REQUEST_CREATED`, `SERVICE_REQUEST_ACCEPTED`, `QUOTE_ACCEPTED`, `PAYMENT_CONFIRMED`, `WORKFLOW_STARTED`, `STEP_ACTIVATED`, `STEP_COMPLETED`, `DOCUMENT_REQUESTED`, `DOCUMENT_RECEIVED`, `DOCUMENT_VERIFIED`, `DOCUMENT_REJECTED`, `CUSTOMER_RESPONDED`, `WORK_ITEM_COMPLETED`, `APPROVAL_GRANTED`, `APPROVAL_REJECTED`, `HANDOFF_ACCEPTED`, `EXTERNAL_SUBMISSION_RECORDED`, `FOLLOW_UP_DUE`, `RENEWAL_WINDOW_ENTERED`

Domain-specific events (loads, factoring, insurance) integrate via the same bus as those domains emit events in future sprints.

---

## Rule engine

```
WHEN [event]
IF  [structured conditions — no eval()]
THEN [typed actions]
```

### Supported actions

`CREATE_WORK_ITEM`, `ASSIGN_WORK`, `REQUEST_DOCUMENT`, `SEND_NOTIFICATION`, `SCHEDULE_REMINDER`, `CREATE_HANDOFF`, `CREATE_APPROVAL_REQUEST`, `CREATE_ESCALATION`, `ACTIVATE_STEP`, `COMPLETE_ELIGIBLE_SYSTEM_STEP`, `UPDATE_SERVICE_REQUEST_STATUS`, `RECALCULATE_ROAD_READY`, `CREATE_FOLLOW_UP`, `SURFACE_CUSTOMER_ACTION`

High-risk financial or verification mutations are **not** freely automatable.

---

## Idempotency

- Domain events carry `dedupeKey`
- Automation executions carry rule+event dedupe keys
- Duplicate event processing must not create duplicate work items, notifications, or handoffs

---

## Execution records

`AutomationExecution`: rule, event, status, actions executed, error, retry count

Failed safe actions surface in **Automation Exceptions** queue.

---

## Safety classes

| Class | Examples |
|-------|----------|
| `low_risk` | Internal reminder, recalculation |
| `medium_risk` | Customer notification |
| `high_risk` | Financial adjustment, protected verification bypass |

---

## Kill switch

`workflowKillSwitch.allNonEssentialDisabled` — disables system automation without destroying workflows.

Per-rule disable via `disabledRuleIds`.

---

## Dry run

`processEventThroughAutomation(store, event, dryRun=true)` records actions that **would** occur without mutations.

---

## Staff routes

- `/debug/all-in-one/office/settings/automations`
- `/debug/all-in-one/office/automation-exceptions`
