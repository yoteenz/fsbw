# 02 — Admin: Final Page Tree (for approval)

**Status: RECOMMENDED. Not approved.** Decisions C1–C5 (doc 16) gate this tree. It refines audit docs 06 and 07.

## Ground rules

- **Records, not decorations.** Every metric has a source and a definition (doc 13). Every queue item opens a real record. With 0 production orders today, the honest admin will look empty, and that is correct.
- **Roles are proposed, not invented as permanent fixtures** (decision C2):
  - **FOUNDER:** all actions, plus money actions above a threshold and role management.
  - **ADMIN:** all operational actions, including refunds up to a threshold.
  - **STAFF** (later, optional): fulfilment, approvals and inbox; no money, no roles, no configuration.

  Until `admin_roles` exists, every admin on the allow-list is treated as ADMIN and the founder email as FOUNDER. Server enforcement already exists (`requireAdmin`, `requireAdminFounder`).
- **Studio is a boundary.** One link to `/admin/headquarters` (Studio OS). Studio and SITE00 admin functionality is never surfaced inside Frontal Slayer families, and the Command Center does not boot Studio OS modules.
- **Detail standard** (from audit doc 19):
  - Routed detail pages for **orders and customers** only, because they get deep-linked from emails, queues and each other.
  - Everything else uses an **inspector drawer** (right side ≥1024px, bottom sheet on phones), a **modal** for confirmations, or an **inline expand** for read-only detail.

## The tree

```
ADMIN   [AdminHeader + NEW admin menu drawer on every page]
01 COMMAND CENTER ...... /admin/dashboard                         REPAIR (content rebuild, same shell)
02 ORDERS .............. /admin/orders                            NEW
   ├ tabs ALL · NEEDS FORM · IN PRODUCTION · READY TO SHIP · SHIPPED · DELIVERED · ISSUES · REFUNDS
   └ ORDER DETAIL ...... /admin/orders/:orderId                   NEW
       drawers: ADD TRACKING · CHANGE STATUS · REFUND/CANCEL (modal) · INTERNAL NOTE
03 APPROVALS ........... /admin/pending                           REPAIR (relabel)
   ├ tabs OVERVIEW · REVIEWS · ORDER FORMS · AFFILIATE · SLAY CAM (Sprint 5) · REPORTED COMMENTS (Sprint 5)
   └ PUBLISHED REVIEWS . /admin/reviews                           REPAIR
04 CUSTOMERS ........... /admin/clients/overview                  REPAIR
   ├ CUSTOMER DETAIL ... /admin/clients/:userId                   NEW (extract from the inline ?email= view)
   │   tabs PROFILE · ORDERS · MEMBERSHIP & REWARDS · APPOINTMENTS · MESSAGES · ACTIVITY
   │   actions: disable/enable · password reset · adjust points or wallet (founder/admin) · note
   └ DELETED ACCOUNTS .. /admin/clients/deleted                   REPAIR
05 MEMBERSHIP & REWARDS  /admin/rewards                           NEW
   tabs MEMBERS · POINTS LEDGER · WALLET & VOUCHERS · CODES · REFERRALS · SLAY CHALLENGE · ANALYSIS CREDITS
06 MEETINGS ............ /admin/meetings                          REPAIR
   ├ NEW APPOINTMENT ... /admin/meetings/schedule                 REPAIR (link it)
   └ modal SEND CONSULT OFFER                                     KEEP
07 INBOX ............... /admin/messages                          REPAIR (relabel)
   tabs PRIORITY · CONTACT · FAQ · ORDER ISSUES      drawer: THREAD (reply · assign · resolve)
08 CATALOG & INVENTORY . /admin/inventory                         NEW
   tabs STOCK · WAITLIST · BUILD-A-WIG OPTIONS & PRICING (Sprint 5)
09 MARKETING ........... /admin/marketing                         REPAIR
   tabs SPECIAL OFFERS · NEWSLETTER · CUSTOMER NOTIFICATIONS
   └ COPY EDITORS ...... /admin/brand/edit/:copyKind              REPAIR
10 FINANCE ............. /admin/revenue                           REPAIR (relabel)
   tabs OVERVIEW · PAYMENTS
   ├ ACCOUNTING ........ /admin/revenue/accounting-report          REPAIR
   └ FRAUD ............. /admin/revenue/fraud-analysis             REPAIR
11 BRAND ............... /admin/brand                             REPAIR
   tabs OVERVIEW (real metrics or hidden) · ANALYTICS
12 CONTENT STUDIO (group)
   ├ LOUNGE TV ......... /admin/backend?tab=CONTENT → becomes its own tab here
   ├ TREND DESK ........ /admin/trend-desk                        REPAIR (re-skin)
   └ PSA BROADCAST ..... /admin/slay-forecast-broadcast           REPAIR (re-skin)
13 TEAM ................ /admin/workers                           REPAIR
14 SYSTEM .............. /admin/backend                           KEEP (relabel)
   tabs AUDIT LOG · ADMIN USERS & ROLES · SYSTEM ALERTS · LIVE TRY-ON
15 STUDIO ↗ ............ /admin/headquarters                      KEEP (boundary link only)

REDIRECTED (old URL → tab; see 05 CSV)
/admin/users · /admin/audit · /admin/alerts → SYSTEM      /admin/analytics → BRAND
/admin/notifications · /admin/marketing/offers → MARKETING  /admin/referrals → REWARDS
/admin/revenue/edit-inventory · /view-waitlist → INVENTORY  /admin/revenue/fulfilled-orders → ORDERS
/admin/clients/account → CUSTOMER DETAIL                    /admin, /admin/clients → (existing redirects)
```

