# All In One — Notification System

**Sprint:** 11 · **Last updated:** 2026-08-15

---

## Purpose

Unified **event-driven** in-app notification engine. Components do **not** emit duplicate alerts on every dashboard render.

---

## Routes

| Surface | Path |
|---------|------|
| Customer Notification Center | `/all-in-one/portal/notifications` |
| Notification preferences | `/all-in-one/portal/settings/notifications` |
| Office | Topbar count (staff notifications in demo store) |

---

## Code locations

| Module | Path |
|--------|------|
| Types & preferences | `src/all-in-one/notifications/notificationTypes.ts` |
| Build, dedupe, filters | `src/all-in-one/notifications/notificationEngine.ts` |
| Expiration evaluation (idempotent) | `src/all-in-one/notifications/notificationScheduler.ts` |
| Demo persistence | `src/all-in-one/demo/vaultActions.ts` (`runExpirationEvaluation`) |

---

## Event types (centralized)

Includes: `DOCUMENT_*`, `DEADLINE_*`, `RENEWAL_*`, `QUOTE_*`, `INVOICE_*`, `PAYMENT_*`, `RECEIPT_*`, `ROAD_READY_ATTENTION_REQUIRED`, `SERVICE_REQUEST_STATUS_CHANGED`, `MESSAGE_RECEIVED`, dispatch load events, factoring events (see below), etc. (see `notificationTypes.ts`).

Billing events use category **`billing`**. Factoring events use category **`factoring`**.

---

## Factoring notification types (Sprint 09)

| Event type | Typical trigger |
|------------|-----------------|
| `FACTORING_HANDOFF_READY` | Load complete + docs — handoff ready (dispatch integration) |
| `FACTORING_ENROLLMENT_UPDATED` | Profile status change |
| `FACTORING_DOCUMENT_NEEDED` | Missing package document |
| `FACTORING_READY` | Package ready for specialist submit |
| `FACTORING_SUBMITTED` | Submission sent to provider (manual) |
| `FACTORING_ADDITIONAL_INFO_NEEDED` | Provider or staff requested carrier action |
| `FACTORING_APPROVED` | Provider approved submission |
| `FACTORING_DECLINED` | Provider declined |
| `FACTORING_FUNDING_PENDING` | Approved, awaiting provider funding report |
| `FACTORING_FUNDED` | Staff recorded provider-reported funding |
| `FACTORING_ISSUE_CREATED` | New factoring issue |
| `FACTORING_ISSUE_RESOLVED` | Issue closed |

Demo implementation: `factoringActions.ts` calls `buildNotification()` with `category: 'factoring'` and portal deep links to submission detail.

Preferences: factoring category toggle in notification preferences (in-app only Sprint 09).

---

## Brokerage notification types (Sprint 10)

| Event type | Typical trigger |
|------------|-----------------|
| `SHIPMENT_REQUEST_SUBMITTED` | Shipper submits request — staff alert |
| `BROKERAGE_QUOTE_AVAILABLE` | Quote sent to shipper |
| `BROKERAGE_QUOTE_ACCEPTED` | Shipper accepts — load conversion |
| `BROKERAGE_LOAD_NEEDS_COVERAGE` | Load awaiting carrier assignment |
| `BROKERAGE_LOAD_BOOKED` | Coverage booked / rate con path |
| `BROKERAGE_POD_NEEDED` | Delivery complete, POD missing |
| `BROKERAGE_POD_RECEIVED` | POD linked on load |
| `BROKERAGE_READY_TO_BILL` | `isReadyToBill()` satisfied |
| `SHIPPER_INVOICE_ISSUED` | `BSI-*` created |

Demo implementation: `brokerageActions.ts` calls `buildNotification()` with `category: 'brokerage'` and deep links to `/shipper/quotes/:id` or office brokerage routes.

Preferences: brokerage category toggle (in-app only Sprint 10).

**Visibility:** Notifications must not include carrier pay in shipper alerts or shipper charge in carrier alerts — see **`BROKERAGE_SECURITY.md`**.

---

## Insurance notification types (Sprint 11)

| Event type | Typical trigger |
|------------|-----------------|
| `INSURANCE_REQUEST_SUBMITTED` | Customer submits insurance help request — staff alert |
| `INSURANCE_INFORMATION_NEEDED` | Staff needs more info from customer |
| `INSURANCE_REQUEST_READY_FOR_REFERRAL` | Internal review complete — ready for partner |
| `INSURANCE_REFERRED` | Partner referral recorded — customer notified |
| `INSURANCE_PARTNER_UPDATE` | Partner handoff status change |
| `INSURANCE_QUOTE_REPORTED` | Quote option recorded — customer review |
| `INSURANCE_POLICY_RECORDED` | Policy intake or staff update |
| `INSURANCE_POLICY_EXPIRING` | Derived expiring_soon threshold |
| `INSURANCE_POLICY_EXPIRED` | Past expiration date |
| `INSURANCE_POLICY_REPLACED` | Replacement chain updated |
| `INSURANCE_COI_REQUESTED` | Customer COI request — staff queue |
| `INSURANCE_COI_ISSUED` | Authorized issuance recorded |
| `INSURANCE_COI_ACTION_NEEDED` | COI blocked — holder/policy info needed |
| `INSURANCE_RENEWAL_STARTED` | Renewal help request opened |
| `INSURANCE_RENEWAL_COMPLETED` | Renewal workflow closed |
| `INSURANCE_ROAD_READY_IMPACT` | Policy change affects Road Ready item |

Demo implementation: `insuranceActions.ts` calls `buildNotification()` with `category: 'insurance'` and deep links to `/portal/insurance/*` or `/office/insurance/*`.

Preferences: insurance category toggle (in-app only Sprint 11).

**Visibility:** Notification bodies must not include full policy numbers or present premiums as amounts owed to All In One.

---

## Architecture

```
Event source (document verify, upload, expiration threshold, renewal window)
  → CreateNotificationInput
  → dedupeKey check (shouldCreateNotification)
  → buildNotification → AioNotification in store
  → In-app delivery (Sprint 06)
```

Future channel adapters (stubbed): `email_future` · `sms_future` · `push_future`

---

## Deduplication

Example keys:

- `doc-expiring-30d:<documentId>`
- `doc-expired:<documentId>`
- `renewal-window:<renewalId>`

Running `runExpirationEvaluator()` multiple times must **not** create duplicate notifications.

---

## Scheduled evaluation

`runExpirationEvaluation()` and `runBillingEvaluation()` run on portal layout mount (demo). Production should use server-side cron/job — **not** browser timers as authoritative source.

Uses server/trusted time via `daysUntil()` in `calendarService`.

---

## Recipients

Based on: organization membership, `recipientType` (`customer` | `staff`), `staffId`, event category. Sprint 06 keeps rules simple; preferences UI allows in-app category toggles (critical notices may remain mandatory later).

---

## Read state

`read` · mark single · mark all read · `archived` (avoid permanent delete of operational history)

---

## Preferences

Default categories in `DEFAULT_NOTIFICATION_PREFERENCES`. Email/SMS shown as disabled / coming later until provider configured.

---

## Known limitations

- In-app only in Sprint 06
- No SMS/email/push providers connected
- High-volume reminder spam suppressed via dedupe keys (not duplicated in customer activity feed)
