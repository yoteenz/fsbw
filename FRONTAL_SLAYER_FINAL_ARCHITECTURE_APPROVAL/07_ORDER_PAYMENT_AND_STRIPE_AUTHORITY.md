# 07 — Order, Payment and Stripe Authority

**Status: architecture for approval.** No payment behaviour was changed in this sprint, no Stripe call was made, and no migration was run. Current-state facts come from a code read (`evidence/X2_crossproject_stripe_routes.md` §3, with `file:line`) and the initial audit (docs 13, 14). Anything not confirmed in code is marked UNVERIFIED.

## 1. The rule

> **Stripe decides whether money moved. The server decides what was bought and what it costs. The database is the order of record. The browser only displays.**

| Question | Authority (target) | Authority today | Gap |
|---|---|---|---|
| What does this cart cost? | `POST /api/checkout/quote` (server catalogue, server FX) | Server for catalogue units and hair-analysis lines; **client** for vouchers, cash, gift balance, tip, shipping, tax; BAW options and BCF bundles unresolved | R-03, R-12 |
| Did the customer pay? | Stripe event delivered to `/api/stripe/webhook`, signature-verified | Same for products and membership. **No Stripe at all** for bookings, deposits, gift cards and Slay Tickets | R-05, R-14 |
| What did they buy? | `customer_orders` + `customer_order_items`, written in the webhook transaction from the server quote stored at intent time | Browser localStorage (`order-N`) vs a generic server JSON row (`order-pi-…`, `items: 1`, no lines) | R-11 |
| What is the order number? | DB sequence | Per-browser counter starting at 001 | R-11 (BW-22) |
| What state is it in? | `order_status_events` (canonical vocabulary, decision C4) | Admin localStorage | R-11 (BW-02) |
| Was it refunded? | `order_refunds`, confirmed by `charge.refunded` | Nowhere. Only the membership-upgrade proration refund exists in code | R-07 |
| Is the member premium? | Webhook-written subscription columns + `membership_events` | Webhook-written columns (correct) **plus** a non-Stripe CONFIRM ORDER that sets premium in localStorage | R-06 |
| Did they cancel? | Stripe `cancel_at_period_end` via portal or server endpoint | Local flag only; Stripe keeps billing | R-15 |
| Which card is charged off-session? | Server reads `profiles.stripe_customer_id` and verifies `pm.customer` | Client-supplied ids in `meetings.metadata` | R-09 |

## 2. Current Stripe surface (from code)

**Stripe is imported in 4 files.** There are **no idempotency keys**, **no customer portal**, **no cancellation endpoint**, **no product or booking refund**, and **no `charge.refunded` or dispute handler**. Webhook events are **not stored** and there is no event-id dedupe table.

