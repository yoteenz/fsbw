# C — FRONTAL SLAYER Operational Admin: Forensic Audit (read-only)

Repo: /home/user/fsbw. Scope: FS operational admin under `/admin` (App.tsx 1303–3069). Studio OS / SITE00 are out of scope except for how they show up in FS admin. Nothing was built or run, and no network calls were made. All evidence comes from reading the code.

## 0. Global facts (read first)

- **Guarding.** `<Route path="/admin" element={<PlatformErrorBoundary><AdminGuard/></…>}>` (src/App.tsx:1302-1309). AdminGuard runs only in the browser: it checks `isSignedIn()` and `canAccessAdminPages()`, which compares the localStorage `currentUser.email` against an allow-list (src/components/AdminGuard.tsx:10-23; src/utils/adminAuth.ts:338-357, 583-589). Every page also calls `useRequireAdminPageAccess()`, which repeats the same check (src/hooks/useRequireAdminPageAccess.ts:11-25). The real protection is server-side: `requireAdmin` runs in every FS `api/admin/*.ts`. The 33 files without it are all Studio/SITE00 endpoints plus `sync-profile.ts` (`grep -L requireAdmin api/admin/*.ts`).
- **No admin nav menu exists.** `AdminHeader.tsx` (899 lines) holds a back arrow, a breadcrumb (`{breadcrumbParentLabel ?? 'ADMIN'} > {title}`, AdminHeader.tsx:584-615), a search icon, an account icon (dashboard only) and two dropdown bells: messages and notifications. It has no sidebar, tabs or hamburger. **The dashboard card grid is the only hub.**
- **Two-tier data model.** Pages call a real `/api/admin/*` endpoint when `isSupabaseConfigured() && isAdminEmail(currentUser.email)`. Otherwise they fall back to localStorage or mock data. Several pages merge mock data with real data even when the API succeeds (details below).
- **Orders, inventory, waitlist, promo codes, job applications, block/restore client, accounting receipts and alert/nudge copy overrides live only in the admin's own browser localStorage.** Admin edits to these never reach customers on other devices.
- **Founder account always gets mock data.** `isAyoteenzAdminAccount` means the email is exactly `kateenaarmstrong@gmail.com` (adminAuth.ts:372-378). For that account, 20 fake clients are merged into real client lists and dashboard counts (clients/page.tsx:909-986; dashboard/page.tsx:338-349). Deterministic mock meetings are merged in for **every** admin (AdminMeetingsHub.tsx:891-919; dashboard/page.tsx:742).
- **Route count.** 352 `path=` entries sit between App.tsx lines 1303 and 3070. 319 of them are studio/site00, plus whatever `Site00AdminRoutes()` adds. FS operational routes number about 33.
- **Tests.** There are zero unit or e2e tests for FS admin pages or utils (see §9).

---

## 1. Admin navigation as-is (tree with labels)

Entry points into `/admin`: there is no `/admin` link in the storefront/account UI. Users reach admin by typing the URL or by redirect (`/admin` → `/admin/dashboard`, App.tsx:1310).

```
/admin/dashboard  [AdminHeader "ADMIN > DASHBOARD", account icon → /account]
├─ Card grid (StatsCard; title click → handleCardClick, dashboard/page.tsx:1213-1245). Order at :1191-1204:
│  ├─ STUDIO COMMAND CENTER (conditional: canAccessStudioAdministration() or founder) → /admin/studio-os/command-center   [OUT OF SCOPE]
│  ├─ HEADQUARTERS (always)                                                       → /admin/headquarters → auto-redirects into Studio OS mission control [OUT OF SCOPE]
│  ├─ REVENUE   → /admin/revenue
│  │    ├─ tabs OVERVIEW | ORDERS | PRODUCTS | PAYMENTS (revenue/page.tsx:77)
│  │    ├─ OVERVIEW: "VIEW ACCOUNTING REPORT" → /admin/revenue/accounting-report  ("REVENUE > ACCOUNTING")
│  │    ├─ ORDERS:   "VIEW FULFILLED ORDERS"  → /admin/revenue/fulfilled-orders   ("REVENUE > FULFILLED ORDERS")
│  │    │            row tap → inline expanded order → "EDIT TRACKING" (inline edit form)
│  │    ├─ PRODUCTS: "EDIT INVENTORY" → /admin/revenue/edit-inventory ("REVENUE > EDIT INVENTORY")
│  │    │            "VIEW WAITLIST"  → /admin/revenue/view-waitlist  ("REVENUE > WAITLIST")
│  │    └─ PAYMENTS: "VIEW FRAUD ANALYSIS" → /admin/revenue/fraud-analysis ("REVENUE > FRAUD")
│  ├─ CLIENTS   → /admin/clients → /admin/clients/overview ("CLIENTS > OVERVIEW" / "CLIENTS > DETAILS")
│  │    ├─ card actions "PREFERENCES" → /admin/preferences (NO ROUTE → 404 page)   [StatsCard.tsx:194-203]
│  │    │               "SETTINGS"    → /admin/settings    (NO ROUTE → 404 page)
│  │    ├─ "VIEW DELETED ACCOUNTS" → /admin/clients/deleted ("ADMIN > DELETED")
│  │    ├─ "EXPORT CSV" (download)
│  │    └─ row → inline client DETAILS (?email=) → links to /admin/meetings?tab=…, /admin/pending, /admin/reviews
│  ├─ MEETINGS  → /admin/meetings ("ADMIN > MEETINGS")  (meetings/schedule is NOT linked anywhere)
│  ├─ PENDING   → /admin/pending ("ADMIN > PENDING"; tabs OVERVIEW | REVIEWS | FORMS | AFFILIATE) → client details, /admin/reviews
│  ├─ REVIEWS   → /admin/reviews ("ADMIN > REVIEWS"; tabs OVERVIEW | SHOP | TOOLS) → /admin/pending?tab=reviews
│  ├─ REFERRALS → /admin/referrals ("ADMIN > REFERRALS"; tabs OVERVIEW | BY REFERRER | ACTIVITY)
│  ├─ MARKETING → /admin/marketing ("ADMIN > MARKETING"; tabs AFFILIATE | CHALLENGES | SPECIAL OFFERS | NEWSLETTER)
│  │    (/admin/marketing/offers = same AdminSpecialOffer standalone, "ADMIN > OFFERS"; NOT linked anywhere)
│  ├─ WORKERS   → /admin/workers ("ADMIN > WORKERS", no back button)
│  ├─ BRAND     → /admin/brand ("ADMIN > BRAND"; tabs OVERVIEW | ALERTS | INQUIRIES | CODES | ANALYTICS)
│  │    └─ ALERTS tab buttons → /admin/brand/edit/{alerts|nudges|chat|psa-review} ("BRAND > …")
│  └─ BACKEND   → /admin/backend ("ADMIN > BACKEND"; tabs AUDIT LOG | USERS | CONTENT | LIVE TRY-ON)
│       ├─ "TREND DESK →"     → /admin/trend-desk ("ADMIN > TREND DESK")
│       └─ "PSA BROADCAST →"  → /admin/slay-forecast-broadcast ("ADMIN > SLAY FORECAST STUDIO")
├─ RecentActivity (hardcoded notifications; list/grouped toggle)
├─ ActivityFeed (hardcoded)
└─ AdminHeader bells (every page):
     messages dropdown → "VIEW ALL MESSAGES" → /admin/messages ("ADMIN > MESSAGES", tabs INBOX | FAQ | CONTACT | REVIEWS)
     notifications dropdown → "VIEW ALL NOTIFICATIONS" → /admin/alerts (title "NOTIFICATIONS", tabs ALERTS | ORDERS | SYSTEM)

UNREACHABLE from any UI (route exists, path string appears only in App.tsx and/or as the /api/admin/* endpoint in utils/api.ts):
  /admin/users, /admin/notifications, /admin/audit, /admin/analytics, /admin/meetings/schedule,
  /admin/marketing/offers, /admin/clients/account (redirect only), /admin/studio/health (linked only from
  studio-os-core/runtime-diagnostics/runtime-fail-safe.tsx:69, a Studio crash screen)
```

