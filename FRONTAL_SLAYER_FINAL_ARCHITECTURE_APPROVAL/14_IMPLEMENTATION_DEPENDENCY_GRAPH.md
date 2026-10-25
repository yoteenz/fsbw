# 14 — Implementation Dependency Graph

## Priority bands (brief §07)

| Band | Meaning | Sprints |
|---|---|---|
| **P0A** | Immediate security and payment containment. **Does not wait for page-tree approval.** | S0B-1 (database), S0B-2 (application) |
| **P0B** | Authoritative orders and payment foundation | S1 (order of record), S1B (Build-A-Wig price authority) |
| **P1** | Customer and admin architecture | S2 (customer core), S3 (admin core) |
| **P2** | Membership and rewards completion | S4 |
| **P3** | Extended experiences and integrations | S5, S6 |
| — | Continuous verification | S7 (a final gate, but test work runs inside every sprint) |

S0A (founder approval) runs **alongside** P0A, not ahead of it.

## Graph

```
                ┌──────────────────────── S0A Founder approval (trees B1/C1, rules D*) ───────────────┐
                │                                                                                   │
S0B-1 DB containment ─┐                                                                             │
 (grants, policies,   │                                                                             │
  trigger, SQL counts)├─► S1 Order of record ─┬─► S2 Customer core ─────────┐                       │
S0B-2 App containment ┘   (orders, items,     │   (AccountShell, overview,   │                       │
 (tickets, autopay,       status events,      │    order detail, settings)   ├─► S4 Rewards ─► S6 ───┤
  BAW block, membership,  webhook dedupe)     ├─► S3 Admin core ────────────┘   (ledgers,     Affiliate,
  mock quarantine)                            │   (menu, Command Center,         Slay Challenge, marketing,
                                              │    orders admin, customers,      admin rewards)  support
S1B BAW price authority ──────────────────────┴─► S5 Hair / BAW / community ◄── (needs S4 ledger for rewards on approval)
 (single option & price catalogue,                (My Hair, results, saved builds, reviews public, Slay Cam)
  server quote parity) ─► re-enables BAW card checkout
                                                                    S7 Verification gate (staging E2E, axe, security regression)
```

## Hard dependencies (cannot start before)

| Package | Requires | Why |
|---|---|---|
| S1 | S0B-1 (legacy order policies dropped) | Otherwise clients can still write `orders` JSON while new tables land |
| S1 | Decision C4 (order status vocabulary) | Status enum and events |
| S1B | Decision E5 (who owns the price catalogue) | Admin-editable vs code-defined changes the design |
| S2 | S1 API contract (`GET /api/orders` v2, order detail endpoint) | Order pages read the new records |
| S3 | S1 API contract + `admin_roles` (decision C2) | Admin order actions and permission gating |
| S4 | S1 (purchase events feed points) + decisions D1–D10 | Ledgers need real earning events and approved rules |
| S5 | S1 (owned units, order snapshots), S1B (builds priced), S4 (rewards on approval), decisions E1–E6, F1–F4 | — |
| S6 | S4 (wallet/points ledgers), `support_requests` | Affiliate and referral credits post to ledgers; inbox reply |
| S7 final | Staging Supabase branch with seeded test accounts (decision H2) | Signed-in E2E cannot run against production |

## Soft dependencies (can proceed in parallel with a contract)

- **S2 ∥ S3** once the S1 order API contract (OpenAPI-style doc) is frozen. Both consume it; neither writes orders outside it.
- **S1 ∥ S1B.** They meet at the checkout intent endpoint; BAW lines stay blocked until S1B lands.
- **S0B-2 ∥ S0B-1.** The app-code containment does not need the migration, except that the Slay Ticket webhook crediting relies on the existing ledger.
- **Shell extraction** (`AccountShell`, `AdminPageShell`) can start in S2/S3 against existing data, because it is presentation-only.

## Shared contracts that unlock the most

| Contract | Defined in | Consumers |
|---|---|---|
| Order API v2 (list, detail, status events, admin mutations) | S1 | 14 pages (customer orders, detail, review, concierge, overview; admin orders, detail, Command Center, customers, finance, inventory, approvals) |
| Ledger API (balances, activity, grant/reverse) | S4 | Rewards (3 tabs), load card, checkout, overview, affiliate, referrals, admin rewards, customer detail |
| `customer_notifications` events | S2 | Alerts, overview, every notifying workflow |
| `support_requests` threads | S6 (table can land in S2 if MY REQUESTS ships early) | Concierge, settings, order detail, admin inbox |
| Account / admin shells | S2 / S3 | All pages |

## Critical path (shortest route to a launchable account and admin)

`S0B-1 + S0B-2 → S1 → (S2 ∥ S3) → S4 → S7 gate`. S1B runs alongside S1 to restore custom-wig card checkout. S5 and S6 complete the extended experiences after launch-critical flows are verified, unless the founder makes them launch-blocking (decision H1).
