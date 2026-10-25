# 04 — Administration Experience Inventory

Administration is a **separate operational interface**. Customer mobile and desktop/tablet design rules do not apply to it. Source: `evidence/E_experience_authority.md` §4; prior package doc 02 (admin tree, still valid).

| Field | Administration |
|---|---|
| **Entry routes** | `/admin` → `/admin/dashboard` (`App.tsx:1311`); `AdminGuard`: signed-out → `/sign-in?returnTo`, non-admin → `/account` (which then bounces ≥768px to `/desktop/account`) |
| **Canonical route ownership** | FS operations: dashboard, brand, clients (overview, deleted, account → redirect), meetings (+ schedule), pending, messages, alerts, revenue (accounting-report, fulfilled-orders, fraud-analysis, edit-inventory, view-waitlist), reviews, referrals, marketing (+ offers), workers, backend, users, audit, analytics, notifications. Studio OS (`/admin/studio*`, `/admin/studio-os*`, `/admin/headquarters`) is a **separate internal product** |
| **Navigation shell** | `AdminHeader` + per-page back/breadcrumbs; dashboard tiles; no persistent menu (decision G2) |
| **Layout** | A single **`max-w-md` (448px) column at every width**. No `innerWidth`/`@media`/desktop branches in the FS admin page files. There are no separate desktop and mobile admin routes |
| **Design authority** | `docs/frontal-slayer/ADMIN_ALIGNMENT_PROTOCOL.md` + `CORE.md` "Admin Alignment Protocol (2026-07-06, mandatory)": **every existing admin page is finalized unless the founder names it**. Neither document mentions device splits |
| **Layout components** | `AdminHubPageShell`, `AdminHubTabBar`, `AdminHubSortDropdown`, `AdminHeader`, `StatsCard`, `AccountingSpreadsheetCard`, `ConfirmationModal` |
| **Primary assets** | Admin icon set in `public/assets` (revenue, clients, reviews, pending, meetings, marketing, backend, hub; mostly unused) |
| **Interaction systems** | Tabs and sort, modals, founder debug editors that also serve the desktop Tower (perspective panels, page debug, lounge TV, PSA chat config) |
| **Server authorisation** | `requireAdmin`: JWT + email allow-list (`api/_lib/adminAuth.ts`); `requireAdminFounder`. The allow-list is duplicated in 3 places; `admin_roles` is proposed (C2) |
| **Backend dependencies** | `/api/admin/*` (most use `getSupabaseAdmin()`, **anon fallback**: doc 12); admin-only Tower configuration endpoints |
| **Current functionality** | Real: auth gate, clients list, meetings, consult offers, reviews moderation, analytics events. **Local or fabricated:** order fulfilment and tracking (admin localStorage), revenue cards (admin browser's `userOrders_*`), 15% "taxes" and 35% "expenses", mock clients and meetings merged, refund requests hardcoded 0, picsum placeholders (doc 15 #8) |
| **Unfinished workflows** | Orders console (W-05, W-06), refunds (W-04), inventory (W-29), codes (W-30), rewards console, inbox replies (W-28), roles |
| **Legacy or conflicting routes** | `/admin/users`, `/admin/audit`, `/admin/analytics`, `/admin/notifications`: URL-only (0 in-app links); `/admin/clients/account`: redirect only; 10 folds proposed in the prior package (C1, approved per page) |

## Device rule (recorded, not invented)

The repository has **no documented admin device rule**. The 448px column everywhere is the de facto state. Widening it is decision G3, and adding a menu is G2. Both are under the Admin Alignment Protocol. This sprint proposes no admin layout change. The S0B-2 admin item (#8) removes fabricated numbers only, with **no layout change**.

## Relationship to the customer experiences

- Admin acts on the **same records** both customer experiences read: orders, meetings, notifications, reviews, profiles.
- After S0B-1 (M2), customers can no longer write orders, meetings, notifications or reviews directly. Admin continues to write them through the service role (verified: every admin writer uses `getSupabaseAdmin()`).
- Admin also configures desktop Tower presentation (perspective panels and similar). That is founder tooling, not customer UI, and it stays.
