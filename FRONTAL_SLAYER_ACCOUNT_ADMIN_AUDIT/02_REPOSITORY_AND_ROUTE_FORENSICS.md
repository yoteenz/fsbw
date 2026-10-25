# 02 — Repository and Route Forensics

Sprint: `P0.FRONTAL-SLAYER.OPUS.ACCOUNT-PROFILES-AND-ADMIN-DASHBOARD.PAGE-TREE-UX-AND-COMPLETION-AUDIT.V1`
Audit date: 2026-10-25. This is a read-only audit: no product code was changed, nothing was deployed, and no database was mutated.

---

## 1. Which repository is FRONTAL SLAYER?

The session could access two repositories. The evidence below settles which one holds FRONTAL SLAYER.

| Repository | Evidence | Verdict |
|---|---|---|
| `yoteenz/fsbw` | `package.json` name is `build-a-wig`. `AGENTS.md` lists the "Frontal Slayer" app on port 3001. `motherboard/CORE.md` is titled "Core Context — Build-a-Wig / Frontal Slayer". The repo contains `src/pages/account/*`, `src/pages/admin/*`, `brand-bible/frontal-slayer-north-star-manifesto.md` and production Supabase project `hyycomvcaqxxvyrfupes` ("FS Website"). | **This is FRONTAL SLAYER.** |
| `yoteenz/SITE00` | The README says "SITE 00 — Standalone Application. Independent commercial product **extracted from the Frontal Slayer monorepo**". `AGENTS.md` says "Do not push to Frontal Slayer / fsbw". | A separate product. It **shares the same Supabase project** during its migration (SITE00 `README.md:93`). |

The audit therefore targets **`yoteenz/fsbw`**. SITE00 was not modified.

## 2. Repository facts

| Field | Value |
|---|---|
| REPOSITORY | `yoteenz/fsbw` |
| DEFAULT BRANCH | `master` |
| CURRENT WORKING BRANCH | `claude/frontal-slayer-audit-vclp3w` |
| HEAD SHA (audit base) | `c95c32f03ff1ffc16f8c463f3031a1595f9b7ed3` (equal to `origin/master` at audit start) |
| FRAMEWORK | React `^19.0.0`, TypeScript `~5.6`, Vite `^5.4`, Tailwind `^3.4`, Framer Motion `^11` |
| ROUTER | `react-router-dom ^6.8`. Routes are declared in one file, `src/App.tsx` (3,618 lines), plus `src/routes/MobileMansionRoutes.tsx`, `Site00Routes.tsx`, `Site00AdminRoutes.tsx` and `StudioDebugRoutes.tsx`. |
| STATE MANAGEMENT | **No store library** (no Redux, Zustand, Jotai or React Query). State lives in **`localStorage`** (keys such as `currentUser`, `userOrders_<email>`, `cartItems`, `registeredUsers`, …) plus `window` CustomEvents (`signInStateChanged`, `ordersUpdated`, …) plus per-page React state. |
| AUTHENTICATION | Supabase Auth with email and password only, plus an optional passkey. The client gate reads `localStorage.isSignedIn` / `currentUser.email` (`src/utils/adminAuth.ts`). The server verifies the JWT with `supabase.auth.getUser` (`api/_lib/auth.ts`). Admin access is an **email allow-list** on both client and server (`api/_lib/adminAuth.ts`). |
| DATABASE | Supabase Postgres, project `hyycomvcaqxxvyrfupes`, with 82 migration files under `supabase/migrations/`. |
| DEPLOYMENT | Vercel: the SPA plus serverless functions in `api/` (175 handler files; 82 under `api/admin/`). `vercel.json` uses `ignoreCommand: scripts/vercel-should-build.sh`. Production deploys only when the founder says "deploy now" (`AGENTS.md`). |
| PAYMENTS | Stripe (`stripe ^17`): subscriptions (3/6/12-month), product PaymentIntents and webhooks (`api/stripe/*`). |
| EMAIL | Resend (`resend ^4`) via `api/email/*` and `api/_lib/email/*`. |
| DECLARED BUILD TARGET | **"MOBILE-ONLY RIGHT NOW"** (`motherboard/CORE.md` §ACTIVE BUILD TARGET). Desktop is a later, separate phase (the Desktop Mansion `/desktop/*` already exists in parallel). |

