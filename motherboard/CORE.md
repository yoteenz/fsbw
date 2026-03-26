# Core Context — Build-a-Wig / Frontal Slayer

Canonical reference for stack, design, and main flows. Keep this updated when the project’s **persistent** design or architecture changes.

---

## Stack & repo

- **Frontend:** React 19, TypeScript, Vite 5, React Router 6, Tailwind CSS.
- **Backend / Auth / DB:** Supabase (Auth, profiles, orders, cart, wishlist, key/value **app_config** for site-wide JSON such as the admin special-offer card). Vercel serverless API routes under `api/`. Full table definitions, RLS, and `auth.users` → `profiles` trigger: run `supabase/migrations/20260325120000_full_app_sync.sql` in the Supabase SQL Editor when setting up or repairing sync. Marketing/admin JSON: also run `supabase/migrations/20260325140000_app_config_marketing.sql` for the `app_config` table.
- **Env:** Vite uses `VITE_*` (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE`, `VITE_ADMIN_EMAILS`). Backend uses `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`.
- **Local:** `.env.local` for dev; copy from `.env.example`. Restart dev server after changing env.

---

## Design system

- **Fonts:** "Futura PT" family (Book, Medium, Demi). "Covered By Your Grace" for accent numbers/dates. Uppercase labels and CTAs common.
- **Brand red:** `#EB1C24` — primary buttons, links, active states, key icons.
- **Backgrounds:** Marble texture (`/assets/marble-half.png`), white/translucent cards (`bg-white/60`, `backdrop-blur-sm`), borders often `1.3px solid black` or `1.3px solid #9ca3af` (gray).
- **Icons:** SVGs in `public/assets/` (e.g. `special-offer.svg`, `slay-challenge.svg`, `Free Gift.svg`). Use `<img src="/assets/...">` with red filter when they should match brand red.
- **Layout:** Mobile-first; shared nav with back/menu, breadcrumb-style text (e.g. `ACCOUNT > CONCIERGE`), cart icon, dynamic cart count from localStorage / events.

---

## Auth & identity

- **Sign-in:** Supabase email/password only; no OAuth (Google/Facebook). Admin emails (from `VITE_ADMIN_EMAILS` / `ADMIN_EMAILS`) can fall back to local sign-in if Supabase fails; local user stored in `registeredUsers` and `currentUser` in localStorage.
- **Admin list:** `src/utils/adminAuth.ts`. Default admin emails include `ayoteenz@yahoo.com`, `admin@frontalslayer.com`, `kateena.armstrong@frontalslayer.com`. Env overrides: `VITE_ADMIN_EMAILS` (frontend), `ADMIN_EMAILS` (Vercel API). When set, env list is used (include all desired admins, e.g. Supabase email + ayoteenz).
- **Admin features:** Access to `/admin/*`, “Sync my account” in Account → Settings, Concierge card for ayoteenz (and premium). Sync uses `POST /api/admin/sync-profile` with email + password (Supabase credentials).

---

## Key flows

- **Account / Concierge:** Priority messages, order tracking, Slay Challenge (6‑month cycles, reward selection), Special Offer (configurable via Admin → Marketing; $40 off, 60‑day countdown), Free Gift, Birthday Gift. Admin (ayoteenz) can override Slay Challenge stage for testing.
- **Admin / Marketing:** Special-offer config at **`/admin/marketing`** (nav: "ADMIN > MARKETING"). Page: product, length, density, texture, lace, hairline (incl. LAGOS + PEAK), color, styling (incl. Bangs combos), add-ons (dropdown with all combinations: NONE, single, BLEACH + PLUCK, etc., via `ADDON_COMBO_OPTIONS`), thumbnail, start date. All dropdown panels use `max-h-48 overflow-y-auto` for scrolling. Save Config and RANDOMIZE (red text) below card; RANDOMIZE fills all options with valid random values. **Persistence:** Save writes `specialOfferAdminConfig` to localStorage and upserts the same JSON to Supabase `app_config` key `special_offer_admin` via **`PUT /api/admin/special-offer-config`** (admin session). Concierge and the admin editor load from **`GET /api/special-offer-config`** first, then fall back to localStorage.
- **Cart / Wishlist:** Stored in localStorage (global and per-user keys). Synced to backend on sign-in/sync where applicable.
- **Orders:** Active/past orders per user; tracking stages with progress. Mock/test orders for admin (e.g. Kateena) for demos.
- **Sync:** “Sync my account” (Settings) for any admin: sends Supabase email + password to `/api/admin/sync-profile`; backend returns profile, orders, cart, wishlist; frontend applies to localStorage. Requires admin email in both `VITE_ADMIN_EMAILS` and `ADMIN_EMAILS`.

---

## Conventions

- **Lobby (home) nav:** Neon logo (center) → `/home/shop`. Products (neon-products) → `/shop/units`. Tools (neon-tools) → `/home/tools`. Implemented in `src/pages/lobby/page.tsx`.
- **Paths:** Pages under `src/pages/` (e.g. `account/`, `account/settings/`, `account/concierge/`, `admin/`). Shared components in `src/components/`, utils in `src/utils/`.
- **State:** React `useState`/`useEffect`; persistent data in localStorage (`currentUser`, `registeredUsers`, cart, wishlist, per-user keys). Supabase session for server-backed data.
- **API:** Base URL from `VITE_API_BASE`; routes in `api/` (e.g. `api/admin/sync-profile`, `api/delete-account`). CORS and JSON error responses on API routes.
- **Docs:** Project docs in `docs/` (e.g. `ADMIN_SYNC_SUPABASE_EMAIL_WALKTHROUGH.md`, `DELETE_ACCOUNT_API_WALKTHROUGH.md`). **Profiles:** Exact Supabase `profiles` columns and how they map to the API and app (name, photo, socials, birthday, rewards) are in `docs/PROFILES_COLUMNS_AND_APP_MAPPING.md`—use it when fixing sync or account repopulation.
- **Admin client details (Orders vs Appointments):** Orders and Appointments tabs share the same card layout (flex, gap 12px), typography (Covered By Your Grace 16px for date, Futura PT Medium 10px/12px for title and secondary text, #EB1C24 / #808080), left 85×85 area (orders: product image + "N ITEMS"; appointments: APT placeholder only, no label below), status pill (height 15px, padding 0 6px, borderRadius 2px, Futura PT Medium 8px). Appointment time is offset with `translateY(-2px)`. Empty state: "NO APPOINTMENTS YET" matches "NO ORDERS YET" styling.
- **Client profile BIRTHDAY row:** Add BIRTHDAY between EMAIL and PHONE. Display format "AUGUST 30, 1989". Fallback order: birthDate → birthMonth+birthDay+birthYear (MM/DD/YYYY) → birthMonth+birthDay (MM/DD) → birthDay only ("Day 15") → "—". See MEMORY 2025-02-28.
- **Main card responsive height:** For the single main content card (border, bg-white/60, backdrop-blur-sm, p-4, mb-2) on list/settings-style pages: use proportional scaling so the card keeps the same visual proportion across viewports. **Wishlist lists** uses `calc(100vh * 520 / 745)` (520px at 745px viewport height). **Account Payment** and **Account Shipping** use `minHeight: calc(100vh * 510 / 900)`. Other pages (Wishlist main, Shopping bag, Admin clients, Account settings, Account menu open) use viewport-minus-fixed (e.g. `calc(100vh - 270px)` or `calc(100dvh - 160px)`). See MEMORY 2025-02-28 (main card responsiveness).
