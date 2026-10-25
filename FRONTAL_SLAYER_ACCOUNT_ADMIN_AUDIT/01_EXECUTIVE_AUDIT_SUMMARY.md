# 01 — Executive Audit Summary

**Sprint:** `P0.FRONTAL-SLAYER.OPUS.ACCOUNT-PROFILES-AND-ADMIN-DASHBOARD.PAGE-TREE-UX-AND-COMPLETION-AUDIT.V1`
**Repository:** `yoteenz/fsbw` (FRONTAL SLAYER; SITE00 is a separate product). **Audit base:** `c95c32f0` · 2026-10-25
**Mode:** read-only forensic audit. No product code changed, no deployment, no database mutation, no merge.

## The one-paragraph answer

The account and admin areas **look finished and on-brand**. The marble, translucent glass, red and gray palette, and Futura and Covered By Your Grace typography are intact on almost every page, and they should stay. **Underneath, most of what customers and admins do is saved only in the browser they are using.** Orders, loyalty points, vouchers, digital cash, referral credits, promo codes, inventory, tracking numbers and admin cancellations never reach the server. The server's copy of an order is a placeholder, and admin screens fill the gaps with mock or hardcoded data. **No page is complete and verified.**

The way forward is not a redesign. It is **five shared repairs** (security and money hotfixes, a server order of record, shared shells, a rewards ledger, and mock-data quarantine) that unlock most pages at once, followed by the page-family roadmap.

## What I found

| | Customer account | Admin (Frontal Slayer operations) |
|---|---|---|
| Pages discovered | 28 (22 core + 6 parallel/adjacent) | 33 (plus ≈319 Studio OS / SITE00 routes, out of scope) |
| Complete and verified | **0** | **0** |
| Works, visually inconsistent | 3 | 3 |
| Looks done, doesn't work | 6 | 6 |
| Partially implemented | 11 | 8 |
| Shell / placeholder | 5 | 5 |
| Broken | 2 | 0 (but 48 broken or fake controls) |
| Unreachable / deprecated / redirect | 1 | 11 |
| Missing (needed) | 3 | 5 |
| Recommended page count | **20** (2 new, 1 retired) | **24** (5 new, 10 folded into tabs) |

## The nine critical blockers

1. **No server order of record.** Orders, BAW specs, status and tracking live in one browser. Admin tracking and refunds never reach the customer.
2. **Custom Build-A-Wig orders are charged base price through Stripe.** Colour, length, lace, styling and add-ons are dropped.
3. **Credit and usage database functions are callable with the public anon key** (live-confirmed). Anyone could grant hair-analysis credits.
4. **Value without payment.** Slay Tickets can be minted. A non-Stripe "confirm order" gives free premium on the device. Booking autopay charges Stripe IDs supplied by the client.
5. **Legacy database policies let customers write their own orders, meetings and notifications** (live-confirmed).
6. **"Cancel subscription" doesn't cancel in Stripe.** The $60 4-comparison analysis purchase grants nothing (live-confirmed).
7. **No rewards ledger.** Points, vouchers, digital cash, referrals and affiliate points are all client-side, and REDEEM does nothing.
8. **Fabricated data shown as live.** Admin metrics, activity feeds, mock clients and meetings. **The Concierge page injects test orders into real customers' order history**, which made a new customer show 3,960 points in the local test. Slay Cam shows invented testimonials and stats.
9. **Paid deliverables with no fulfilment.** The consult style-analysis add-on, and PSA "best looks" ("results within 24 hours" never arrive).

## What already works and should be kept

- Stripe subscriptions: subscribe, upgrade, downgrade and renewal, with webhook writes to `profiles` and `membership_payments`.
- Server-side admin authorization on every Frontal Slayer admin API (JWT plus allow-list). Customers cannot escalate role or tier.
- The approval queue (`/admin/pending`) for reviews, order forms and affiliate content: server-backed, audit-logged, with emails.
- Settings: profile, password and delete account. Wishlist sync. Consult offers end-to-end. Education collectibles. The Slay Ticket ledger table. Hair-analysis monthly entitlement enforcement.
- The visual shell: marble, glass, breadcrumbs, `AdminHubPageShell`, `PageActionsBelowCard`, alert-row typography.

## Proposed structure (founder approval needed)

- **Customer:**
  - Main areas: OVERVIEW · ORDERS (+ new order detail) · CONCIERGE · REWARDS (membership / points / wallet / Slay Challenge tabs) · **MY HAIR (new: hair profile, analyses, saved builds)** · WISHLIST · REVIEWS & CONTENT · EARN & SHARE (affiliate, referrals) · ALERTS · SETTINGS (addresses, payment methods, my requests).
  - Every working URL is kept.
- **Admin:**
  - Groups: COMMAND CENTER (queues first) · **ORDERS (new)** · APPROVALS · CUSTOMERS (+ routed detail) · **MEMBERSHIP & REWARDS (new)** · MEETINGS · INBOX (with reply) · **CATALOG & INVENTORY (new)** · MARKETING · FINANCE · BRAND · CONTENT STUDIO · TEAM · SYSTEM.
  - Studio OS becomes a single link.

## Most efficient completion sequence

**0A** approve trees → **0B** security and money hotfixes → **1** server order of record + shared account context → **2** customer core ∥ **3** admin core → **4** membership and rewards → **5** Hair Analysis / BAW / community → **6** affiliate, marketing, support → **7** responsive QA and E2E.

Production has **0 server orders and 9 profiles today**. Fixing the order foundation now, before launch volume, is the cheapest it will ever be.

## Founder decisions needed first

FD-C1 (approve hotfix sprint + migration) · FD-C2 (orders schema) · FD-C3 (BAW checkout interim) · FD-C5/C6 (membership confirm/cancel) · FD-C7 (mock data quarantine) · FD-A1 / FD-B1 (page trees). Full board: doc 24.
