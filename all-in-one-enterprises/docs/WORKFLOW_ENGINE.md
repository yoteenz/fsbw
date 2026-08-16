# All In One — Workflow Engine

**Sprint:** 14 · Workflow Automation + Service Orchestration  
**Module:** `src/all-in-one/workflow/`

---

## Purpose

The workflow engine is the **business process orchestration layer** between Sprint 12 (Customer Command Center) and Sprint 13 (Office 2.0). It coordinates repeatable services without replacing canonical domain systems.

**The engine coordinates work. It does not make legal/compliance determinations.**

---

## Architecture

```
Domain Event (document, payment, service request, load, …)
  → Workflow Orchestrator
  → Dependency evaluation + step activation
  → Office Work / Customer Action / External Wait / System Action
  → Completion criteria
  → Next step / phase / service completion
```

### Core types (`workflowTypes.ts`)

| Concept | Description |
|---------|-------------|
| `WorkflowTemplate` | Repeatable process definition (Operating Authority, USDOT, …) |
| `WorkflowTemplateVersion` | Immutable published version; instances pin to version at start |
| `WorkflowStepTemplate` | Meaningful business step with type, completion method, visibility |
| `WorkflowDependencyTemplate` | Sequential, parallel, or conditional edges |
| `WorkflowInstance` | One execution for one customer/service request |
| `WorkflowStepInstance` | Runtime step with status, owner, due date, linked Office work |
| `WorkflowEventRecord` | Audit trail for transitions |
| `AutomationRule` | WHEN event IF conditions THEN actions |
| `ServiceJourney` | Bundle of linked workflow instances (e.g. New Carrier Startup) |

### Modules

| File | Role |
|------|------|
| `workflowValidation.ts` | Cycle detection, template validation, condition engine, ready-step resolution |
| `workflowEngine.ts` | Weighted progress, instance status derivation, recalculation |
| `workflowOrchestrator.ts` | Instance creation, step work items, document/payment hooks, pause/resume |
| `domainEvents.ts` | Event bus, automation matching, idempotent execution records |
| `businessDays.ts` | Business-day add/count with configurable holidays |

---

## Template versioning

- States: **draft**, **published**, **retired**
- Published versions are **immutable**
- Active instances remain on the version they started with
- Operating Authority **v1** and **v2** seeded for versioning demo

---

## Step types

`customer_action`, `staff_action`, `document_request`, `document_review`, `internal_review`, `approval`, `payment`, `external_submission`, `external_wait`, `follow_up`, `handoff`, `system_action`, `milestone`, `completion`

---

## Completion methods

`automatic`, `manual`, `system_verified`, `staff_verified`, `external_confirmed`

Protected steps (`document_review`, `approval`, `internal_review`) require staff actor to complete.

---

## Instance states

`not_started`, `active`, `blocked`, `waiting_on_customer`, `waiting_internal`, `waiting_external`, `ready_for_review`, `completed`, `cancelled`, `failed`, `paused`

---

## Customer visibility

Each step declares: `customer_visible`, `customer_summary_only`, or `internal_only`.

---

## Demo routes

| Route | Purpose |
|-------|---------|
| `/debug/all-in-one/office/workflows` | Staff workflow queue |
| `/debug/all-in-one/office/workflows/:id` | Instance detail + timeline |
| `/debug/all-in-one/office/settings/workflows` | Template manager |
| `/debug/all-in-one/portal/services/:requestId` | Customer service tracker |
| `/debug/all-in-one/portal/roadmap` | Service journey roadmap |

---

## Demo store

**Version 14** — `workflowSeed.ts` seeds templates, instances, journeys, automation rules.

Legacy request-board workflow under `src/all-in-one/office/workflows/` remains for division queue columns; Sprint 14 canonical engine is separate.
