# All In One — Renewal System

**Sprint:** 06 · **Last updated:** 2026-08-15

---

## Purpose

The **Renewal Center** answers: *What are we doing about upcoming expirations?* (Calendar answers *when*.)

Renewals reuse the **existing service request engine** — no separate business-process engine.

---

## Routes

| Surface | Path |
|---------|------|
| Customer Renewal Center | `/all-in-one/portal/renewals` |
| Office Renewal Center | `/all-in-one/office/renewals` |

---

## Code locations

| Module | Path |
|--------|------|
| Types | `src/all-in-one/renewals/renewalTypes.ts` |
| Definitions (IRP, insurance, registration, etc.) | `src/all-in-one/renewals/renewalConfig.ts` |
| Eligibility, build from documents, dedupe | `src/all-in-one/renewals/renewalService.ts` |
| Actions (start with AIO, self-managed, complete) | `src/all-in-one/demo/vaultActions.ts` |

---

## Renewal types

`registration` · `irp` · `insurance` · `permit` · `ifta` · `authority` · `tax` · `other`

Central definitions include `windowDays` (eligibility window before expiration).

---

## Status model

`upcoming` · `available` · `customer_action_needed` · `requested` · `documents_needed` · `under_review` · `in_progress` · `submitted` · `awaiting_external_action` · `completed` · `declined` · `self_managed` · `not_applicable`

Not every status applies to every renewal type.

---

## Lifecycle

```
Verified document expiration
  → Renewal record (dedupe key)
  → Customer: Start Renewal OR Self-Managed
  → [Start] Service Request → Office queue → documents → verify new credential
  → Old document superseded → Renewal completed → new expiration → calendar event
```

---

## Self-managed

Customer selects **I'm Handling This Myself** → `self_managed`. No service request created. Customer may upload renewed document to Vault afterward. System does not aggressively re-prompt for paid renewal service.

---

## Service request integration

`startRenewalWithAio()` calls `submitServiceRequest()` with pre-populated service from renewal definition (`serviceSlug`).

---

## Pricing

UI displays **"Pricing determined after review"** unless real catalog pricing exists. Government/third-party fees are **not** fabricated.

---

## Batch operations (Office)

Office Renewal Center **Batch View** summarizes counts (e.g. IRP due next month, insurance within 30 days, missing registrations).

---

## Idempotency

`renewalDedupeKey()` prevents duplicate active renewals for the same requirement/window.

---

## Future

- Payment checkout / government fee breakdown when approved data exists
- External agency filing APIs (explicitly out of Sprint 06 scope)
