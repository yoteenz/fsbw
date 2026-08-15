# All In One — Notification System

**Sprint:** 06 · **Last updated:** 2026-08-15

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

Includes: `DOCUMENT_*`, `DEADLINE_*`, `RENEWAL_*`, `QUOTE_*`, `INVOICE_*`, `PAYMENT_*`, `RECEIPT_*`, `ROAD_READY_ATTENTION_REQUIRED`, `SERVICE_REQUEST_STATUS_CHANGED`, `MESSAGE_RECEIVED`, etc. (see `notificationTypes.ts`).

Billing events use category **`billing`**.

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