| Call site | Calls | Purpose |
|---|---|---|
| `api/stripe/create-checkout-session.ts` | customers.create, subscriptions.retrieve/update, subscriptionSchedules.*, invoices.list, paymentIntents.retrieve, charges.retrieve, **refunds.create**, checkout.sessions.create | Membership purchase, upgrade (immediate, with proration refund) and downgrade (at period end) |
| `api/stripe/create-product-payment-intent.ts` | customers.create (only with `savePaymentMethodForFuture`, which no client sends), paymentIntents.create | Product cart. Accepts `body.stripeCustomerId` without an ownership check (`:137`) |
| `api/booking/autopay-final-payment.ts` | paymentIntents.create (`off_session`, `confirm:true`) | Booking final balance from client-supplied metadata |
| `api/stripe/webhook.ts` | webhooks.constructEvent, subscriptions.retrieve | Event handling (Node runtime; the setup doc's "Edge" claim is stale) |

| Webhook event | What it writes today | Target change |
|---|---|---|
| `checkout.session.completed` (subscription) | `profiles` membership columns; welcome email | + `membership_events`; welcome credit as `wallet_ledger` entry (D3) |
| `invoice.paid` | `profiles` tier/period; `membership_payments` (deduped by invoice id) | + `membership_events`; anniversary handled by scheduled job (D11) |
| `invoice.payment_failed` | `profiles.last_payment_failure_at`; `membership_payment_failures` (**duplicates on retry**) | Unique invoice id (ENG-09); customer banner + email |
| `customer.subscription.updated` | status, auto_renew, period_end. **Tier not updated** | Also update tier from the price |
| `customer.subscription.deleted` | Back to STANDARD | + `membership_events` |
| `payment_intent.succeeded` (`product_order`) | Read-modify-write of `orders.active_orders` JSON; generic order; **amount in charge currency recorded as USD**; emails; **no loyalty points**; hair-analysis credit grant | Insert `customer_orders` + items from the stored quote; record currency and USD separately (ENG-10); points via `loyalty_ledger`; inventory decrement; referral hook |
| *(ignored)* `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.*`, `checkout.session.expired` | — | Handle `charge.refunded` (S3) and disputes (S3: flag order + SYSTEM ALERT) |

## 3. Checkout flows: current → target

| Flow | Today | Interim (S0B-2) | Target |
|---|---|---|---|
| Catalogue units | Stripe PI at list price; discounts shown but not charged → **charge ≠ displayed total** | Show the server quote total only; hide discount application until the ledger exists, or apply discounts in the quote (UNVERIFIED which is less disruptive; S1 decides in-sprint) | Quote applies vouchers/cash/points reservations; PI amount = quote total |
| Build-A-Wig custom lines | Unresolved → card blocked; "WIG" name priced $740 without options | Decision **A2** option 1: "Request my custom quote" → admin consult offer → pay server-held amount | S1B: server catalogue prices every option (E5) |
| BCF bundles | Always unresolved → card blocked | Same as today, with a clear message | S1B: bundle price in the server catalogue |
| Special offers | Server ignores `isSpecialOffer` | Same, clear message | Offer price from `special-offer-config` server-side |
| Hair-analysis credits | Stripe PI; webhook grants via RPC; **4-pack grants nothing live** (SQL accepts 1/3/6) | S0B-1 SQL accepts the app's pack sizes; A8 remediation for past 4-pack buyers | Unchanged pattern, with `hairstyle_analysis_credit` ledger rows |
| Membership | Stripe Checkout (correct) + non-Stripe CONFIRM ORDER (free premium) | CONFIRM ORDER disabled in production (A3) | Unchanged Stripe path; return URL `/checkout/upgrade?stripe=success&session_id=…` stays |
| Membership cancel / payment methods | Local flag; raw card form | Stripe Customer Portal (A4 option 1) | Portal or in-app (A4) |
| Bookings and consult deposits | **No Stripe**; client card form accepts a founder dummy PAN | Deposit through a Stripe PI using the existing server quote lines (`booking-appointment`, `booking-consult`) or mark "pay at consultation" (UNVERIFIED which the founder prefers: part of A7) | Stripe PI; meeting created by the webhook |
| Booking autopay | Client ids; no idempotency; cron dead (GET vs POST, wrong secret name) | Stays off (A7); fix inputs before fixing the cron (ENG-08) | Server-resolved PM, server amount, idempotency key `meeting_id:final` |
| Gift cards | No payment, no codes, no ledger | Purchase disabled or "coming soon" (part of A6 scope; UNVERIFIED whether the founder wants it kept visible) | Stripe PI → `gift_card_codes` → `wallet_ledger` |
| Slay Tickets | Credited from client lines with no payment proof | Disabled (A6) | Stripe PI → webhook → ticket ledger |

## 4. Order of record (S1)

```
client ──► POST /api/checkout/quote ─────────► quote {lines, totals, quote_id, expires_at}   (server-priced, stored)
client ──► POST /api/checkout/intent {quote_id} ► customer_orders(status=PENDING_PAYMENT, number=nextval)
                                                 + customer_order_items (frozen spec snapshot)
                                                 + Stripe PI (amount = quote total, metadata.order_id,
                                                   idempotency key "order_id:create")
Stripe ───► webhook payment_intent.succeeded ──► insert stripe_webhook_events(event_id) ON CONFLICT DO NOTHING
                                                 → if new: order PAID, order_status_events, ledger earn,
                                                   inventory decrement, referral hook, emails
nightly ──► reconcile Stripe PIs ↔ orders ─────► SYSTEM ALERTS for orphans / amount mismatches
```

- **Idempotency:** Stripe idempotency key on every create; `stripe_webhook_events` unique `event_id`; ledger unique `(reason, source_type, source_id)`.
- **Backwards compatibility:** the existing `orders.active_orders` JSON stays as a read projection during migration (doc 15 S1 rollback). SITE00 does not read `orders` (X2 §1a).
- **Currency:** store `charge_currency`, `charge_amount_minor`, `usd_total_cents`, `fx_rate` separately.
- **Order numbers:** DB sequence (ENG-01). Existing local `order-N` numbers are displayed as "legacy reference" only where they exist on the customer's device (UNVERIFIED how many real customers hold local orders; 0 production server orders at audit time).

## 5. Refunds and cancellations (S3)

| Step | Rule |
|---|---|
| Who can refund | ADMIN up to a threshold; FOUNDER above it (decision C2; threshold is a founder value) |
| How | `POST /api/admin/orders/:id/refund` → Stripe `refunds.create` with idempotency key `order_id:refund:<n>` → order shows REFUND_PENDING |
| Confirmation | `charge.refunded` webhook writes `order_refunds` and the final status |
| Side effects | Ledger reversals for points earned, cash/vouchers consumed, referral credit; inventory restock if not shipped |
| Customer | Order detail shows the refund line; email + alert |
| Failure | Stripe error → no state change, error shown; partial refunds allowed up to captured amount |

## 6. Remediation for past money defects (decision A8)

Customers affected by the 4-pack defect (R-10), undelivered consult add-ons and PSA picks (R-13), and anything charged through a path later found wrong are identified by **read-only** queries against Stripe and the database in S0B-2, then listed for the founder. Refund, credit or delivery is the founder's choice per case. **No remediation was performed or counted in this sprint** (counts are UNVERIFIED).

## 7. Tests that prove authority (see doc 19)

- Parity: server quote total = PI amount for every catalogue line, discount combination and (S1B) BAW option combination.
- Tamper: a modified client total, line or `stripeCustomerId` is ignored.
- Replay: a replayed webhook event changes nothing.
- No client path grants membership, tickets, credits, cash or points (static grep gate + E2E).
- Refund: Stripe test refund → `order_refunds` row → ledger reversal → customer sees it.
