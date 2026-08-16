# All In One — CRM Conversion Engine

**Module:** `src/all-in-one/crm/conversionEngine.ts`

---

## Purpose

Transform a qualified lead + won opportunity into canonical customer relationships **without duplicate data entry**.

```
Lead → Opportunity (quote accepted) → Convert → Contact/Organization → Service Request(s) → Workflow(s)
```

---

## Conversion preview

`buildConversionPreview(store, leadId, opportunityId)` returns:

- Whether organization will be created or linked
- Service slugs from service interests
- Quote association
- Duplicate warnings

Shown on Prospect 360 before staff confirms.

---

## New customer

Creates canonical `Client` (organization), service requests from service interests, activates Sprint 14 workflows via `createWorkflowInstanceFromRequest`, updates quote `organizationId`.

---

## Existing customer

When `lead.organizationId` matches an existing client (demo: lead-d → client-b):

- **No** second organization
- New service requests only
- `wasExistingCustomer: true` on conversion record

---

## Idempotency

Key: `convert:{leadId}:{opportunityId}`. Duplicate convert clicks return existing `crmConversionRecords` entry — no duplicate clients, requests, or workflows.

---

## Gates

- Lead must not be `converted` or `do_not_contact`
- If opportunity has a quote, quote status must be `accepted`
- Payment is **not** implied by acceptance — billing owns payment state

---

## Post-conversion

- Lead → `converted`
- Opportunity → `won`
- Service interests → `converted`
- Staff opens Client 360; customer enters Client Command Center when portal account exists