**Counts:** 24 routed pages (19 kept/repaired + 5 new) out of 33 discovered. 10 URLs consolidate into tabs. 0 functioning routes are deleted without a redirect.

## Family operating specifications

Column key: **Roles** = who may act. **Records** = canonical data. **Queue** = how work arrives. **Audit** = `audit_log` action names (proposed).

| # | Family | Operational responsibility | Roles | Canonical records | Queue behaviour | List / detail / inspector | Key actions (bulk) | Filters · search | Audit | Notifications · escalation | Reuse |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | Command Center | See and start today's work | all admins | aggregates only (doc 13) | Tiles = counts of live queues, oldest first | Tiles → filtered lists | none in place | period selector | — | System alerts escalate (red) when any failure count > 0 | `StatsCard` glass tiles, `AdminHeader` |
| 02 | Orders | Fulfil every order from paid → delivered; handle issues and refunds | Admin (status, tracking); Founder/Admin (refund ≤ threshold); Founder (> threshold) | `customer_orders`, `customer_order_items`, `order_status_events`, `order_refunds` | NEEDS FORM, READY TO SHIP, ISSUES sorted by age; SLA breach → DELAYED (decision C4) | List (table ≥1024px, row cards on phone) → routed detail; tracking and status as drawers | change status (bulk: mark shipped with CSV of tracking), add tracking, refund/cancel, resend email, note | status, type (physical/digital/booking), date, customer, has-form · search by order #, email, name | `order.status_change`, `order.tracking_add`, `order.refund`, `order.note` | Customer email + in-app alert on every status the customer sees; failed refund → System alert | Revenue ORDERS-tab row layout, `StatusTimeline` (extracted), `ConfirmationModal` |
| 03 | Approvals | Decide every submission needing a human | Admin, Staff | `pending_*`, `reviews`, `content_submissions` | FIFO per tab; count on Command Center | List → existing review modal (inspector) | approve, decline with reason (bulk approve for photo reviews) | type, date, customer | `pending_*.approve/decline` (exists) | Customer email and alert with reason; reward posts to ledger | Existing Pending modal + `AdminHubPageShell` |
| 04 | Customers | Find and serve any customer | Admin; Founder for points/wallet over threshold | `profiles`, auth users, ledgers, orders | — | Directory (existing 19 filters) → routed detail | disable/enable, password reset, adjust points/wallet (reason required), note, export CSV | tier, membership, spend, region · search name/email/phone | `customer.disable`, `customer.adjust_points`, `customer.export` | Adjustment notifies customer (alert) | Clients page directory + extracted detail tabs |
| 05 | Membership & Rewards | Administer memberships, ledgers, codes, referrals, Slay Challenge, analysis credits | Founder (rules, comps); Admin (view, adjust with reason) | `profiles` (Stripe mirror), `membership_payments`, `membership_events`, `loyalty_ledger`, `wallet_ledger`, `customer_vouchers`, `promo_codes`, `gift_card_codes`, `referral_earnings`, `slay_challenge_progress`, `hairstyle_analysis_usage` | Failed payments, expiring vouchers, unfulfilled rewards | Tabs → inspector drawer per member/entry | grant/reverse entry, issue code, void code, grant analysis credit (bulk issue codes) | period, type, member · search member/code | `ledger.*`, `code.*`, `membership.comp` | Grant/reversal → customer alert | `AdminHubPageShell` tabs, summary panels |
| 06 | Meetings | Schedule and run consults and installs; send consult offers | Admin, Staff | `meetings`, `consult_quotes`, `booking_autopay_attempts` | Today and 48h first; autopay failures flagged | Calendar + lists (existing) → inspector | schedule, reschedule (real date change), cancel (real status), send offer | type, date, status | `meetings.*` (exists, fix payload) | Client alert (exists); autopay failure → System alert | `AdminMeetingsHub` (remove mock merge) |
| 07 | Inbox | Answer every customer message | Admin, Staff | `support_requests` (+ `priority_messages`, `brand_contact_inquiries`, `brand_faq_questions` migrated or viewed) | New → open → waiting → resolved; oldest unresolved first | List → THREAD drawer | reply, assign, resolve, convert to order issue (bulk resolve/archive) | channel, status, assignee · search text/email | `support.reply`, `support.status` | Reply → customer email + Concierge/MY REQUESTS thread | `AdminHubPageShell`, `AdminHubTabBar` |
| 08 | Catalog & Inventory | Stock levels, waitlists, (later) Build-A-Wig options and prices | Admin; Founder for price changes | `inventory_items`, `inventory_movements`, `stock_waitlist`, (later) BAW catalogue | Low stock → Command Center; restock → waitlist notify | Table → inspector | adjust stock with reason, notify waitlist (bulk adjust) | SKU, low-stock | `inventory.adjust`, `waitlist.notify` | Back-in-stock email (exists, admin-only endpoint) | Edit-inventory inputs |
| 09 | Marketing | Offers, newsletter, customer notifications, copy | Admin | `app_config`, `notifications`/`customer_notifications`, newsletter send log | — | Tabs | save offer (server-confirmed), send newsletter, send notification | segment | `app_config.*`, `newsletter.send`, `notification.create` (exist) | — | Existing panels |
| 10 | Finance | Revenue and payments from server records | Founder, Admin (read) | `customer_orders`, `membership_payments`, `order_refunds`, Stripe | — | Tabs + child pages | export, attach receipt (server storage) | period | `finance.export` | — | Revenue page shell, minus fabricated cards |
| 11 | Brand | Brand health and social analytics | Admin (read) | `site_analytics_events`, real computed metrics only | — | Tabs | — | platform, period | — | — | Brand page |
| 12 | Content Studio | Editorial content | Admin | `app_config` (Lounge), `trend_*`, `slay_forecast_*` | Jobs awaiting approval | Existing tools | approve/reject jobs (exist) | — | exists | — | Re-skin onto marble/glass |
| 13 | Team | Staff roster and job applications | Founder | `job_applications` (new) | New applications | List → inspector | status, note | role | `team.*` | — | Workers cards |
| 14 | System | Audit, admin access, system health | Founder (roles); Admin (read) | `audit_log`, `admin_roles`, system alert sources | Failures → SYSTEM ALERTS | Tabs | grant/revoke admin (founder), disable user | action, actor, date | `role.*` | Critical alert to founder email (decision C2) | Backend tabs (exist) |
| 15 | Studio ↗ | Boundary only | Portfolio owners (existing guards) | Studio OS (out of scope) | — | — | — | — | — | — | — |

## Error handling standard (every admin mutation)

- Optimistic UI is not allowed for money or status actions. The button shows a pending state, and success is confirmed by the server response.
- Failures render the error-state canon inline, with RETRY. Silent `void promise` calls are prohibited (they exist today in Pending).
- Every mutation writes `audit_log` with before/after. A failed audit write fails the request for money actions (today audit errors are swallowed).

## Responsive authority (admin)

| Width | Behaviour |
|---|---|
| ≤767px | Current single glass column. Tables become row cards. Drawers become full-height sheets. The admin menu is a drawer. |
| 768–1023px | Column widens to 720px. Two-up tiles on the Command Center. |
| ≥1024px | Wide glass shell (max 1280px) on marble. List and inspector side by side. Sticky table headers with internal horizontal scroll for wide tables. |
| ≥1920px | Same 1280px shell, centred. Marble fills the sides. Never stretched. |
