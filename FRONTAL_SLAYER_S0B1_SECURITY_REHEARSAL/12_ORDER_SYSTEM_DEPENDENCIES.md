# 12 — Order System Dependencies (R-11 readiness)

R-11 (no authoritative server-side order record) is **not fixed by S0B-1** and stays CRITICAL. This document checks that the proposed S1 order model **can coexist** with the S0B-1 restrictions, and lists the S1 dependencies.

## 1. Coexistence with S0B-1 (verified locally)

| S0B-1 change | Effect on the S1 model | Evidence |
|---|---|---|
| M2 removes customer INSERT/UPDATE on `orders` | **Required by S1.** Orders are written only by the server (webhook / admin API with the service role). Customers keep SELECT on their own rows | SEC-11/12 blocked; REG-11 (service write) PASS; REG-15 (customer read) PASS |
| M2 removes customer writes on `meetings` | Booking records are server-authored, so client-supplied autopay card IDs can't be written directly | SEC-14/15/16 blocked; REG-12 PASS |
| M2 removes customer writes on `notifications` / `reviews` | Order-status notifications and post-delivery reviews become server-authored | SEC-17/19 blocked; REG-13/14 PASS |
| M1A server-only RPCs | The same pattern applies to S1: any `SECURITY DEFINER` order function must be service-only from day one | — |
| Service-role writes still pass the profile guard | Webhook membership updates work | REG-19 PASS |

**No conflict found.** S1's server-authoritative model is the direction S0B-1 already enforces.

## 2. S1 contracts and dependencies

| Contract | Table / object (proposed in the prior package) | Writer | Reader(s) | Depends on | Notes |
|---|---|---|---|---|---|
| Order | `customer_orders` (id, number from a DB sequence, user_id, status, totals in cents, `charge_currency`, `usd_total_cents`, `fx_rate`, `quote_id`, created_at) | Server: intent creation + webhook | Customer (own rows, RLS SELECT); admin API | M2 (no customer writes); C4 (status vocabulary) | No browser storage as source of truth |
| Order items | `customer_order_items` (frozen line spec snapshot, unit price, options JSON) | Server, from the stored quote | Customer, admin | Server quote (S1B for BAW) | Holds the BAW configuration snapshot |
| BAW configuration | `saved_configurations` + snapshot in items | Server | Customer (MY HAIR on mobile; desktop per XD-1), admin | E5 catalogue (S1B), A2 interim | Visual presentation stays per experience |
| Checkout session / quote | `checkout_quotes` (server-priced lines, expiry) | Server | Server | `resolveQuote` fix (S1B), S0B-2 #1 | The PI amount must equal the quote total |
| Payment events | `stripe_webhook_events` (event_id UNIQUE, type, received_at, processed_at) | Webhook | Admin, reconciliation | Real `whsec_` in staging | Idempotency by event ID (absent today) |
| Status history | `order_status_events` | Server / admin API | Customer timeline, admin | C4 | One timeline vocabulary shared by both customer experiences |
| Refunds | `order_refunds` + `charge.refunded` handler | Admin API (Stripe refund with idempotency key) + webhook | Customer, admin | C2 (money authority), R-07 | No handler exists today |
| Fulfilment and tracking | Shipment fields + status events | Admin API | Customer, admin | C4 | Replaces admin localStorage (BW-02) |
| Membership-linked purchases | `membership_events` (Stripe event ID UNIQUE) | Webhook | Customer, admin | R-15 fix (S0B-2 #3) | |
| Reward redemptions | Ledger reservations inside the order transaction | Server | Customer, admin | S4 ledgers; D-wave decisions | Not before S4 |
| Customer and admin order history | Views over `customer_orders` | — | Mobile `/account/orders`, the desktop Penthouse "My Orders" presentation (XD-1), admin orders | XD-1 for the desktop presentation | One record, separate presentations |

## 3. Explicit non-goals for S1

- No fake order history. The founder seed and Concierge test orders are removed in S0B-2 (#7).
- No local browser storage as the authoritative order record. The existing JSON stays only as a read projection during migration.
