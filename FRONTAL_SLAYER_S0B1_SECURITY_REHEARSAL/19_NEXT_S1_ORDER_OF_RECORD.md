# 19 — Next: S1 Order of Record (R-11)

R-11 stays **CRITICAL and OPEN**. Doc 12 shows S0B-1 is a prerequisite for S1 and conflicts with nothing in it.

## 1. Preconditions

| Precondition | Status |
|---|---|
| S0B-1 M2 in production (customers cannot forge order rows) | Rehearsed locally; production needs A1b |
| S0B-2 #1 (BAW priced by quote) and #5 (Slay Tickets) | Not started |
| C4 order status vocabulary and SLAs (founder) | Not recorded |
| Staging with Stripe test mode (H2) | BLOCKED |

## 2. Sprint plan

| Step | Deliverable | Verification |
|---|---|---|
| S1-1 | Additive tables: `customer_orders` (DB-sequence order numbers), `customer_order_items`, `order_status_events`, `stripe_webhook_events` (event_id UNIQUE), `checkout_quotes`. RLS: customer SELECT own rows; **no customer writes**; service role writes | Same harness pattern as this sprint: NEG (customer insert/update/forge) + POS (server writes, customer reads) on the replica, then staging |
| S1-2 | Quote → PaymentIntent: the PI amount equals the stored quote total; quote expiry | Unit + Stripe test mode |
| S1-3 | Webhook writes the order inside one transaction, idempotent by Stripe event ID | Stripe CLI event resend: one order, one event row |
| S1-4 | Status history and fulfilment through the admin API (replaces admin localStorage) | Admin E2E on staging |
| S1-5 | Readers: mobile `/account/orders`, the desktop Penthouse "My Orders" presentation (after XD-1), admin orders — one record, separate presentations | Cross-device parity with fixtures |
| S1-6 | JSON projection kept read-only during migration; flag to switch readers | Rollback = readers back to the projection |
| S1-7 | `charge.refunded` handler + `order_refunds` | Stripe test refund |

## 3. Non-goals

- No fake order history; no browser storage as the source of truth.
- No visual redesign of any experience.
- Rewards ledger reservations wait for S4.
