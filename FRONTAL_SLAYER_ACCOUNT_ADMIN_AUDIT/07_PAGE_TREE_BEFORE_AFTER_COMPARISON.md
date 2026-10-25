# 07 — Page Tree: Before / After Comparison

Delta codes: `=` kept as is · `↑` kept, functionally completed · `~` kept, relabelled or re-parented · `+` new · `→` retired (redirect) · `⊂` folded into a tab of another page · `×` removed from the account/admin tree (left untouched elsewhere).

## Customer account

| AS-IS route | AS-IS status | TO-BE | Delta | Notes |
|---|---|---|---|---|
| `/account` | LOOKS-DONE | OVERVIEW dashboard + existing card grid | ↑ | doc 21 |
| `/account/orders` | LOOKS-DONE | MY ORDERS | ↑ | Server order source of truth (critical path CP-1) |
| — | MISSING | `/account/orders/:orderId` ORDER DETAIL | + | Deep link for emails, tracking, support, BAW spec |
| `/account/orders/:orderId/review` | PARTIAL | child of ORDER DETAIL | ↑~ | Eligibility enforced server-side |
| `/account/concierge` | PARTIAL | CONCIERGE (premium) | ↑ | Replies added; tracking → order detail (FD-A3) |
| `/account/rewards` | LOOKS-DONE | REWARDS & MEMBERSHIP (tabs MEMBERSHIP / POINTS / WALLET / SLAY CHALLENGE) | ↑~ | Ledger-backed (CP-3) |
| Concierge › Slay Challenge | SHELL | REWARDS › SLAY CHALLENGE tab | ~ | FD-A4 |
| Concierge › Slay Quests | PLACEHOLDER | hidden until real, or REWARDS › QUESTS | × / ↑ | FD-A5 |
| `/account/load-card` | BROKEN | REWARDS › WALLET › LOAD GIFT CARD | ↑~ | Server gift-card codes |
| `/account/collectibles` | PARTIAL | REWARDS › COLLECTIBLES | ~ | Writers for slay-challenge/reward sources |
| `/checkout/upgrade` | PARTIAL | unchanged route; Stripe-only in production | ↑ | FD-C5 |
| — | MISSING | `/account/hair` MY HAIR (PROFILE / ANALYSES / SAVED BUILDS) | + | FD-A2 |
| `/tools/hairstyle-analysis` | PARTIAL / unreachable | admin-only tool; customer entry through MY HAIR | ~ | FD-A6 |
| `/wishlist` (+ lists, shared) | OK* / PARTIAL / BROKEN | WISHLIST | ↑ | Server lists + share tokens |
| `/account/reviews` | PARTIAL | MY REVIEWS & CONTENT (REVIEWS / SUBMISSIONS) | ↑~ | Show pending/declined with reason |
| `/account/affiliate` | LOOKS-DONE | EARN & SHARE › AFFILIATE | ↑~ | Points ledger (CP-3) |
| `/account/referrals` | PARTIAL | EARN & SHARE › REFERRALS | ↑~ | Server referral validation |
| `/account/alerts` | PARTIAL | ALERTS | ↑ | Server read-state |
| `/account/settings` | OK* | SETTINGS (+ Privacy & data, MY REQUESTS) | ↑ | |
| `/account/shipping` | LOOKS-DONE | SETTINGS › ADDRESSES | ↑~ | Persist `saved_addresses` |
| `/account/payment` | PLACEHOLDER | SETTINGS › PAYMENT METHODS (Stripe) | ↑ (rebuild) | Remove raw PAN/CVV inputs (FD-C9) |
| `/account/consult-offer` | DEPRECATED | → `/account/orders` | → | Offer is already a modal |
| `/slay-cam` | LOOKS-DONE (fabricated) | public page; submissions in MY REVIEWS & CONTENT | × from account | FD-C11: remove fabricated stats |
| `/mobile/profile`, `/mobile/concierge`, `/mobile/rewards`, `/mobile/analysis` | PLACEHOLDER | outside the account tree | × | FD-A7 |
| `/desktop/account` | PARTIAL | desktop phase; reads the same server data | = | Out of the mobile-first scope |
| `/account/notifications`, `/orders` | REDIRECT | unchanged | = | |

**Net:** 18 core routes → 20 (2 new, 1 retired, 1 relabelled family). All URLs that work today keep working.

## Admin

