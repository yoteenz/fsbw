# All In One — Payment Security

**Sprint:** 07 · **Last updated:** 2026-08-15

---

## Provider boundary

All In One billing uses a **payment provider abstraction** (`PaymentProvider` interface). The application never stores raw card numbers, CVV, or full PAN data.

Sprint 07 ships **demo mode** and **disabled mode** only inside `/all-in-one/*`. No Frontal Slayer Stripe credentials or tables are used.

---

## PCI minimization strategy

- Prefer **provider-hosted** or **tokenized** payment collection when provider mode is enabled.
- Backend receives provider identifiers and status — not card credentials.
- Do **not** claim PCI compliance merely because a provider is integrated.

---

## Secrets

| Rule | Detail |
|------|--------|
| Server-only | Provider secret keys must never use `VITE_` prefix |
| Publishable keys | May be exposed to frontend only when provider design requires |
| Webhook secrets | Stored server-side; never in client bundle |

---

## Webhook foundation (provider mode)

When activated:

1. Validate provider signature on every webhook
2. Idempotency keys / unique constraints on provider event IDs
3. Do not process the same success event twice (one payment, one receipt, one invoice update)
4. Log failures without sensitive card data
5. Retry-safe handlers

Sprint 07 documents architecture; demo mode bypasses webhooks.

---

## Environment separation

| Environment | Payment |
|-------------|---------|
| Demo / Cloud preview | `VITE_AIO_PAYMENT_MODE=demo` (default) |
| Staging | Provider test/sandbox only |
| Production | Live provider credentials — never in preview |

**Non-negotiable:** `/debug/all-in-one` and cloud preview must not charge real cards.

---

## Refund controls

Refunds require provider API in provider mode. Restrict to Administrator / Super Admin roles. Do not allow casual refund buttons without authorization audit.

---

## Logging restrictions

Audit events may record payment status, amounts, provider IDs — never raw payment credentials or full card numbers.

---

## Demo payment flow

Demo mode offers **Simulate Success / Failure / Cancel** — no fake card entry. Clearly labeled DEMO in UI.
