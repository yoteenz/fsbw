# Codebase snapshot — Build-a-Wig

This file is a **snapshot of the current codebase** (structure, entry points, key paths). Update it when the user says **"Snapshot codebase to motherboard"** so the motherboard reflects the project as it stands without revisiting every past chat.

**Last snapshot:** Created with initial "Snapshot codebase to motherboard" feature. Re-run the command after major structural changes to refresh.

---

## Repo layout (top-level)

- `src/` — Frontend (React, Vite, TypeScript)
- `api/` — Vercel serverless API routes
- `public/` — Static assets (e.g. `public/assets/` for images and SVGs)
- `docs/` — Project docs (walkthroughs, API notes)
- `motherboard/` — Core memory (README, CORE, MEMORY, ADDING, this file)
- Root: `package.json`, `index.html`, `vite.config.*`, `tailwind.config.*`, `.env.example`, `.env.local` (local only)

---

## Frontend (`src/`)

**Entry:** `src/main.tsx` → `src/App.tsx` (React Router, routes).

**Key folders:**
- `src/pages/` — One `page.tsx` per route; route path mirrors folder path (e.g. `account/settings/page.tsx` → `/account/settings`).
- `src/components/` — Shared UI (DynamicCartIcon, ConfirmationModal, AdminGuard, BrandMenuLinks, etc.).
- `src/layouts/` — Page layout helpers.
- `src/utils/` — Auth (`adminAuth.ts`), API client (`api.ts`), Supabase (`supabase.ts`), sync (`syncFromApi.ts`), storage, etc.

**Page areas:**
- **Account:** `account/page.tsx`, `account/settings/`, `account/concierge/`, `account/membership/`, `account/notifications/`, `account/payment/`, `account/referrals/`, `account/reviews/`, `account/shipping/`, `account/affiliate/`, `account/load-card/`.
- **Admin:** `admin/dashboard/`, `admin/clients/`, `admin/analytics/`, `admin/audit/`, `admin/brand/`, `admin/meetings/`, `admin/notifications/`, `admin/pending/`, `admin/referrals/`, `admin/reviews/`, `admin/revenue/`, `admin/special-offer/`, `admin/users/`, plus `admin/components/` (ActivityFeed, AdminHeader, etc.).
- **Build-a-wig flow:** `build-a-wig/page.tsx`, `build-a-wig/length/`, `density/`, `texture/`, `lace/`, `hairline/`, `color/`, `styling/`, `cap-size/`, `addons/`.
- **Shop / units:** `straight/noir/`, `straight/blanco/`, `wavy/soft-wave/`, `wavy/beach-wave/`, `curly/soft-curl/`, `curly/ocean-curl/`; `units/straight/`, `units/wavy/`, `units/curly/`; `products/`, `products/units/`.
- **Other:** `lobby/`, `sign-in/`, `checkout/`, `checkout/confirm/`, `shopping-bag/`, `wishlist/`, `wishlist/lists/`, `orders/`, `tools/`, `tools/gift-card/`, `shop/order-form/`.

**Counts (reference):** ~68 `.tsx` files under `src/`.

---

## Backend (`api/`)

**Convention:** Each `.ts` file under `api/` (or `api/admin/`) is a Vercel serverless route. Path maps to URL (e.g. `api/admin/sync-profile.ts` → `POST /api/admin/sync-profile`).

**Shared lib:** `api/_lib/` — `supabase.ts`, `auth.ts`, `profileMapping.ts`, `adminAuth.ts`, `auditLog.ts`.

**User-facing API:** `profile.ts`, `cart.ts`, `orders.ts`, `wishlist.ts`, `delete-account.ts`, `activity.ts`.

**Admin API:** `api/admin/` — `sync-profile.ts`, `dashboard.ts`, `clients.ts`, `analytics.ts`, `audit-log.ts`, `brand.ts`, `meetings.ts`, `notifications.ts`, `pending.ts`, `referrals.ts`, `reviews.ts`, `revenue.ts`, `users.ts`, `cart.ts`, `orders.ts`, `wishlist.ts`, `deleted-accounts.ts`, `activity.ts`; `admin/export/clients.ts`.

**Counts (reference):** ~29 `.ts` files under `api/`.

---

## Config and env

- **Vite:** `VITE_*` in `.env.local` / Vercel (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE`, `VITE_ADMIN_EMAILS`).
- **API:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS` (Vercel env).
- **Copy:** `.env.example` → `.env.local`; restart dev server after env changes.

---

## Docs

- `docs/ADMIN_SYNC_SUPABASE_EMAIL_WALKTHROUGH.md` — Add Supabase email as admin and use Sync.
- `docs/VERIFY_SYNC_PROFILE_API.md` — How to verify `/api/admin/sync-profile` exists and is deployed.
- `docs/DELETE_ACCOUNT_API_WALKTHROUGH.md` — Delete-account API and debugging.

---

## When to refresh this snapshot

Run **"Snapshot codebase to motherboard"** (or "Update codebase snapshot in motherboard") after adding/removing major routes, moving large folders, or when you want the motherboard to reflect the current codebase for new agents. The agent will re-scan the repo and overwrite this file with an updated summary.
