# 06 — Admin Dashboard: PROPOSED (TO-BE) Page Tree

**Status: a proposal. The founder must approve it (FD-B1 in doc 24).** Nothing here has been implemented.

## Design rules applied

1. **Operational efficiency over an extensive tree.** The 14-section hypothesis in the brief is reduced to **10 groups**. Families that share data share a page with tabs.
2. **Every existing working admin action stays reachable.** Unreachable-but-real pages (`users`, `audit`, `notifications`, `analytics`) are folded into the tabs that already duplicate them. Their old URLs redirect.
3. **Queues first.** The dashboard becomes a Command Center built on action queues (doc 20).
4. **Routed detail for the two entities admins deep-link and share: orders and customers.** Everything else uses inline expansion, modals or drawers (doc 19 standard).
5. **Studio OS leaves the Frontal Slayer operational surface.** It keeps one entry ("STUDIO") in the admin menu and on the Command Center. It is no longer the first two cards.
6. **Same brand shell.** Marble, glass panels, `AdminHeader` and `ADMIN > X` breadcrumbs stay. Trend Desk and PSA Broadcast are brought onto the shell (doc 18). The admin may be denser and wider than the 448px customer column on desktop (doc 19).

## How the provisional hypothesis was evaluated

| Hypothesis section | Decision |
|---|---|
| COMMAND CENTER | **KEEP** (rebuild `/admin/dashboard`) |
| ORDERS | **NEW family** (promote out of Revenue; server-backed). Fulfilment, shipping and returns are **filters and tabs**, not pages. |
| PRODUCTS | **SLIM**: "CATALOG & INVENTORY". Stock + waitlist now; BAW options and pricing later (Phase 5). The product media and catalogue CMS is out of scope (no admin product editor exists or is needed yet; the catalogue is code). |
| CUSTOMERS | **KEEP** `/admin/clients`, add a routed customer detail, absorb `/admin/users` actions |
| MEMBERSHIPS + REWARDS & LOYALTY | **MERGE** into one "MEMBERSHIP & REWARDS" console with tabs. They share one ledger family. |
| HAIR ANALYSIS | **TAB** of Membership & Rewards (credits/usage). The recommendation logic is out of scope. |
| BUILD-A-WIG | **TAB** of Catalog & Inventory (options and pricing) in Phase 5. Custom-build review = order detail. |
| CONTENT & COMMUNITY | **MERGE** into **APPROVALS** (moderation queues) + **CONTENT STUDIO** (Lounge TV, Trend Desk, PSA Broadcast). |
| AFFILIATES | **TAB** of Approvals (submissions) + Membership & Rewards (points/limits). No separate page. |
| MARKETING | **KEEP** (special offers, newsletter, customer notifications, promo codes) |
| SUPPORT | **KEEP** `/admin/messages` as **INBOX** (add reply and status; absorb Brand → INQUIRIES) |
| ANALYTICS | **TAB** of Finance (sales) and Brand (social). No standalone analytics page until real metrics exist. |
| SYSTEM | **KEEP** `/admin/backend` (Audit log · Admin users & roles · Health · Live try-on) |

## Proposed tree

