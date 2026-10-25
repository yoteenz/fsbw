# 04 — Admin Dashboard: AS-IS Page Tree

This is the Frontal Slayer operational admin as implemented. Studio OS and SITE00 (≈319 more `/admin/*` routes) are a separate platform. They appear here only where they intrude on the Frontal Slayer admin.

Legend is as in doc 03. Additional tags: `FAKE-DATA` (hard-coded or mock values shown as live), `LOCAL-ONLY` (persists to the admin's own browser only).

```
/admin  ............................................... REDIRECT → /admin/dashboard
│   Guard: AdminGuard (client allow-list) + server requireAdmin on every FS /api/admin/* call
│   Chrome on every page: AdminHeader = back · "ADMIN > TITLE" breadcrumb · search icon · 2 bells
│   ** There is NO admin menu / sidebar. The dashboard card grid is the only hub. **
│
/admin/dashboard  "ADMIN > DASHBOARD" ................. PAGE LOOKS-DONE · FAKE-DATA (link hub, not a command center)
├── [1] STUDIO COMMAND CENTER (founder/portfolio) ...... EXTERNAL → Studio OS (out of scope; first card)
├── [2] HEADQUARTERS (always) .......................... EXTERNAL → /admin/headquarters → Studio OS mission control
├── [3] REVENUE → /admin/revenue ....................... PAGE LOOKS-DONE
│   ├── OVERVIEW | ORDERS | PRODUCTS | PAYMENTS ........ TAB
│   │   OVERVIEW totals = server stub orders · Q1-Q3 $89K/$95K/$112K, margin 35%, ROI 18% = FAKE-DATA
│   ├── ORDERS row ..................................... INLINE (expand)
│   │   └── EDIT TRACKING (number, carrier, stage 0-8, notes, notify) .. INLINE LOCAL-ONLY (+ real email)
│   ├── VIEW ACCOUNTING REPORT → /admin/revenue/accounting-report .. CHILD PAGE PARTIAL (receipts in localStorage)
│   ├── VIEW FULFILLED ORDERS → /admin/revenue/fulfilled-orders .... CHILD PAGE SHELL (local orders, read-only)
│   ├── EDIT INVENTORY → /admin/revenue/edit-inventory ............. CHILD PAGE LOOKS-DONE · LOCAL-ONLY
│   ├── VIEW WAITLIST → /admin/revenue/view-waitlist ............... CHILD PAGE PLACEHOLDER (local + mock signups)
│   └── VIEW FRAUD ANALYSIS → /admin/revenue/fraud-analysis ........ CHILD PAGE PARTIAL (heuristic on local orders)
├── [4] CLIENTS → /admin/clients → /admin/clients/overview  ........ PAGE LOOKS-DONE
│   ├── ALL | REVIEWS | REWARDS | INVITES + 19 sort/filters ......... TAB
│   ├── client row → DETAILS (?email=) ................. INLINE (personal: details|cart|wishlist; activity|orders|appointments|messages)
│   │   ├── CANCEL ORDER ("…CANCELLED AND REFUNDED") ... MODAL LOCAL-ONLY · fake success (no refund)
│   │   └── BLOCK CLIENT ............................... MODAL LOCAL-ONLY · fake success (no ban)
│   ├── EXPORT CSV ..................................... OK (server)
│   ├── card actions PREFERENCES / SETTINGS ............ BROKEN (routes do not exist → "Page not found")
│   ├── VIEW DELETED ACCOUNTS → /admin/clients/deleted . CHILD PAGE LOOKS-DONE
│   │   └── RESTORE / UNBLOCK .......................... MODAL LOCAL-ONLY · fake success
│   └── (/admin/clients/account) ....................... REDIRECT (orphan 340-line file)
│   FOUNDER: 20 mock clients merged into the live list (FAKE-DATA)
├── [5] MEETINGS → /admin/meetings ..................... PAGE PARTIAL (API + always-merged mock meetings)
│   ├── calendar · bookings | consults · sort ......... INLINE
│   ├── SEND OFFER (consult quote builder) ............. MODAL OK (server, audited)
│   ├── EDIT → cancel / reschedule ..................... MODAL BROKEN (cancel sends status 'scheduled'; reschedule keeps date)
│   └── (/admin/meetings/schedule) ..................... CHILD PAGE UNREACHABLE (no link; API errors swallowed)
├── [6] PENDING → /admin/pending ....................... PAGE PARTIAL (the one real approval queue)
│   ├── OVERVIEW | REVIEWS | FORMS | AFFILIATE ......... TAB
│   └── item → review / approve / decline (+reason) .... MODAL OK server-side (audited) · silent on failure
│       + seeded test forms "Riley Chen / Morgan Blake" + local mock queues (FAKE-DATA)
├── [7] REVIEWS → /admin/reviews ....................... PAGE LOOKS-DONE (read-only; mock rows when API empty)
├── [8] REFERRALS → /admin/referrals ................... PAGE SHELL (reads never-written table; EXPORT is a no-op)
├── [9] MARKETING → /admin/marketing ................... PAGE PARTIAL
│   ├── AFFILIATE | CHALLENGES ......................... TAB PLACEHOLDER (paragraph text; 0/0 panels)
│   ├── SPECIAL OFFERS ................................. TAB OK* (server app_config; optimistic "saved")
│   ├── NEWSLETTER ..................................... TAB OK (server send, audited)
│   └── (/admin/marketing/offers) ...................... PAGE UNREACHABLE (duplicate of SPECIAL OFFERS tab)
├── [10] WORKERS → /admin/workers ...................... PAGE SHELL (hard-coded roster; applicants in localStorage)
├── [11] BRAND → /admin/brand .......................... PAGE PARTIAL
│   ├── OVERVIEW ....................................... TAB FAKE-DATA (server returns constant 94%/78%/+15%)
│   ├── ALERTS (send to client) ........................ TAB OK (server) — duplicates /admin/notifications
│   │   └── copy editors → /admin/brand/edit/:copyKind . CHILD PAGE PARTIAL (alerts/nudges LOCAL-ONLY; chat/psa OK)
│   ├── INQUIRIES ...................................... TAB PARTIAL (mark-read only; no reply)
│   ├── CODES (promo / gift codes) ..................... TAB LOCAL-ONLY (customers can never redeem them)
│   └── ANALYTICS (social clicks) ...................... TAB OK — duplicates /admin/analytics
└── [12] BACKEND → /admin/backend ...................... PAGE OK*
    ├── AUDIT LOG | USERS | CONTENT | LIVE TRY-ON ...... TAB OK (server)
    ├── TREND DESK → /admin/trend-desk ................. CHILD PAGE OK* (dark SaaS shell, off-brand)
    └── PSA BROADCAST → /admin/slay-forecast-broadcast . CHILD PAGE OK* (dark SaaS shell, off-brand)
├── RecentActivity widget .............................. SECTION FAKE-DATA (hard-coded 2025 events; buttons console.log)
└── ActivityFeed widget ................................ SECTION FAKE-DATA

AdminHeader bells (every page)
├── Messages bell → VIEW ALL → /admin/messages ......... PAGE PARTIAL (AdminHubPageShell)
│   └── INBOX | FAQ | CONTACT | REVIEWS ................ TAB (read-only; FAQ reads localStorage, not the server table)
└── Notifications bell → VIEW ALL → /admin/alerts  "NOTIFICATIONS"  PAGE PLACEHOLDER (hard-coded constant feed)

UNREACHABLE (route exists, nothing links to it)
/admin/users ........ real auth disable/enable/reset (duplicate of Backend → USERS), actions not audited
/admin/notifications  real send-to-client (duplicate of Brand → ALERTS)
/admin/audit ........ real audit log (duplicate of Backend → AUDIT LOG)
/admin/analytics .... social click analytics (duplicate of Brand → ANALYTICS)
/admin/meetings/schedule, /admin/marketing/offers, /admin/studio/health

STUDIO OS INTRUSION
/admin/headquarters  → immediately navigates into Studio OS (cards 1–2 occupy the top of the FS dashboard;
                       dashboard boots Studio OS modules on every load)
```

## What does not exist anywhere in the admin

- a server-backed **orders list** or **order detail** page
- order status changes (other than form approve/decline), refunds, returns
- a **customer detail route** (detail is an inline `?email=` toggle inside a 4,168-line page)
- membership administration (change plan, comp, cancel), points/voucher/digital-cash adjustment
- Slay Challenge administration
- hair-analysis usage, grants and failures
- a support **reply** capability
- server-backed inventory or waitlist
- a moderation queue for reported Lounge comments; any Slay Cam submissions queue
- an admin navigation menu

Full evidence: `appendix/C_admin.md`.