| AS-IS route | AS-IS status | TO-BE | Delta |
|---|---|---|---|
| `/admin/dashboard` | LOOKS-DONE, fake data | COMMAND CENTER | ↑ (rebuild content, keep shell) |
| `/admin/headquarters` | Studio redirect | STUDIO ↗ menu entry | ~ |
| — | MISSING | `/admin/orders` | + |
| — | MISSING | `/admin/orders/:orderId` | + |
| `/admin/revenue` (ORDERS tab) | LOCAL-ONLY | moves to ORDERS | ⊂ |
| `/admin/revenue/fulfilled-orders` | SHELL | `/admin/orders?tab=DELIVERED` | → |
| `/admin/revenue` | LOOKS-DONE | FINANCE (OVERVIEW / PAYMENTS) | ↑~ |
| `/admin/revenue/accounting-report` | PARTIAL | FINANCE › ACCOUNTING | ↑ |
| `/admin/revenue/fraud-analysis` | PARTIAL | FINANCE › FRAUD | ↑ |
| `/admin/revenue/edit-inventory` | LOCAL-ONLY | `/admin/inventory` STOCK | → + |
| `/admin/revenue/view-waitlist` | PLACEHOLDER | `/admin/inventory` WAITLIST | → |
| `/admin/pending` | PARTIAL | APPROVALS | ↑~ |
| `/admin/reviews` | LOOKS-DONE | APPROVALS › PUBLISHED REVIEWS | ↑~ |
| `/admin/clients/overview` | LOOKS-DONE | CUSTOMERS | ↑ |
| — | MISSING | `/admin/clients/:userId` | + |
| `/admin/clients/account` | DEPRECATED | redirect to detail | = |
| `/admin/clients/deleted` | LOOKS-DONE | CUSTOMERS › DELETED | ↑ |
| `/admin/users` | UNREACHABLE | CUSTOMER DETAIL actions + SYSTEM › ADMIN USERS | → ⊂ |
| — | MISSING | `/admin/rewards` MEMBERSHIP & REWARDS | + |
| `/admin/referrals` | SHELL | MEMBERSHIP & REWARDS › REFERRALS | → ⊂ |
| `/admin/marketing` (AFFILIATE, CHALLENGES tabs) | PLACEHOLDER | moved to MEMBERSHIP & REWARDS | ⊂ |
| `/admin/meetings` | PARTIAL | MEETINGS | ↑ |
| `/admin/meetings/schedule` | UNREACHABLE | MEETINGS › NEW APPOINTMENT (linked) | ~ |
| `/admin/messages` | PARTIAL | INBOX (+ reply) | ↑~ |
| `/admin/brand` INQUIRIES tab | PARTIAL | INBOX › CONTACT | ⊂ |
| `/admin/alerts` | PLACEHOLDER | SYSTEM › ALERTS (real sources) + Command Center panel | → ⊂ |
| `/admin/marketing` | PARTIAL | MARKETING | ↑ |
| `/admin/marketing/offers` | UNREACHABLE | MARKETING › SPECIAL OFFERS | → |
| `/admin/notifications` | UNREACHABLE | MARKETING › CUSTOMER NOTIFICATIONS | → ⊂ |
| `/admin/brand` ALERTS tab | OK | MARKETING › CUSTOMER NOTIFICATIONS | ⊂ |
| `/admin/brand/edit/:copyKind` | PARTIAL | MARKETING › COPY EDITORS | ~ |
| `/admin/brand` CODES tab | LOCAL-ONLY | MEMBERSHIP & REWARDS › VOUCHERS & CODES | ⊂ |
| `/admin/brand` | PARTIAL | BRAND (OVERVIEW real or hidden, ANALYTICS) | ↑ |
| `/admin/analytics` | UNREACHABLE | BRAND › ANALYTICS | → |
| `/admin/workers` | SHELL | TEAM | ↑ |
| `/admin/backend` | OK* | SYSTEM | = |
| `/admin/audit` | UNREACHABLE | SYSTEM › AUDIT LOG | → |
| `/admin/trend-desk`, `/admin/slay-forecast-broadcast` | OK* (off-brand) | CONTENT STUDIO | ~ (re-skin) |
| `/admin/studio/health` | UNREACHABLE | Studio (out of scope) | × |

**Net:** 33 FS admin routes → **24 routed pages** (19 kept + 5 new), with 10 old URLs redirecting to tabs.

## Unused or duplicated routes

| Route | Problem | Recommendation |
|---|---|---|
| `/account/consult-offer` | No inbound links; superseded by a modal | Redirect |
| `/mobile/profile`, `/mobile/concierge`, `/mobile/rewards`, `/mobile/analysis` | Placeholder slot pages, unguarded, duplicate account concepts | Keep out of the account tree; founder decides the Mobile Mansion's future |
| `/admin/users` vs Backend › USERS | Duplicate | Fold |
| `/admin/audit` vs Backend › AUDIT LOG | Duplicate | Fold |
| `/admin/analytics` vs Brand › ANALYTICS | Duplicate | Fold |
| `/admin/notifications` vs Brand › ALERTS vs `/admin/alerts` (also titled "NOTIFICATIONS") vs header bell | 4 surfaces, 2 meanings | Split by meaning: *customer notifications* (Marketing) vs *system alerts* (System + Command Center) |
| `/admin/marketing/offers` vs Marketing › SPECIAL OFFERS | Duplicate | Fold |
| Clients BLOCK (fake) vs Users DISABLE (real) | Two "ban" concepts | Keep only the real disable |
| Concierge order tracking vs Orders tracking | Two tracking engines with different stage maths | One order detail |
| `src/pages/admin/clients/account/page.tsx` | Orphan file | Delete in implementation |

## Missing routes (customer task with no home)

- Customer: order detail · MY HAIR (analyses, saved builds, hair profile) · support request history (as a Settings section).
- Admin: orders list · order detail · customer detail · membership & rewards console · inventory.