The historical architecture in the brief (React 19 + Vite + Supabase + Vercel serverless) is **confirmed** by the code.

## 3. Directory map (scoped)

| Path | Role in scope |
|---|---|
| `src/pages/account/**` | Customer account pages (hub, concierge, membership/rewards, collectibles, referrals, affiliate, alerts, consult-offer, reviews, shipping, payment, settings, load-card) |
| `src/pages/orders/page.tsx` | `/account/orders` (4,140 lines) |
| `src/pages/wishlist/**` | Wishlist, lists, shared list |
| `src/pages/admin/**` (non-studio) | 33 Frontal Slayer operational admin routes |
| `src/pages/admin/components/**` | `AdminHeader` (899 lines), `StatsCard`, `RecentActivity`, `ActivityFeed`, brand/PSA/lounge panels |
| `src/components/admin/AdminHub*` | `AdminHubPageShell`, `AdminHubTabBar`, `AdminHubSortDropdown`: the most reusable admin shell |
| `src/components/AccountRouteGuard.tsx`, `AdminGuard.tsx`, `CommerceRouteGuard.tsx` | Client route guards |
| `src/layouts/` | `MarblePageShell`, `PageActionsBelowCard`, `PAGE_LAYOUT.md` (the page layout canon) |
| `src/design-system/` | FDS tokens and glass components. **No scoped page imports it** (see doc 18). |
| `src/utils/*` | `adminAuth`, `syncFromApi`, `orderTracking`, `adminRevenueStats`, `premiumMemberAccess`, `adminBrandCodes`, `wishlistListShare`, … (business logic lives here and in pages) |
| `api/` | Vercel functions: `profile`, `orders`, `cart`, `wishlist`, `notifications`, `client/*`, `admin/*`, `stripe/*`, `checkout/*`, `slay-tickets/*`, `collectibles/*`, `hairstyle-analysis-*` |
| `supabase/migrations/` | 82 migrations (001 → 20260826) |
| `e2e/` | 3 Playwright specs (smoke only, run against production by default) |
| `motherboard/` | Agent context (CORE, MEMORY 56k lines, CODEBASE) |

## 4. Route inventory summary

| Family | Count | Where declared |
|---|---|---|
| Customer account and account-adjacent routes (scoped) | **28 surfaces**: 22 core plus 6 parallel or adjacent shells (see doc 09) | `App.tsx:3416-3602`, `MobileMansionRoutes.tsx`, `App.tsx` `/desktop/*` |
| Account redirects | `/orders` → `/account/orders`, `/account/notifications` → `/account/alerts`, `/shopping-bag` → `/bag` | `App.tsx:3493, 3563` |
| Frontal Slayer operational admin routes | **33** (doc 10) | `App.tsx:1303-1440` plus later blocks |
| Studio OS / SITE00 admin routes under `/admin` | **≈319 `path=` entries** plus `Site00AdminRoutes()`. **Out of scope** (a separate platform product) | `App.tsx:1440-3069`, `Site00AdminRoutes.tsx` |
| Build-A-Wig routes | ≈95 (`/build-a-wig/<unit>/{customize,edit}/<step>`, `view`, `try`) | `App.tsx:3109-3287` |

### Guards