Grep evidence: a loop over every path string in `src/**/*.ts(x)` excluding App.tsx. `/admin/users|notifications|audit|analytics` match only `src/utils/api.ts` (the API URL, not a link). `/admin/meetings/schedule` matches only a codex-exec.log file.

---

## 2. Dashboard anatomy (src/pages/admin/dashboard/page.tsx, 1311 lines)

**Verdict: this is a card grid of links with decorative and partly fake stats. It is not a command center.** No card lists actionable items. Nothing on the dashboard can be acted on in place. The "pending" number is the only figure close to an action queue, and it is a sum that mixes sources. The two activity widgets below the grid are 100% hardcoded fiction.

Shell: marble background (`/assets/marble-half.png` fixed layer, :1266-1276), AdminHeader "DASHBOARD" with account icon, `max-w-md mx-auto`, `grid grid-cols-2 gap-4` of StatsCard (glass `bg-white/60 backdrop-blur-sm border border-black`, StatsCard.tsx:219-224). Loading state: "LOADING DASHBOARD DATA..." (:470-489). Error state: red box (:491-510).

Data loading (:313-447): if Supabase is configured and the user is an admin, it runs `Promise.all([getAdminDashboard() /api/admin/dashboard, getAdminClients() /api/admin/clients, getAdminPending() /api/admin/pending, getAdminReviews() /api/admin/reviews, getAdminReferrals() /api/admin/referrals, fetchAdminMeetingsApiNormalized() /api/admin/meetings])`. The founder gets 20 mock clients merged in (:338-349). On any throw it **silently** falls back to `buildMockDashboardData()` (:129-254), which builds everything from `getMockClientsForAyoteenz()`. Nothing tells the user the data is mock. `/api/admin/dashboard` always returns `bookings: []` and `notifications: []` (api/admin/dashboard.ts:98-100). Side effects on mount: Studio OS bootstrap (`registerStudioOsAuthBridge`, `ensureWorkspacesBootstrapped`, `ensureOrgMembershipResolved`, :298-310). The render also **writes** a default special-offer config to localStorage if one is missing (:1071-1088).

| # | Card | Destination | Header count | Items and their source | Real? |
|---|---|---|---|---|---|
| 1 | STUDIO COMMAND CENTER (conditional) | /admin/studio-os/command-center | `STUDIO_ADMIN_DASHBOARD_METRIC`=4 | static constants (workspaces/frontal-slayer/headquartersDashboard.ts:18-29) | Decorative; out of scope |
| 2 | HEADQUARTERS (always) | /admin/headquarters → Studio OS | 14 (constant) | static "MISSION CONTROL / PRODUCTION / PUBLISHING / EXECUTIVES / CAMPAIGNS / KNOWLEDGE" (headquartersDashboard.ts:3-15) | Decorative; out of scope; occupies the top-left slot |
| 3 | REVENUE | /admin/revenue | `stats.totalRevenue` (API orders) | INVENTORY from `getDepletedInventory(buildRevenueOrdersList())`, i.e. **admin-browser localStorage `userOrders_*`** (:569-575). ORDERS RECEIVED = unfulfilled count from the same local list. QUARTERLY SALES = revenue×0.65 (hardcoded 35% expense, :563-567). TAX DEDUCTIONS = completed×15% (hardcoded, :559-561). TOP PRODUCT from local orders. Q1–Q4 from API recent revenue (only the last N rows). Highlight "PERFORMANCE STRONG - ON TRACK TO EXCEED TARGETS" is hardcoded (:991) | Mixed; partly fabricated arithmetic |
| 4 | CLIENTS | /admin/clients | clients with a delivered order | NEW ACCOUNTS, EMAIL MARKETING, STANDARD/PREMIUM, REFERRALS, tiers BLACK/RED/SILVER computed from the client list (API + founder mock merge) (:961-978). Actions PREFERENCES/SETTINGS → nonexistent routes | Real-ish (polluted by mock); actions BROKEN |
| 5 | MEETINGS | /admin/meetings | completed meetings | upcoming today/week/month + "most traveled city", from **mock meetings + API + local** merge (:742-757) | Polluted by mock for every admin |
| 6 | PENDING | /admin/pending | revenue rows 'Pending' + pendingReviews + orderForms (:1001-1006) | `/api/admin/pending` pendingItems (REVIEWS, ORDER FORMS, CONTACT INQUIRIES…) + MESSAGES (unread priority from client records). Fallback hardcodes TIER UPGRADES '0', AFFILIATE '0' | Mostly real |
| 7 | REVIEWS | /admin/reviews | avg rating | TOTAL, PHOTOS/VIDEOS real; **REVIEWS PER MONTH '18' hardcoded** (:1040); activity "EXCELLENT CLIENT FEEDBACK…" in both branches of a ternary (:1052) | Partly fake |
| 8 | REFERRALS | /admin/referrals | sum invitesCount | INVITEES real-ish; "CODE STATUS Active/Inactive", "EARNINGS TRACKING Digital cash", "VIEW DETAILS Referrals" are static labels | Mostly decorative |
| 9 | MARKETING | /admin/marketing | '' | static labels (AFFILIATE "Campaign stats", CHALLENGES "Slay & more"…); activity line from localStorage `specialOfferAdminConfig` (:1109-1118) | Decorative |
| 10 | WORKERS | /admin/workers | roster length (hardcoded array) | summary of `ADMIN_DASHBOARD_WORKERS` constant | Static config |
| 11 | BRAND | /admin/brand | **'94%' hardcoded** (:1135) | CLIENT RETENTION 94%, REFERRAL RATE 23%, REPEAT BOOKINGS 78%, GROWTH RATE +15% — all hardcoded (:1137-1140); highlight "BRAND GROWTH STRONG" | **FAKE metrics** |
| 12 | BACKEND | /admin/backend | '' | static labels (AUDIT LOG, AUTH USERS, DISABLE/RESET) | Decorative |

Below the grid:
- **RecentActivity** (components/RecentActivity.tsx, 1096 lines). `listViewNotifications` (:20) and `groupedNotifications` (:327) are hardcoded arrays: "ORDER #17 NEEDS ORDER FORM", "LISA SCOTT", "DATA BREACH - SECURITY INCIDENT REPORTED", "TEMPERATURE ALERT - COLD STORAGE MALFUNCTION", 2025 dates. Action buttons ("CLICK HERE TO RESEND FORM", "REORDER INVENTORY") call `console.log` (:1080). Swipe-to-archive keeps state in memory only (:765-775).
- **ActivityFeed** (components/ActivityFeed.tsx). A hardcoded `useState([...])` list ("RUSH ORDER #17", "BULK ORDER PROCESSING #23"…). Only the show-all toggle works.