```
ADMIN
│  Admin menu (NEW: hamburger drawer in AdminHeader using the existing menu-toggle-card pattern)
│  Order: COMMAND CENTER · ORDERS · APPROVALS · CUSTOMERS · MEMBERSHIP & REWARDS · MEETINGS ·
│         INBOX · CATALOG & INVENTORY · MARKETING · FINANCE · BRAND · CONTENT STUDIO · TEAM · SYSTEM · (STUDIO ↗)
│
├── COMMAND CENTER  /admin/dashboard  "ADMIN > COMMAND CENTER"        [REBUILD — Type B/C]
│   Action queues · Business metrics · System alerts · Recent activity (doc 20)
│
├── ORDERS  /admin/orders  "ADMIN > ORDERS"                           [NEW — Type C]
│   ├── ALL | NEEDS FORM | IN PRODUCTION | READY TO SHIP | SHIPPED | DELIVERED | ISSUES ... TAB/FILTER
│   ├── ORDER DETAIL  /admin/orders/:orderId  "ORDERS > #NNN"          [NEW — Type C]
│   │   status + history · items with BAW config · customer link · signed form ·
│   │   tracking entry (DRAWER) · refund/cancel (MODAL, Stripe) · internal notes · emails sent
│   └── (/admin/revenue/fulfilled-orders → /admin/orders?tab=DELIVERED)  REDIRECT
│
├── APPROVALS  /admin/pending  "ADMIN > APPROVALS"                    [KEEP, relabel — Type B]
│   ├── OVERVIEW | REVIEWS | ORDER FORMS | AFFILIATE | SLAY CAM (Phase 5) ... TAB
│   ├── item → review / approve / decline + reason ......................... MODAL (existing)
│   └── PUBLISHED REVIEWS  /admin/reviews ................................. CHILD PAGE [KEEP — add unpublish/verify UI]
│
├── CUSTOMERS  /admin/clients/overview  "ADMIN > CUSTOMERS"           [KEEP — Type B]
│   ├── directory: search · 19 filters · EXPORT CSV ........................ (existing)
│   ├── CUSTOMER DETAIL  /admin/clients/:userId  "CUSTOMERS > NAME"      [NEW ROUTE — Type C; ?email= redirects]
│   │   PROFILE | ORDERS | MEMBERSHIP & REWARDS | ACTIVITY | MESSAGES | APPOINTMENTS ... TAB
│   │   actions: disable / enable / password reset (from /admin/users) · adjust points (MODAL) · add note
│   ├── DELETED ACCOUNTS  /admin/clients/deleted ............................ CHILD PAGE [KEEP — make restore real or remove]
│   └── (/admin/users → /admin/clients/overview; /admin/clients/account → detail)  REDIRECT
│
├── MEMBERSHIP & REWARDS  /admin/rewards  "ADMIN > REWARDS"           [NEW — Type C, founder approval]
│   ├── MEMBERS (plans, renewals, failures from membership_payments / _failures) .... TAB
│   ├── POINTS LEDGER (search, adjust w/ reason) ............................ TAB
│   ├── VOUCHERS & CODES (moves Brand → CODES; server codes) ................ TAB
│   ├── REFERRALS (absorbs /admin/referrals) ................................ TAB
│   ├── SLAY CHALLENGE (cycle config, participant progress, fulfilment) ..... TAB
│   └── HAIR ANALYSIS CREDITS (usage, grants, failed grants, manual grant) .. TAB
│   (/admin/referrals → /admin/rewards?tab=REFERRALS)  REDIRECT
│
├── MEETINGS  /admin/meetings                                         [KEEP — Type B: remove mock merge, fix edit]
│   ├── SEND OFFER ......................................................... MODAL (existing)
│   └── NEW APPOINTMENT  /admin/meetings/schedule .......................... CHILD PAGE [KEEP — link it]
│
├── INBOX  /admin/messages  "ADMIN > INBOX"                           [KEEP — Type B]
│   ├── PRIORITY | CONTACT | FAQ ........................................... TAB (absorbs Brand → INQUIRIES)
│   └── thread → REPLY / ASSIGN / RESOLVE .................................. DRAWER [NEW capability]
│
├── CATALOG & INVENTORY  /admin/inventory  "ADMIN > INVENTORY"        [NEW route — Type B/C]
│   ├── STOCK (server inventory; low-stock) | WAITLIST (server) | BUILD-A-WIG OPTIONS & PRICING (Phase 5) ... TAB
│   └── (/admin/revenue/edit-inventory, /view-waitlist → here)  REDIRECT
│
├── MARKETING  /admin/marketing                                       [KEEP — Type B]
│   ├── SPECIAL OFFERS | NEWSLETTER | CUSTOMER NOTIFICATIONS (absorbs /admin/notifications + Brand → ALERTS) ... TAB
│   ├── COPY EDITORS  /admin/brand/edit/:copyKind ........................... CHILD PAGE [KEEP — server-persist alerts/nudges]
│   └── (/admin/marketing/offers → ?tab=SPECIAL OFFERS; /admin/notifications → ?tab=CUSTOMER NOTIFICATIONS)  REDIRECT
│       (AFFILIATE and CHALLENGES placeholder tabs removed → MEMBERSHIP & REWARDS)
│
├── FINANCE  /admin/revenue  "ADMIN > FINANCE"                        [KEEP, relabel — Type B]
│   ├── OVERVIEW (server aggregates only) | PAYMENTS (membership + product) ... TAB
│   ├── ACCOUNTING  /admin/revenue/accounting-report ........................ CHILD PAGE [KEEP — server receipts]
│   └── FRAUD  /admin/revenue/fraud-analysis ................................ CHILD PAGE [KEEP — on server orders]
│
├── BRAND  /admin/brand                                               [KEEP — Type A/B]
│   └── OVERVIEW (real metrics or hidden) | ANALYTICS (absorbs /admin/analytics) ... TAB
│
├── CONTENT STUDIO  (nav group)                                        [KEEP pages; re-skin two]
│   ├── LOUNGE TV  /admin/backend?tab=CONTENT → move to its own tab here
│   ├── TREND DESK  /admin/trend-desk ...................................... PAGE (bring onto marble/glass shell)
│   └── PSA BROADCAST  /admin/slay-forecast-broadcast ...................... PAGE (bring onto marble/glass shell)
│
├── TEAM  /admin/workers                                              [KEEP — Type B: server applications]
│
└── SYSTEM  /admin/backend  "ADMIN > SYSTEM"                          [KEEP — Type A]
    ├── AUDIT LOG (absorbs /admin/audit) | ADMIN USERS & ROLES | ALERTS (real system alerts; absorbs /admin/alerts) | LIVE TRY-ON ... TAB
    └── (/admin/audit, /admin/alerts → here)  REDIRECT

STUDIO ↗  /admin/headquarters, /admin/studio-os/*  (out of Frontal Slayer ops; single menu entry)
```

## Page count

| | AS-IS | TO-BE |
|---|---|---|
| Frontal Slayer admin routes | 33 (7 unreachable, 1 deprecated, 2 index redirects, 1 Studio redirect) | **24 routed pages** (19 kept + 5 new) plus redirects for 9 retired URLs |
| New pages | — | `/admin/orders`, `/admin/orders/:orderId`, `/admin/clients/:userId`, `/admin/rewards`, `/admin/inventory` |
| Folded into tabs (URL → redirect) | — | users, audit, analytics, notifications, marketing/offers, alerts, referrals, edit-inventory, view-waitlist, fulfilled-orders |

## Mobile behaviour for admin

The admin is currently a 448px column on every device. Proposal (FD-B4):

- **Phone (≤767px):** keep the single column and the current card density. Tables become stacked "row cards" (as the clients list already does). Drawers become full-height sheets.
- **Tablet / desktop:** let the admin shell widen (e.g. `max-w-6xl`) on the same marble + glass treatment. The Command Center becomes a 2–3-column queue grid, and lists show as tables with internal horizontal scroll for wide columns.
- The admin menu is a drawer at every width. There is no permanent sidebar until the founder approves one, because a sidebar would be a visible layout change.
