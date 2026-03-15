# Admin dashboard vs Supabase / 3rd‑party apps

This doc describes what the admin dashboard does today (after wiring to Supabase and closing gaps) and what remains optional vs Supabase or 3rd‑party tools.

---

## What is wired now (API + frontend)

All admin pages call the backend when you’re signed in as an admin and Supabase is configured. If the API returns data, the page uses it; otherwise it falls back to mock or localStorage.

| Page | API | Data source when wired |
|------|-----|-------------------------|
| **Dashboard** | `GET /api/admin/dashboard` | Stats (activeClients, referralCount, totalRevenue, totalOrders, pendingForms, **signUpsThisMonth**), recent revenue from Supabase profiles + orders. |
| **Clients** | `GET /api/admin/clients`, `GET /api/admin/orders?user_id=...`, `GET /api/admin/cart?user_id=...`, `GET /api/admin/wishlist?user_id=...`, `GET /api/admin/export/clients` | All profiles; per-client orders; **per-client cart & wishlist**; **Export CSV**. |
| **Revenue** | `GET /api/admin/revenue` | Total revenue, order count, breakdown by month from orders table. |
| **Pending** | `GET /api/admin/pending` | Pending reviews/order forms counts from orders. |
| **Referrals** | `GET /api/admin/referrals` | From `referral_earnings` table when migration `002_admin_gaps.sql` is applied. |
| **Reviews** | `GET /api/admin/reviews`, `PATCH` (status), `POST` (create) | From `reviews` table; admin can publish/reject or add review. |
| **Meetings** | `GET /api/admin/meetings`, `POST`, `PATCH`, `DELETE` | From `meetings` table; full CRUD. |
| **Brand** | `GET /api/admin/brand` | Metrics derived from profiles (referral rate, etc.). |
| **Deleted accounts** | `GET /api/admin/deleted-accounts` | Placeholder until deleted-accounts table; fallback to localStorage + mock. |
| **Analytics** | `GET /api/admin/analytics` | Placeholder until analytics storage; fallback to local social click summary. |
| **Users** | `GET /api/admin/users`, `POST` (disable / enable / trigger-password-reset) | Supabase Auth: list users, disable/enable, send password reset email. |
| **Notifications** | `GET /api/admin/notifications`, `POST` (send to user) | From `notifications` table; admin can send notification to a user. |
| **Audit log** | `GET /api/admin/audit-log` | From `audit_log` table; profile/order/review/meeting/notification changes. |

---

## Gaps that are now closed

| Area | Implementation |
|------|----------------|
| **Auth / users** | **Users** page: list auth users (paginated), disable/enable account, send password reset email. |
| **Analytics** | Dashboard shows **sign-ups this month**; revenue/orders from Supabase. |
| **Cart / wishlist (admin view)** | Client detail tabs **Cart** and **Wishlist**; data from `GET /api/admin/cart?user_id=...` and `GET /api/admin/wishlist?user_id=...`. |
| **Notifications (admin)** | **Notifications** page: send notification to a user; list recent notifications per user. |
| **Export / backup** | **Export CSV** button on Clients (overview); downloads all clients from `GET /api/admin/export/clients`. |
| **Audit log** | **Audit log** page: who did what, when; profile updates (and optional order/review/meeting/notification writes) logged to `audit_log`. |
| **Reviews / messages** | **Reviews** table + API (list, update status, create). Client detail Reviews tab uses local/submitted data; admin Reviews page uses API. |
| **Appointments** | **Meetings** table + API (list, create, update, delete). Client detail Appointments tab can be wired to API later; admin Meetings page uses API. |

---

## Optional / not implemented

| Area | Note |
|------|------|
| **Roles / permissions** | Admin check is still “email in allowlist” (e.g. `ADMIN_EMAILS`). No per-admin roles or scopes in the UI. |
| **Deleted accounts** | Backend has placeholder; no dedicated `deleted_accounts` table yet. |
| **Analytics (server)** | Analytics page uses local/social click summary until server-side analytics storage exists. |

---

## Summary

- **Done:** Admin dashboard shows all clients, their orders, **cart**, and **wishlist**; **export clients (CSV)**; **auth user list** with disable/enable and password reset; **notifications** (send to user + list); **audit log**; **reviews** and **meetings** backed by DB when migration `002_admin_gaps.sql` is applied. Dashboard includes **sign-ups this month**.
- **Optional:** Per-admin roles, deleted-accounts table, server-side analytics storage.