Missing for a command center: a delayed/aging-orders queue, an orders-awaiting-tracking queue, low-stock alerts from real inventory, failed payments or autopay failures (`/api/admin/booking-autopay-attempts` exists but is unused on the dashboard), unresolved contact inquiries as a list, and webhook/email failures.

---

## 3. Per-page dossiers

Format: route · page · breadcrumb · files · shell · structure · data · controls · state · maturity.

### 3.1 `/admin` (index)
Redirects to `/admin/dashboard` (App.tsx:1310). WORKING.

### 3.2 `/admin/dashboard`
See §2. **Maturity: VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE** (a link hub with fake or mixed metrics).

### 3.3 `/admin/brand` — AdminBrand
- Breadcrumb "ADMIN > BRAND" (or "ADMIN > CREATE CODE"). File src/pages/admin/brand/page.tsx (1010). Marble background, AdminHeader, glass card.
- Tabs OVERVIEW | ALERTS | INQUIRIES | CODES | ANALYTICS (:29), plus ANALYTICS sub-tabs SUMMARY | BY PLATFORM | BY SOURCE (:30).
- **OVERVIEW:** `getAdminBrand()` → /api/admin/brand (exists), which **itself returns hardcoded retention '94%', repeatBookings '78%', growthRate '+15%', brandScore 94, marketPenetration '15%'** (api/admin/brand.ts:26-31). Only referralRate is computed. The client default is the same hardcoded set (brand/page.tsx:44-51). **FAKE.**
- **ALERTS:** `BrandAlertsPanel` (793 lines). Sends a notification to a user via `getAdminClients` + `postAdminNotification` → /api/admin/notifications (WORKING). It **duplicates /admin/notifications**. Buttons go to the copy editors /admin/brand/edit/{alerts,nudges,chat,psa-review}.
- **INQUIRIES:** `BrandContactInquiriesPanel` (222). `getAdminBrandContactInquiries` → /api/admin/brand-contact-inquiries (table `brand_contact_inquiries`, written by api/brand/contact-submit.ts:58). Only action is mark read (PATCH). **No reply, assign or archive UI.** PARTIAL.
- **CODES:** create gift/discount promo codes. Persisted to **localStorage `adminBrandPromoCodes`** + `adminBrandGeneratedDiscountOrders` (utils/adminBrandCodes.ts:20-35, 111-141). Checkout (src/pages/checkout/page.tsx) reads the shopper's own localStorage, so **codes made by the admin never work for real customers on other devices**. Classed as BROKEN business record.
- **ANALYTICS:** `getAdminAnalytics()` → /api/admin/analytics (`site_analytics_events`), with fallback to local social click summary. Real data, but it covers social-link clicks only. Duplicates /admin/analytics.
- **Maturity: PARTIALLY_IMPLEMENTED.**

### 3.4 `/admin/brand/edit/:copyKind` — AdminBrandCopyEditor
- "BRAND > {title}". src/pages/admin/brand/copy-editor/page.tsx (81). Back goes to `/admin/brand?tab=ALERTS`. Kinds: alerts, nudges (BrandCopyEditorPanel), chat (PsaChatCopyEditorPanel), psa-review (AdminPsaReviewPanel).
- Alerts/nudges overrides save to **localStorage only** (utils/copyDebugResolve.ts:2,161-192,271-339). Customers never see them, so DISCONNECTED.
- Chat copy → `putAdminPsaChatConfig` → /api/admin/psa-chat-config (server, audited; utils/psaChatCopySync.ts:13-14). WORKING.
- psa-review → /api/admin/psa-review (read-only threads). WORKING.
- **Maturity: PARTIALLY_IMPLEMENTED.**

### 3.5 `/admin/clients` → `/admin/clients/overview` — AdminClients
- "CLIENTS > OVERVIEW" / "CLIENTS > DETAILS" (breadcrumb parent → /admin/dashboard). src/pages/admin/clients/page.tsx (**4168 lines**). Marble, AdminHeader with **external search wired** (header search filters the list).
- **Directory:** tabs ALL | REVIEWS | REWARDS | INVITES (:48); sort dropdown with 19 options doubling as filters (Most recent, Alerts, A-Z, spend, International, Socials, Photos, Videos, Tags, Reviews, Active/Inactive, Standard/Premium, Silver/Red/Black) (:50-70). Empty states: "NO CLIENTS MATCH YOUR SEARCH." / "…THIS FILTER." (:3604).
- **Data:** `getAdminClients` → /api/admin/clients (profiles), merged with localStorage `registeredUsers` and, for the founder, **20 mock clients** (`getMockClientsForAyoteenz`, :329-430; merge :909-986). Mock clients get mock orders (`getMockOrdersForClient`, :432).
- **Detail view:** inline on the same page, toggled by `?email=`, not a drawer. Personal tabs details | cart | wishlist (:547). Detail tabs activity | orders | appointments | messages (:546). Loads `getAdminOrders` /api/admin/orders?user_id, `getAdminCart`, `getAdminWishlist`, `getAdminActivity`, `getAdminReviews` (:1021-1049), with localStorage fallbacks (`userOrders_*`, `cartItems`, `wishlistItems`, affiliate keys, `referralEarnings`…). Appointments come from the aggregated mock+API meetings. Membership/rewards come from profile fields. Invites popup uses a `<table>` (:4008).
- **Controls:**
  - EXPORT CSV → /api/admin/export/clients (exists). WORKING. Errors are silently swallowed (:3784).
  - VIEW DELETED ACCOUNTS → nav. WORKING.
  - **BLOCK CLIENT** (ConfirmationModal "YOU WILL BAN THIS CLIENT AND ANY SIMILAR ACCOUNTS") → `blockClient()` writes localStorage `deletedUsers`/`blockedCredentials` in the admin browser (utils/blockedClients.ts:15,149-162). No server ban. **FAKE success**, DISCONNECTED. Contrast: real disable lives on the unreachable /admin/users.
  - **CANCEL ORDER** (modal "THIS ORDER WILL BE MARKED AS CANCELLED AND REFUNDED.") rewrites `localStorage userOrders_${email}` only (:3825-3852). No Stripe refund, no DB write, no customer notice. **FAKE success; BROKEN.**
  - No tier override, no delete account, no notes, no reply-to-message, no resend form.
- **Maturity: VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE.**

### 3.6 `/admin/clients/account`
`ClientsAccountRedirect` → /admin/clients/overview keeping `?email` (App.tsx:1004-1008). The file src/pages/admin/clients/account/page.tsx (340 lines) is **orphaned** (never imported). **DEPRECATED.**

### 3.7 `/admin/clients/deleted` — AdminDeletedAccounts
- "ADMIN > DELETED" (parent path /admin/clients, but parent label is left at its default). src/pages/admin/clients/deleted/page.tsx (366). Marble.
- Data: `getAdminDeletedAccounts` → /api/admin/deleted-accounts (`deleted_accounts`, written by api/delete-account.ts:68). Fallback is localStorage `deletedUsers`, **seeded with MOCK_DELETED_USERS** when empty (:42-160). Expand row shows JSON in `<pre>`.
- RESTORE ACCOUNT / UNBLOCK CLIENT (ConfirmationModal "THE USER WILL BE ABLE TO SIGN IN AGAIN") edits only localStorage `registeredUsers`/`deletedUsers` (:202-229). No server restore, so **FAKE success**.
- **Maturity: VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE.**

