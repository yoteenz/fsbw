# All In One — Service Orchestration

**Sprint:** 14 — integration boundaries

---

## Service Request → Workflow

When a service request is submitted (`demoActions.submitServiceRequest`), eligible services resolve a template via `resolveTemplateIdForService()` and call `createWorkflowInstanceFromRequest()`.

**One workflow per service request** — idempotent; duplicates suppressed.

---

## Workflow → Office Work

Active staff steps create `OfficeWorkItem` records idempotently via `officeWorkItemId` on the step instance.

Work types map from step type (`document_review`, `review`, …).

---

## Workflow → Customer Command Center

`getCustomerWorkflowActions()` feeds `clientCommandCenterService` attention candidates with centralized dedupe keys.

Customer sees plain-language CTAs — not internal step IDs.

---

## Workflow → Document Vault

Document requirement defs reference canonical vault document types. Reuse allowed when verified document exists (`buildWorkflowContext.hasVerifiedDocument`).

`handleDocumentReceivedForWorkflow` advances document_request steps and emits `DOCUMENT_RECEIVED`.

---

## Workflow → Billing

Payment gate steps wait on canonical `billingStatus` on the service request. `confirmPaymentForWorkflow` demo action emits `PAYMENT_CONFIRMED`.

Workflow does **not** own invoice/payment truth.

---

## Workflow → Road Ready

Automation action `RECALCULATE_ROAD_READY` is defined; workflow triggers recalculation but does **not** own verification state.

---

## Workflow → Notifications

Rules may emit notifications with dedupe keys. Sprint 14 stubs notification sends in demo; policy architecture supports audience, cooldown, dedupe.

---

## Workflow → Handoffs / Approvals / Escalations

Step types and automation actions integrate with Sprint 13 Office primitives. Approval gates block until authorized decision exists.

---

## Division orchestration (react mode)

| Domain | Workflow role |
|--------|---------------|
| Load | Consumes load events; does not rewrite load status |
| Factoring | Consumes submission lifecycle events |
| Brokerage | Consumes shipment lifecycle events |
| Insurance | Consumes request/policy events |
| Renewals | Renewal window may spawn workflow instance |

---

## Status ownership

See `WORKFLOW_SOURCE_OF_TRUTH.md` for the full matrix.
