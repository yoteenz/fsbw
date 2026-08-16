# All In One — Workflow Source of Truth Matrix

**Sprint:** 14 — mandatory ownership boundaries

| Entity | Source of Truth | Workflow Role |
|--------|-----------------|---------------|
| Service Request | Service Request domain | Triggers workflow; consumes status updates |
| Workflow Template/Version | Workflow admin | Defines process; immutable when published |
| Workflow Instance/Step | Workflow engine | Orchestrates; pins to template version |
| Office Work Item | Office 2.0 work model | Created idempotently from active steps |
| Document | Vault | Workflow consumes requirement satisfaction |
| Invoice / Payment | Billing (Sprint 07) | Workflow consumes payment gate state |
| Load | Load domain (Sprint 08) | Workflow reacts to load events |
| Factoring submission | Factoring domain (Sprint 09) | Workflow reacts to factoring events |
| Brokerage shipment | Brokerage domain (Sprint 10) | Workflow reacts to brokerage events |
| Insurance policy/request | Insurance domain (Sprint 11) | Workflow reacts to insurance events |
| Road Ready item | Road Ready domain | Workflow may trigger recalc; does not verify |
| Renewal | Renewal domain (Sprint 06) | May spawn workflow; does not own expiration |
| Notification | Notification engine | Workflow rules may enqueue sends |
| Approval | Office approvals | Gates protected steps |
| Escalation | Office escalations | Rule-triggered; explicit thresholds |
| Handoff | Office handoffs | Template-defined division transitions |

## Invariants

1. Workflow does **not** autonomously declare legal/compliance status.
2. Published template versions are immutable.
3. Active instances stay on starting version unless explicit migration.
4. Duplicate domain events must be safe (idempotent).
5. Cancelled/paused workflows suspend inappropriate automation.
6. Internal-only steps never appear in customer views.