### 3.8 `/admin/meetings` — AdminMeetings (meetings/page.tsx is a 1-line re-export of AdminMeetingsHub.tsx, 3355 lines)
- "ADMIN > MEETINGS". Marble. Header search consumed. Has a calendar month anchor, booking vs consult lists, a sort dropdown, and view-all modes.
- Data: `useAdminMeetingsApiRefresh` → /api/admin/meetings (table `meetings`, full CRUD server-side). It is **always merged with `generateMockMeetingsForRange`** (deterministic fake meetings for every admin) + localStorage `adminMeetingsScheduled` + 3 founder demo consults (#331/#340/#341) (:891-929). Calendar day meta comes from `getAdminBookingsCalendarDayMeta`.
- **Controls:**
  - SEND OFFER / quote builder (createPortal modal) → `postAdminConsultQuote` /api/admin/consult-quotes (exists, audited). On failure it saves locally and shows "OFFER SAVED LOCALLY…" (:1403-1408). PARTIAL but honest.
  - EDIT / reschedule / cancel (:1416-1465). Only for UUID ids does it `patchAdminMeeting` with notes, and it **always sends `status: 'scheduled'`, even for action 'cancel'**. Reschedule never changes the date or time. Then it posts a client alert via /api/admin/meeting-client-alert. For mock (non-UUID) meetings with no email it shows "UPDATE RECORDED." with no write anywhere. **BROKEN / fake success.**
  - REGENERATE UNIT (ConfirmationModal :3308). UNVERIFIED.
  - `markConsultOrderCompleteAfterQuoteSent` changes the consult order in localStorage only (utils/consultOrderLifecycle.ts:116).
- **Maturity: PARTIALLY_IMPLEMENTED** (large and polished, but mock-polluted and the edit flow is broken).

### 3.9 `/admin/meetings/schedule` — AdminMeetingsSchedule
- "MEETINGS > APPOINTMENT|CONSULTATION". src/pages/admin/meetings/schedule/page.tsx (392). Marble.
- Save calls `appendLocalMeeting` first, then `postAdminMeeting`. **API errors are swallowed** with the comment "API optional" (:151-168), then it navigates away. Fake success when the API fails.
- **Not linked from anywhere: UNREACHABLE.**

### 3.10 `/admin/pending` — AdminPending
- "ADMIN > PENDING". src/pages/admin/pending/page.tsx (1871). Marble. Tabs OVERVIEW | REVIEWS | FORMS | AFFILIATE (:62). Review/form/affiliate detail **modal** (`adminReviewModal`, :98,412) plus a decline-reason prompt.
- Data: `getAdminPendingQueue` → /api/admin/pending-queue (tables `pending_order_forms`, `pending_affiliate_submissions`, `pending_review_supplemental`, `reviews` status pending) + `getAdminPending` + `getAdminReviews`. **Server items are always concatenated with local mock queues** (`pendingMockReviewsList`, `pendingMockAffiliateList`, :518-534). On mount it calls **`seedPendingTestOrderFormsIfNeeded()`**, which injects test forms for "Riley Chen"/"Morgan Blake" into localStorage for any admin (:779-781; utils/mockSignedOrderFormForApproval.ts:362-377). The review modal uses `picsum.photos` placeholder media (:83).
- **Controls:** APPROVE/DECLINE. Server rows → `patchAdminPendingQueue` PATCH (audited; approving an order form sets order status PLACED→CONFIRMED in `orders`, declining sets CANCELED: api/_lib/pendingQueueHandlers.ts:215-260). This is **the only admin action that changes a real order status.** Calls are `void …then(refresh)` with **no catch**, and the modal closes regardless, so failures are silent (:944-993). Mock rows → local approve/decline functions. Mixed WORKING/PARTIAL.
- **Maturity: PARTIALLY_IMPLEMENTED** (the real server queue is there, but mixed with seeded mock data).

### 3.11 `/admin/messages` — AdminMessagesPage
- "ADMIN > MESSAGES" via `AdminHubPageShell` (components/admin/AdminHubPageShell.tsx: marble + AdminHeader + summary panels + tabs). src/pages/admin/messages/page.tsx (221).
- Tabs INBOX | FAQ | CONTACT | REVIEWS (:25). Panels UNREAD PRIORITY / TOTAL UNREAD.
- Data (`loadAdminMessagesHubRows`, utils/adminMessagesHub.ts:215-249):
  - INBOX: /api/admin/priority-messages (server `priority_messages`) or a localStorage fallback.
  - **FAQ: localStorage only (`loadBrandFaqQuestionsLocal`, :137-138), even though api/brand/faq-question-submit.ts:52 writes the server table `brand_faq_questions`.** DISCONNECTED.
  - CONTACT: /api/admin/brand-contact-inquiries + local.
  - REVIEWS: mock pending reviews.
- Controls: open row → mark read (server PATCH for inbox/contact; local for FAQ) and navigate to client detail or /admin/pending?tab=REVIEWS. **No reply/respond capability anywhere** (the server PATCH only accepts new|read|archived, api/admin/priority-messages.ts:57-64).
- Reachable only through the header bell "VIEW ALL MESSAGES".
- **Maturity: PARTIALLY_IMPLEMENTED** (read-only inbox).

### 3.12 `/admin/alerts` — AdminAlerts
- Title **"NOTIFICATIONS"** (not "ALERTS") via AdminHubPageShell. src/pages/admin/alerts/page.tsx (197). Tabs ALERTS | ORDERS | SYSTEM (:26).
- Data: `loadAdminNotificationsHubRows()` = **hardcoded `ADMIN_HEADER_NOTIFICATIONS`** (utils/adminHeaderNotificationsData.ts:11-60: "LOW INVENTORY - RESTOCK (5) ITEMS", "SHIPPING DELAY - 12 ORDERS AFFECTED", "PAYMENT RECEIVED - $1,250", "EQUIPMENT FAILURE - PRINTER OFFLINE"…), with read-state kept in localStorage.
- Row tap → routes by category (pending FORMS, edit-inventory, meetings, clients).
- **Maturity: PLACEHOLDER** (all fake data). It duplicates the header dropdown.

### 3.13 `/admin/revenue` — AdminRevenue
- "ADMIN > REVENUE". src/pages/admin/revenue/page.tsx (1698). Marble. Two summary panels above tabs OVERVIEW | ORDERS | PRODUCTS | PAYMENTS. Header search consumed.
- **OVERVIEW:** `getAdminRevenue` → /api/admin/revenue (orders table) for totals and monthly breakdown. Lazy **AdminRevenueLiveGlobe** polls /api/admin/live-presence, with optional mock globe data gated by query/session (:50-57, 883-1002).
- **ORDERS:** `buildRevenueOrdersList()` = **iterate the admin browser's localStorage keys `userOrders_*`** (utils/adminRevenueStats.ts:1-4,130-149). If that throws, 4 hardcoded mock orders are used (:151-169). This is **not** the `orders` table. Rows expand inline; "EDIT TRACKING" opens an inline form (number, carrier, timeline shift, stage override 0-8, per-stage notes plus notify checkboxes, :353-440). Save (:689-764) → `patchOrderInUserOrders` (localStorage only, utils/orderTracking.ts:88-115) + `appendOrderTrackingClientNotification` (localStorage) + `notifyOrderLifecycleEmail` → /api/admin/transactional-notify (**real email**). A tracking number forces status 'SHIPPED' locally.
- **PRODUCTS:** inventory from `getDepletedInventory(orders)` + override.
- **PAYMENTS:** `getAdminMembershipPayments` → /api/admin/membership-payments (Stripe webhook rows) + local rows.
- **Maturity: VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE.** Order operations are local-only (see §5).

### 3.14 `/admin/revenue/accounting-report`
- "REVENUE > ACCOUNTING" (no parent path, so the breadcrumb goes to the dashboard). 412 lines. Marble. Quarter selector, receipt upload, spreadsheet toggle (AccountingSpreadsheetCard).
- Data: `getAdminRevenue` + local orders. **Receipts are stored as data-URLs in localStorage `admin_accounting_receipts`** (:13,79). Tax records stored client-only, with a quota risk. Spreadsheet uses `buildAdminAccountingSpreadsheet`.
- **Maturity: PARTIALLY_IMPLEMENTED.**

### 3.15 `/admin/revenue/fulfilled-orders`
- "REVENUE > FULFILLED ORDERS". 96 lines. Marble. Read-only list filtered from `buildRevenueOrdersList()` (localStorage) by status DELIVERED/SHIPPED/…; "BACK TO ORDERS". No `useRequireAdminPageAccess` (AdminGuard still covers it).
- **Maturity: SHELL_ONLY** (no actions; wrong data source).

### 3.16 `/admin/revenue/fraud-analysis`
- "REVENUE > FRAUD". 158 lines. Client-side heuristic scoring (velocity +25/+30, etc., :16-41) over localStorage orders. Filter buttons only, no actions.
- **Maturity: PARTIALLY_IMPLEMENTED** (a heuristic toy on the wrong data).

### 3.17 `/admin/revenue/edit-inventory`
- "REVENUE > EDIT INVENTORY". 91 lines. Number inputs per unit (NOIR, BLANCO, SOFT WAVE, BEACH WAVE, SOFT CURL, OCEAN CURL) + packaging. SAVE → `setInventoryOverride` → **localStorage `adminInventoryOverride`** (adminRevenueStats.ts:174-196). Shows "saved" for 2s (:20-24).
- The storefront sold-out check (`src/utils/productInventoryAvailability.ts:2` imports `buildRevenueOrdersList, getDepletedInventory`) runs on **the shopper's browser** against the shopper's own localStorage. **Admin inventory edits never affect customers.** There is no inventory API (api/inventory/ holds only back-in-stock-notify.ts).
- **Maturity: VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE** (fake save from a business perspective).

### 3.18 `/admin/revenue/view-waitlist`
- "REVENUE > WAITLIST". 379 lines. Product groups with notify-me signups. Source: localStorage `unitStockNotifyWaitlist_v1` (utils/unitStockNotify.ts:12,96) — the admin browser's own copy — **plus `enrichWaitlistGroupsWithMockSignups`, which spreads mock clients across products** (adminUnitStockNotifyWaitlist.ts:203-224; page text at :359 admits "MOCK CLIENT ROWS ARE INCLUDED FOR UI"). Server api/client/back-in-stock-notify.ts only sends a confirmation email and **persists nothing**.
- **Maturity: PLACEHOLDER** (no real waitlist storage exists).

### 3.19 `/admin/reviews` — AdminReviews
- "ADMIN > REVIEWS". 1048 lines. Marble. Tabs OVERVIEW | SHOP | TOOLS (:21). Sort dropdown, media expand, client detail link.
- Data: initial state `DEFAULT_REVIEWS` (mock emails mock1..5@test.com, :76-160) with placeholder media. Replaced by /api/admin/reviews **only if the API returns more than 0 reviews** (:538-548). With zero real reviews, **fake reviews are shown as real**. Mock client regions are merged in.
- Controls: only "GO TO PENDING" for moderation. No publish/reject on this page, even though the API supports PATCH/POST.
- **Maturity: VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE.**

### 3.20 `/admin/referrals` — AdminReferrals
- "ADMIN > REFERRALS". 266 lines. Tabs OVERVIEW | BY REFERRER | ACTIVITY (:10).
- Data: /api/admin/referrals → `referral_earnings`. **Nothing in api/ or src/ writes that table** (only the migration 002_admin_gaps.sql:75 creates it), so it is always empty and the page falls back to localStorage `referralEarnings` (:42-68).
- **EXPORT REFERRAL DATA has `onClick={() => {}}`** (:254), a DEAD button.
- **Maturity: SHELL_ONLY.**

### 3.21 `/admin/marketing` — AdminMarketing
- "ADMIN > MARKETING". 239 lines. Tabs AFFILIATE | CHALLENGES | SPECIAL OFFERS | NEWSLETTER (:10).
- **AFFILIATE and CHALLENGES are paragraph text only**, and the summary panels show hardcoded 0/0 (:38-41). PLACEHOLDER.
- SPECIAL OFFERS embeds AdminSpecialOffer (save, plus a RANDOMIZE debug button).
- NEWSLETTER → NewsletterPanel (441) → `sendAdminNewsletter` /api/admin/newsletter-send (exists, audited). WORKING (UNVERIFIED delivery).
- **Maturity: PARTIALLY_IMPLEMENTED.**

### 3.22 `/admin/marketing/offers` — AdminSpecialOffer (src/pages/admin/special-offer/page.tsx, 595)
- "ADMIN > OFFERS". Dropdowns for product, length, density, texture, lace, hairline, color, styling, add-ons, thumbnail, start date.
- SAVE writes localStorage `specialOfferAdminConfig` and shows "saved" **before** a fire-and-forget `putAdminSpecialOfferConfig` → /api/admin/special-offer-config (app_config, audited). Server errors only reach `console.error` (:120-135). PARTIAL; optimistic fake success.
- Route is **UNREACHABLE** (the same component is reachable via the marketing tab).
- **Maturity: FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT** (duplicate surface).

### 3.23 `/admin/workers` — AdminWorkers
- "ADMIN > WORKERS" (no showBack). 369 lines. Role cards from the **hardcoded `ADMIN_DASHBOARD_WORKERS` constant** (utils/adminWorkersDashboard.ts). Expanding a card shows applicants from **localStorage** (utils/jobApplicationsStorage.ts:3 "Stored in localStorage; replace with API/Supabase when ready"). Remove-applicant works locally only.
- Applicants submitted on /brand/careers from another device never appear.
- **Maturity: SHELL_ONLY.**

### 3.24 `/admin/backend` — AdminBackend
- "ADMIN > BACKEND". 389 lines. Tabs AUDIT LOG | USERS | CONTENT | LIVE TRY-ON (:16). Links TREND DESK →, PSA BROADCAST → (:175-190).
- AUDIT LOG → /api/admin/audit-log. USERS → /api/admin/users with disable/enable/reset. CONTENT → AdminLoungeTvContentPanel (putAdminLoungeTvConfig). LIVE TRY-ON → AdminLiveTryOnBatchPanel (batch endpoints).
- These **duplicate /admin/audit and /admin/users**, so those standalone pages are redundant.
- **Maturity: FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT.**

### 3.25 `/admin/studio/health` — AdminStudioHealth
- "Studio Health OK", a deployment id and a UA string (studio/health/page.tsx). Unstyled (system-ui), no AdminHeader. Linked only from a Studio crash fallback. Out of scope; **UNREACHABLE** from FS nav.

### 3.26 `/admin/headquarters` — AdminHeadquartersEntry
- Wrapped in AdminStudioWorkspaceGuard/StudioAdministrationGuard/StudioWorkspaceGuard (App.tsx:1428-1435). On mount it `navigate(missionControlPath, {replace:true})` into Studio OS (headquarters/page.tsx:25-31). It is reached from the HEADQUARTERS dashboard card. Out of scope; **this is the Studio clutter entry point.**

### 3.27 `/admin/users` — AdminUsers
- "ADMIN > USERS". 206 lines. Marble. Lists Supabase auth users via `getAdminUsers` (`auth.admin.listUsers`) with Prev/Next pagination.
- Actions: DISABLE (`window.confirm` → ban_duration 876000h), ENABLE, PASSWORD RESET (`generateLink` + `sendEmail` 'password_reset'), all in api/admin/users.ts:39-97. Real. **These actions are not written to audit_log** (users.ts has no writeAuditLog). If Supabase is not configured, it shows a silent empty list.
- **UNREACHABLE** (the same feature lives in the backend USERS tab).
- **Maturity: UNREACHABLE** (functionally complete).

### 3.28 `/admin/notifications` — AdminNotifications
- "ADMIN > NOTIFICATIONS". 177 lines. Client select + message → `postAdminNotification` → /api/admin/notifications (table `notifications`, audited). The customer reads it at /account/notifications via api/notifications.ts:23. Real.
- **UNREACHABLE**. Duplicates Brand → ALERTS. Name clashes with /admin/alerts, whose title is also "NOTIFICATIONS".
- **Maturity: UNREACHABLE.**

### 3.29 `/admin/audit` — AdminAudit
- "ADMIN > AUDIT LOG". 127 lines. Lists 100 rows from /api/admin/audit-log (`audit_log`). Loading/error states exist, with no pagination UI.
- **A real trail, but partial coverage.** Writers (`writeAuditLog`, api/_lib/auditLog.ts:35-45) exist only in config PUTs (special-offer, psa-chat, lounge-tv, email-layout, page-debug, perspective-panel), consult-quotes, meetings, meeting-client-alert, notifications, newsletter-send, pending-queue, reviews, social-*, vision-share, context-capsule, live-try-on-batch-step, studio-workspace-state, and api/profile.ts. **Not audited:** user disable/enable/reset (api/admin/users.ts), client export, and every localStorage-only admin action (block client, cancel order, tracking edit, inventory, promo codes, restore account).
- **UNREACHABLE** standalone (the backend AUDIT LOG tab duplicates it).
- **Maturity: UNREACHABLE** (the trail itself is PARTIALLY_IMPLEMENTED).

### 3.30 `/admin/analytics` — AdminAnalytics
- "ADMIN > ANALYTICS". 308 lines. Social-click analytics only (site_analytics_events, via /api/admin/analytics, with local fallback). Dead code block `void ([...])` (:86-131). Duplicates the Brand → ANALYTICS tab.
- **Maturity: UNREACHABLE.**

### 3.31 `/admin/trend-desk` — AdminTrendDesk
- "ADMIN > TREND DESK". **No marble**; different shell (max-w-6xl). /api/admin/trend-desk GET/POST (`trend_sources`, candidates, statuses). Includes a "seed_demo_workflow" button. Backend lib has tests (api/_lib/trendIntelligence/trendIntelligence.test.ts).
- Reachable only from the Backend page.
- **Maturity: FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT** (content tooling, not ops).

### 3.32 `/admin/slay-forecast-broadcast` — AdminSlayForecastBroadcast
- "ADMIN > SLAY FORECAST STUDIO". No marble; StudioButton UI. /api/admin/slay-forecast-broadcast actions: draft_script_from_brief, approve_script, preview_prompt, generate_full_broadcast (minimax, isTest), poll_jobs, approve_job, reject_job. Lib has tests.
- Reachable only from the Backend page ("PSA BROADCAST →").
- **Maturity: FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT** (content tooling).

### Maturity summary

| Route | Maturity |
|---|---|
| dashboard | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE |
| brand | PARTIALLY_IMPLEMENTED |
| brand/edit/:copyKind | PARTIALLY_IMPLEMENTED |
| clients/overview | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE |
| clients/account | DEPRECATED (redirect; orphan file) |
| clients/deleted | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE |
| meetings | PARTIALLY_IMPLEMENTED |
| meetings/schedule | UNREACHABLE |
| pending | PARTIALLY_IMPLEMENTED |
| messages | PARTIALLY_IMPLEMENTED |
| alerts | PLACEHOLDER |
| revenue | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE |
| revenue/accounting-report | PARTIALLY_IMPLEMENTED |
| revenue/fulfilled-orders | SHELL_ONLY |
| revenue/fraud-analysis | PARTIALLY_IMPLEMENTED |
| revenue/edit-inventory | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE |
| revenue/view-waitlist | PLACEHOLDER |
| reviews | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE |
| referrals | SHELL_ONLY |
| marketing | PARTIALLY_IMPLEMENTED |
| marketing/offers | UNREACHABLE (dup of marketing tab; functionally ok) |
| workers | SHELL_ONLY |
| backend | FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT |
| studio/health | UNREACHABLE (out of scope) |
| headquarters | out of scope redirect (Studio) |
| users | UNREACHABLE |
| notifications | UNREACHABLE |
| audit | UNREACHABLE |
| analytics | UNREACHABLE |
| trend-desk | FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT |
| slay-forecast-broadcast | FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT |

No page qualifies as COMPLETE_AND_VERIFIED, because no admin page has any test.

---

## 4. Dead / broken / fake controls

| Page | Control | Expected | Actual | Class | Evidence |
|---|---|---|---|---|---|
| dashboard | CLIENTS card "PREFERENCES" | open prefs | navigate('/admin/preferences'), which has no route, so "Page not found" | BROKEN | StatsCard.tsx:194-203; App.tsx:1026-1051,3607 |
| dashboard | CLIENTS card "SETTINGS" | open settings | /admin/settings, no route | BROKEN | StatsCard.tsx:200-201 |
| dashboard | BRAND card 94%/23%/78%/+15% | live KPIs | hardcoded | PLACEHOLDER (fake metric) | dashboard/page.tsx:1135-1143 |
| dashboard | REVIEWS "REVIEWS PER MONTH 18" | computed | hardcoded | PLACEHOLDER | dashboard/page.tsx:1040 |
| dashboard | REVENUE "TAX DEDUCTIONS", "QUARTERLY SALES" | accounting | revenue×15%, revenue×65% | PLACEHOLDER (fabricated) | dashboard/page.tsx:559-567 |
| dashboard | REVENUE highlight "ON TRACK TO EXCEED TARGETS" | status | static | PLACEHOLDER | :991 |
| dashboard | RecentActivity action buttons (RESEND FORM, REORDER INVENTORY…) | do action | console.log | DEAD | RecentActivity.tsx:1080 |
| dashboard | RecentActivity / ActivityFeed rows | live events | hardcoded 2025 fiction | PLACEHOLDER | RecentActivity.tsx:20,327; ActivityFeed.tsx:5 |
| dashboard | silent mock fallback | error banner | mock data shown as real | fake data | dashboard/page.tsx:417-446 |
| all pages | AdminHeader search icon | search | only clients/revenue/meetings consume `q` or external search; elsewhere it rewrites the URL and nothing filters | PLACEHOLDER | AdminHeader.tsx:256-269; grep of `get('q')` |
| all pages | Header notifications bell | real alerts | `ADMIN_HEADER_NOTIFICATIONS` constant | PLACEHOLDER | adminHeaderNotificationsData.ts:11 |
| all pages | Header messages bell (no data) | empty state | falls back to fake "SARAH JOHNSON … family emergency" | PLACEHOLDER | AdminHeader.tsx:43-57 |
| all pages | Long-press on bells | — | debug toggle that hides the active state, shipped to prod | UNVERIFIED/debug | AdminHeader.tsx:9-11,172-173,319 |
| clients | CANCEL ORDER | cancel + refund + notify | rewrites admin localStorage only; message claims "REFUNDED" | BROKEN (fake success) | clients/page.tsx:3825-3858 |
| clients | BLOCK CLIENT | ban account | localStorage `deletedUsers`/`blockedCredentials` only | DISCONNECTED (fake success) | clients/page.tsx:3801-3818; blockedClients.ts:149-162 |
| clients | EXPORT CSV | download | works; errors swallowed | WORKING/PARTIAL | clients/page.tsx:3773-3791 |
| clients/deleted | RESTORE ACCOUNT / UNBLOCK | user can sign in again | localStorage only | DISCONNECTED (fake success) | deleted/page.tsx:202-229,345-357 |
| clients/deleted | list when empty | empty state | seeds MOCK_DELETED_USERS into localStorage | fake data | deleted/page.tsx:42-160 |
| meetings | Edit → CANCEL | cancel meeting | PATCH with `status:'scheduled'` + note | BROKEN | AdminMeetingsHub.tsx:1423-1426 |
| meetings | Edit → RESCHEDULE | new date/time | only appends a note; date unchanged | BROKEN | same |
| meetings | Edit on mock meeting | — | "UPDATE RECORDED." with no write | fake success | AdminMeetingsHub.tsx:1429-1460 |
| meetings | mock meetings in list | real schedule | deterministic fake meetings for every admin | fake data | AdminMeetingsHub.tsx:891-895 |
| meetings/schedule | SAVE | create meeting | local append; API errors swallowed | PARTIAL + UNREACHABLE | schedule/page.tsx:151-170 |
| pending | APPROVE/DECLINE (server rows) | update + feedback | PATCH works; no catch, modal closes regardless | PARTIAL | pending/page.tsx:944-993 |
| pending | seeded test forms | — | Riley Chen / Morgan Blake test forms injected for any admin | fake data | pending/page.tsx:779-781 |
| messages | FAQ tab | server FAQ questions | reads localStorage only; server table ignored | DISCONNECTED | adminMessagesHub.ts:137-138 vs api/brand/faq-question-submit.ts:52 |
| messages | reply | respond to customer | not present | MISSING | api/admin/priority-messages.ts:57-64 |
| alerts | all rows | real alerts | hardcoded constant | PLACEHOLDER | alerts/page.tsx:86 |
| revenue | EDIT TRACKING → SAVE | persist tracking/status to order; customer sees it | admin localStorage only; real email sent | DISCONNECTED (partial: email only) | revenue/page.tsx:689-764; orderTracking.ts:88-115 |
| revenue | ORDERS list | all orders | admin browser `userOrders_*` keys | DISCONNECTED | adminRevenueStats.ts:130-149 |
| revenue/edit-inventory | SAVE | storefront stock | localStorage `adminInventoryOverride` | DISCONNECTED (fake success) | edit-inventory/page.tsx:20-24 |
| revenue/view-waitlist | list | real signups | admin localStorage + mock signups | PLACEHOLDER | adminUnitStockNotifyWaitlist.ts:203-224 |
| revenue/accounting-report | receipt upload | durable storage | data-URL in localStorage | client-only persistence | accounting-report/page.tsx:13,79 |
| reviews | list when API returns 0 | empty | DEFAULT_REVIEWS mock shown | fake data | reviews/page.tsx:76,524-548 |
| referrals | EXPORT REFERRAL DATA | export | `onClick={() => {}}` | DEAD | referrals/page.tsx:254 |
| referrals | data | earnings | `referral_earnings` never written; local fallback | DISCONNECTED | api grep |
| brand | OVERVIEW metrics | computed | server returns hardcoded 94/78/+15/15 | PLACEHOLDER | api/admin/brand.ts:26-31 |
| brand | CODES create | usable promo code | localStorage only | DISCONNECTED | adminBrandCodes.ts:20-35 |
| brand/edit alerts,nudges | save copy | customers see copy | localStorage overrides | DISCONNECTED | copyDebugResolve.ts:161-192 |
| marketing | AFFILIATE / CHALLENGES tabs | stats | paragraph text; panels 0/0 | PLACEHOLDER | marketing/page.tsx:38-41 |
| marketing/offers | SAVE | confirmed save | "saved" shown before server PUT; errors only in console | PARTIAL | special-offer/page.tsx:120-135 |
| workers | applicants | real applications | localStorage | DISCONNECTED | jobApplicationsStorage.ts:3 |
| users | DISABLE/ENABLE/RESET | audited | works; not audited | WORKING (UNREACHABLE) | api/admin/users.ts |

---

## 5. Order operations trace

**Admin orders list.** There is no list backed by the server. `/admin/revenue` ORDERS tab and `/fulfilled-orders` read `buildRevenueOrdersList()`, which **enumerates the admin's own browser localStorage keys `userOrders_*`** (adminRevenueStats.ts:130-149). Those keys hold the admin's own orders plus any `userOrders_${email}` the clients page happens to write while viewing a client (clients/page.tsx sets `userOrders_${email}`). A real server endpoint exists only per user: `GET /api/admin/orders?user_id=` (api/admin/orders.ts, GET only), used in client detail. `/api/admin/revenue` aggregates the `orders` table only into totals and a monthly breakdown.

**Order detail.** There are two inline expands: the Revenue ORDERS row and the Client DETAILS → orders tab. Neither is a dedicated route or drawer.

**Status / tracking update.** Revenue "EDIT TRACKING" holds tracking number, carrier, timeline shift, stage override 0–8, per-stage notes and notify flags. Saving writes **only localStorage** (`patchOrderInUserOrders`, orderTracking.ts:88-115, then dispatches a `storage` event in the same tab). It also appends a local account alert and sends a **real** email through `/api/admin/transactional-notify` (order_shipped / order_processing). There is **no server endpoint that patches an order**: `api/orders.ts` PUT returns 403 "Order writes are disabled for clients…" (api/orders.ts:20-25), and `api/admin/orders.ts` is GET-only.

**Where order status originates:**
1. Stripe `payment_intent.succeeded` → api/_lib/recordProductOrderFromPaymentIntent.ts:49-109 inserts or appends the order with `status: 'PAID'` into `orders.active_orders`.
2. Admin Pending → approving an order form sets PLACED→CONFIRMED; declining sets CANCELED (`api/_lib/pendingQueueHandlers.ts:215-260`, via PATCH /api/admin/pending-queue). **This is the only admin-originated server status change.**
3. Client side: `getOrderTrackingStageFromOrder` maps status to a stage (PLACED 0…SHIPPED 8) or uses `adminTrackingStageOverride` (orderTracking.ts:186-226). 'PAID' is not in the map, so it shows stage 0. The customer orders page has a 24h authorization countdown timer (`getAuthorizationRemainingTime`, src/pages/orders/page.tsx:579-583) and hardcoded demo orders built from `Date.now()` offsets (:435-801).
4. Consult offers: `markConsultOrderCompleteAfterQuoteSent` runs on localStorage only (consultOrderLifecycle.ts:116).

**Does an admin change reach /account/orders?** The customer page (`/account/orders` → src/pages/orders/page.tsx) reads its own localStorage `userOrders_*`, which is synced from `GET /api/orders` (the `orders` table). Admin tracking, status, cancel and stage edits never reach the `orders` table, so **they never reach the customer**, except on the same physical browser. The customer UI is ready to render `trackingStageNotes`, `trackingTimelineShiftDays` and `adminTrackingStageOverride` (orders/page.tsx:2823-2840), but nothing delivers them. The email path does reach the customer. Pending form approve/decline does reach them.

**Returns / cancellations / refunds.** Client DETAILS "CANCEL ORDER" only edits localStorage, while its message claims "CANCELLED AND REFUNDED". There is no Stripe refund call anywhere in api/admin. **No returns tool exists.** Fraud analysis is a client-side heuristic with no actions.

---

## 6. Duplicates, unreachable pages, out-of-scope clutter

**Duplicates:**
- **Notifications ×4:** `/admin/alerts` (titled "NOTIFICATIONS", hardcoded feed), the AdminHeader bell dropdown (same constant), `/admin/notifications` (real send-to-user, unreachable), and Brand → ALERTS tab (`BrandAlertsPanel`, also real send-to-user).
- **Messages/support ×3:** `/admin/messages` (INBOX/FAQ/CONTACT/REVIEWS), Brand → INQUIRIES (contact inquiries again), Client DETAILS → messages tab. The Messages REVIEWS tab duplicates Pending → REVIEWS.
- **Analytics ×2:** `/admin/analytics` (unreachable) = Brand → ANALYTICS. Neither is business analytics; both cover social clicks. Revenue analytics are in /admin/revenue.
- **Users vs clients vs backend:** `/admin/users` (auth users; unreachable) = Backend → USERS tab. `/admin/clients` covers profiles. Two "ban" concepts conflict: Clients BLOCK (fake, local) vs Users DISABLE (real auth ban).
- **Audit ×2:** `/admin/audit` (unreachable) = Backend → AUDIT LOG.
- **Special offer ×2:** `/admin/marketing/offers` = Marketing → SPECIAL OFFERS tab.
- **Workers vs users:** Workers is a static staff roster plus local job applications. It has no relation to auth users and no staff accounts or roles.
- **Reviews:** `/admin/reviews` (read-only) vs Pending → REVIEWS (moderation).

**Unreachable:** /admin/users, /admin/notifications, /admin/audit, /admin/analytics, /admin/meetings/schedule, /admin/marketing/offers, /admin/studio/health; /admin/clients/account is redirect-only. Dead file: src/pages/admin/clients/account/page.tsx.

**Out-of-scope clutter:**
- The dashboard shows **HEADQUARTERS always** and **STUDIO COMMAND CENTER** for founder/portfolio owners as the **first cards** (DASHBOARD_CARD_ORDER, dashboard/page.tsx:1191-1204). Both carry decorative constant metrics.
- The dashboard imports and boots Studio OS modules on every load (:30-45, 298-310).
- Backend links to Trend Desk and PSA Broadcast, which are content-production tools and not ops.
- The /admin route tree holds about 319 studio/site00 paths against about 33 FS paths. These share the AdminGuard/`/admin` namespace but do not appear in FS nav beyond the two cards.

---

## 7. Detail-page / drawer / modal patterns in use

- **Inline expand in the same card** (most common): client DETAILS via `?email=` on the clients page; Revenue order row expand with the tracking edit form; deleted-accounts row expand (JSON `<pre>`); Workers role card expand; Reviews media expand; RecentActivity card expand.
- **Sub-route pages:** Revenue → accounting-report, fulfilled-orders, fraud-analysis, edit-inventory and view-waitlist, each with its own AdminHeader breadcrumb "REVENUE > …" and a "BACK TO …" button. Brand → /brand/edit/:copyKind.
- **Modals:** shared `ConfirmationModal` (block client, cancel order, restore account, meetings send offer and regenerate unit). Pending has a custom review/form/affiliate modal plus a decline-reason prompt. Meetings has a quote/offer builder through `createPortal` (AdminMeetingsHub.tsx:1742). `ImageViewerModal` handles client media. Users page uses **native `window.confirm`**, which is inconsistent.
- **Dropdowns:** the sort dropdown pattern (`fixed inset-0` click-catcher + absolute list) appears on clients, reviews and meetings; also AdminHubSortDropdown on messages/alerts. Special-offer has 8 option dropdowns with `max-h-48 overflow-y-auto`.
- **Hub shell:** `AdminHubPageShell` (marble + header + 2 summary panels + tabs + scroll body) is used by messages and alerts. Pending, revenue, referrals, brand and others hand-roll the same layout.
- **No drawers.** There is no shared detail-page component.
- **Shell inconsistency:** most pages use marble + glass + AdminHeader + `max-w-md`. trend-desk and slay-forecast-broadcast use a different wide (max-w-6xl) style with no marble. studio/health is unstyled. Workers has no back button. The "ADMIN" parent label is wrong on deleted (parent path is /admin/clients but the label says ADMIN). Accounting-report and view-waitlist set the label "REVENUE" with no parent path, so the breadcrumb goes to the dashboard instead.

---

## 8. Mobile / table concerns (from code)

- The whole admin is a **phone-width column**: `max-w-md mx-auto` (448px) on every FS admin page (grep shows one per file). On desktop this wastes space and caps table density. The dashboard is `grid-cols-2` inside 448px, so each card is about 200px wide with item lists capped at 103px and scrolling inside (`DASHBOARD_CAPPED_STAT_ITEMS_MAX_PX`, dashboard/page.tsx:47).
- Nested scroll regions: StatsCard items scroll, the marketing tab body has `maxHeight: 380px` with overflow-y, the customer tracking list has maxHeight 200. Scroll-inside-scroll is likely on mobile.
- Clients invites popup `<table className="w-full">` (clients/page.tsx:4008) and the stats table use fixed 25% columns at 10px font. There is no horizontal scroll wrapper, so long emails get truncated or crushed.
- Revenue order action rows use `overflow-x-auto` (RecentActivity.tsx:1075), and brand tab strips use `overflow-x-auto` (brand/page.tsx:481,745). The 5 brand tabs and the 4 tabs on revenue/pending/marketing need horizontal scrolling at 448px.
- AdminHeader centers a `whitespace-nowrap` breadcrumb with 64px side padding and truncation (AdminHeader.tsx:572-616). Long titles ("SLAY FORECAST STUDIO", "FULFILLED ORDERS") truncate.
- JSON `<pre>` blocks in audit, backend and deleted rely on `overflow-x-auto` + `whitespace-pre-wrap`. Fine.
- Accounting receipts as data-URLs risk the localStorage quota (about 5MB) and would throw on save.

---

## 9. Test coverage

- **Unit tests:** none for FS admin pages or their utils. A grep over all `*.test.*` outside studio/site00/world for adminRevenueStats, adminAuth, pendingQueue, adminMessagesHub, adminNotificationsHub, orderTracking, AdminGuard, adminMeetings, blockedClients, adminBrandCodes or pages/admin finds nothing. The only related tests are server libs behind content tools: api/_lib/trendIntelligence/trendIntelligence.test.ts and api/_lib/slayForecastBroadcast/slayForecastBroadcast.test.ts, plus src/content/slay-forecast/broadcastTimeline.test.ts.
- **E2E:** e2e/ has guest.spec.ts, standard-user.spec.ts, premium-user.spec.ts and auth setups. **None of them contain "/admin"** (`grep -c "/admin" e2e/*.ts` → 0). There is no admin auth setup.
- **API handlers** (api/admin/*.ts): no tests.