| Guard | Applies to | Mechanism | Server-backed? |
|---|---|---|---|
| `AccountRouteGuard` | each `/account/*` and `/wishlist*` route, **one instance per route** | Restores the Supabase session, then `syncAllFromApi()`, then trusts `localStorage.isSignedIn` | Data APIs verify the JWT. The page shell can render on a forged localStorage flag but shows only local data. |
| `AccountHubRedirect` | `/account` | ≥768px → `/desktop/account` | n/a |
| `AdminGuard` | all `/admin/*` | `isSignedIn()` plus email in the client allow-list (localStorage) | **Yes**: every Frontal Slayer `api/admin/*` handler calls `requireAdmin` (doc 13) |
| `useRequireAdminPageAccess` | every admin page | Repeats the client check | — |
| `CommerceRouteGuard` | `/bag`, `/checkout*` | Guest-allowed commerce | — |
| none | `/checkout/upgrade`, `/tools/hairstyle-analysis`, `/slay-cam`, `/mobile/*` | — | — |

## 5. Live-database cross-check (read-only)

These checks ran on 2026-10-25 against production project `hyycomvcaqxxvyrfupes`, using **read-only** catalog queries and the Supabase security advisor. Only aggregate counts were read; no customer rows were selected.

| Check | Result | Consequence |
|---|---|---|
| `public.orders` row count | **0** | No server-recorded orders exist in production yet. The business is effectively pre-launch on the server side. |
| `public.profiles` row count | 9 | |
| profiles with `loyalty_points > 0` | 0 | There is no server points economy. |
| profiles with `current_tier_name='BLACK'` | 0 | |
| `referral_earnings` rows | 0 | |
| `hairstyle_analysis_purchase_grants` rows | 0 | |
| `audit_log` rows | 56 | The audit trail is in use. |
| Policies on `orders` | **"Users can insert own orders", "Users can update own orders"** (legacy 001) are **live**, alongside `orders_select_own` | Confirms finding H3 (doc 13). |
| Policies on `meetings` | Users can insert, update and delete their own rows (**live**) | Confirms finding H1. |
| Policies on `notifications` | Users can insert and update their own rows (**live**) | L5 |
| RLS on `psa_tool_events` | **enabled** in production; the migration file does not enable it | Repo/production drift (downgraded from H2) |
| EXECUTE on `hairstyle_analysis_grant_purchase_credits`, `_try_consume`, `_refund_consume`, `psa_try_consume_message` | Granted to **`anon` and `authenticated`** | **NEW CRITICAL C2** (doc 13) |
| `hairstyle_analysis_grant_purchase_credits` accepted counts | `IN (1, 3, 6)` (live definition) | The 4-comparison purchase grants nothing (**live-confirmed**) |
| Supabase advisor | 2 `rls_disabled_in_public` (SITE00 tables), 17 anon-executable `SECURITY DEFINER` functions, leaked-password protection **off** | doc 13 |

## 6. Build and test status at audit time

| Check | Result |
|---|---|
| `npm ci` | OK |
| `tsc --noEmit` | **PASS (0 errors)**. It needs `--max-old-space-size=8192`; the default heap runs out of memory. |
| `vitest run` (112 files) | 101 passed, **9 failed**, 2 skipped; 1,340 / 1,368 tests passed. **All 9 failing files are outside account/admin scope** (Studio OS, SITE00 design bridge, platform-stabilization). These failures were not caused by this audit. |
| Account/admin unit tests | **0** |
| Admin E2E | **0** (no spec contains `/admin`) |
| Account E2E | Smoke only: 5 routes "load" and the standard-user flow. It is skipped unless `E2E_STANDARD_EMAIL` is set, and it targets `https://fsbw.vercel.app` by default. |
| `vite build` (run directly, without the npm `prebuild` asset-generation chain, which touches tracked files) | **PASS** in 62s (largest chunk `App` 1.84 MB / 431 kB gzip; Vite chunk-size warning). `dist/` is gitignored, and the working tree stayed clean. |

Note: running `vitest` regenerates tracked Studio World JSON fixtures as a side effect. Those changes were reverted and are not part of this audit commit.
