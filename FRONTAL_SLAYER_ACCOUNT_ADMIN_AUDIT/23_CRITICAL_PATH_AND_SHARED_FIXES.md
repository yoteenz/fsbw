# 23 — Critical Path and Shared Fixes

**The shortest viable route to a complete account and admin experience is not 40 page fixes. It is five shared repairs that unblock whole families of pages at once.** Most "broken" pages in docs 09 and 10 are broken for the same few reasons: business records live in one browser's localStorage, the server has no ledger or order of record, and mock data fills the gaps.

## Critical blockers (must be fixed before the experience can be called complete)

| ID | Blocker | Families blocked | Evidence |
|---|---|---|---|
| CB-1 | **No server order of record** (stub orders; local rich orders overwritten; admin order ops local-only) | Customer orders, concierge, overview, reviews; admin orders, revenue, inventory, approvals, Command Center | doc 14 §2; BW-01/02/03/21/22 |
| CB-2 | **BAW custom wigs charged at base price through Stripe** | Checkout revenue; BAW | BW-04 |
| CB-3 | **Anon/authenticated can execute credit and usage RPCs** (live) | Hair analysis, PSA quotas | doc 13 C2 |
| CB-4 | **Value can be granted without payment:** Slay Tickets mint (C1); non-Stripe premium; booking autopay with client Stripe IDs (H1) | Rewards, membership, bookings | doc 13 |
| CB-5 | **Legacy permissive write policies live** on orders, meetings, notifications and reviews | Every order/meeting/review surface | doc 13 H3 |
| CB-6 | **Membership cancel doesn't cancel**; the 4-comparison purchase grants nothing (live) | Membership, hair analysis | BW-06/08 |
| CB-7 | **No rewards ledger** (points, vouchers, digital cash, referrals, affiliate, gift codes) | Rewards, wallet, referrals, affiliate, admin rewards | doc 15 |
| CB-8 | **Mock / fabricated data shown as live**, including test orders injected into real customers' history by Concierge | Trust across customer and admin | BW-25; doc 14 §4 |
| CB-9 | **Paid deliverables with no fulfilment** (consult style-analysis add-on; PSA picks) | Hair analysis | BW-09/10 |

**Count: 9 critical blockers.**

## The five shared fixes that unlock the most pages

| # | Shared fix | Pages it unblocks | Blockers resolved | Phase |
|---|---|---|---|---|
| **CP-0** | **Security and money hotfix pack**: revoke RPC grants; drop legacy policies; webhook-only credits; server Stripe IDs; BAW quote fail-closed; SQL counts; Stripe-only membership + portal cancel; remove test-order injection and fabricated stats | All payment-touching pages | CB-2, 3, 4, 5, 6, part of 8 | 0B |
| **CP-1** | **Server order of record** (`customer_orders` + items + `order_status_events`, server order numbers, PI-time creation, merge-not-overwrite sync) | ~14 pages: customer orders, order detail, review, concierge tracking, overview; admin orders, order detail, revenue, fulfilled, fraud, approvals forms, Command Center, customer detail orders tab, care entitlements | CB-1 | 1 |
| **CP-2** | **Shared shells + one account guard** (`AccountShell`, `AccountLayoutRoute`, `AdminPageShell`, `AdminDetailLayout`, `GlassDrawer`, `EmptyState`/`ErrorState`), with no visual change | Every page; removes ~12 copied nav bars, 4 sign-out variants and per-hop "Loading…" | consistency, mobile | 1–3 |
| **CP-3** | **Rewards ledgers** (`loyalty_ledger`, `wallet_ledger`, `customer_vouchers`, server codes, tier view) | Rewards (3 tabs), load card, overview wallet, checkout redemption, referrals, affiliate, admin rewards, admin customer detail | CB-7 | 4 |
| **CP-4** | **Mock-data quarantine**: all mock/seed/demo behind `?demo=1` on non-production only; founder "view as client" shows real data | Dashboard, clients, meetings, pending, reviews, alerts, revenue, orders, concierge, rewards, affiliate | CB-8 | 0B (injection) + 3 |

Two more shared fixes carry real leverage but come later:
- **CP-5: content submissions + storage bucket + consent.** Unlocks Slay Cam, reviews media, affiliate media, public reviews (Phase 5).
- **CP-6: `support_requests` + reply drawer.** Unlocks concierge replies, the admin inbox, MY REQUESTS and order-level help (Phase 6).

## Dependency graph

```
CP-0 hotfixes ──► CP-1 orders ──► customer order pages ─► overview panels
                     │                                  └► LEAVE A REVIEW reachable
                     ├──► admin orders / detail / Command Center order queues
                     └──► inventory (stock decrements from server orders)
CP-2 shells (parallel with CP-1) ──► every page refactor without visual drift
CP-4 mock quarantine (parallel) ──► honest admin numbers ──► Command Center
CP-1 + CP-3 ledgers ──► rewards / wallet / referrals / affiliate / admin rewards
CP-5 submissions ──► Slay Cam, reviews, affiliate media
CP-6 support ──► inbox, concierge replies
```

## What not to do

- Do **not** fix individual admin pages against localStorage. Every such fix is thrown away when CP-1 lands.
- Do **not** add new pages before CP-2. They would add more copy-pasted shells.
- Do **not** regenerate reward art for the Slay Challenge. Wire progress to the existing 3-phase PNGs.
- Do **not** add analytics pages before there is real data. Hide the fabricated metrics instead.
- Do **not** import Studio World's no-page-scroll rule into FRONTAL SLAYER layouts.
