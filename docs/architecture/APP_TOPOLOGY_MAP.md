# App Topology Map — Build-a-Wig

Evidence at commit `2ea7bd9e`. See route detail in `ROUTE_SURFACE_CATALOG.md`.

---

## Frontend app shell

| Piece | Path | Role | Evidence |
|-------|------|------|----------|
| Bootstrap | `src/main.tsx` | Auth restore, password sanitize, Supabase bootstrap | `main.tsx:17-61` |
| Router + global effects | `src/App.tsx` | 251 routes, cart strip, inventory sync, profile flush | `App.tsx` |
| Guards | `src/components/AdminGuard.tsx`, `AccountRouteGuard.tsx`, `CommerceRouteGuard.tsx` | Admin / account / commerce access | guard files |
| API client | `src/utils/api.ts` | Large fetch wrapper for all `/api/*` | `api.ts` |
| Supabase client | `src/utils/supabase.ts` | Session, cookie restore | `supabase.ts` |

---

## Routes (summary)

| Group | Count | Guard | Entry |
|-------|------:|-------|-------|
| Landing / lobby | 5 | none | `HomeLandingRedirect`, `lobby/page.tsx` |
| Admin | 30 | AdminGuard | `admin/*` |
| Unit PDPs + redirects | 15 | none | `straight|wavy|curly/*/page.tsx` |
| Build-a-Wig | 146 | none (sign-in gated in-page) | `build-a-wig/**` |
| Shop / tools / booking | 20 | none | `products/`, `tools/`, `booking/` |
| Brand | 10 | none | `brand/page.tsx` |
| Wishlist | 4 | Account (except shared) | `wishlist/**` |
| Account | 14 | AccountRouteGuard | `account/**` |
| Bag / checkout | 7 | Commerce (partial) | `shopping-bag/`, `checkout/` |

**Total:** 251 `<Route>` declarations — `code-backed` (`App.tsx`).

---

## Page modules (`src/pages/`)

~**90+** `page.tsx` files. Major trees:

- `account/` — 15+ subpages
- `admin/` — dashboard, clients, revenue, marketing, backend, meetings, …
- `build-a-wig/` — hub + 9 step folders
- `straight|wavy|curly/` — unit PDPs
- `shop/` — BCF texture category, order form
- `checkout/`, `shopping-bag/`, `orders/`
- `tools/` — gift card, live try-on, hairstyle analysis demo
- `booking/` — consult + appointment

---

## Shared components (`src/components/`)

| Area | Examples |
|------|----------|
| Cart | `CartDropdown.tsx`, `cart/CartLineProductTextStack.tsx` |
| Shop nav | `shop/useShopNavSearchBar.tsx` |
| PSA | `psa/*` widget, nudges, chat UI |
| Admin | `admin/*` panels referenced from pages |
| Auth modals | `BuildAWigFeatureSignInModal.tsx` |
| Lounge | `LoungeTvOverlay.tsx` |

---

## Shared utils (`src/utils/`)

**150+** files. High-impact:

| Util | Purpose |
|------|---------|
| `adminAuth.ts` | Admin/founder detection, auth backup |
| `syncFromApi.ts` | Profile/cart/orders/wishlist sync |
| `cartWishlistStorage.ts` | Per-user cart keys |
| `bcfProductOptions.ts` | BCF catalog + pricing |
| `productOptions.ts` | BAW option names (no prices) |
| `checkoutQuote.ts` | Client → server quote line mapping |
| `premiumMemberAccess.ts` | Premium gate |
| `bawNoirLivePreviewStorage.ts` | NOIR live preview state |
| `buildAWigEditSession.ts` | BAW edit session keys |

---

## API routes (`api/`)

**91** serverless handlers (excluding `api/_lib/`). Grouped:

- **User:** `profile`, `cart`, `orders`, `wishlist`, `notifications`, `delete-account`, `activity`
- **Checkout:** `checkout/quote`, `validate-consult-code`, `redeem-consult-code`
- **Stripe:** `stripe/webhook`, `create-checkout-session`, `create-product-payment-intent`, availability probes
- **Wig preview / live:** `wig-preview/live-noir-color`, `live-wig-after-color-styling`, `live-try-on-*`, `build-a-wig-unit-image`
- **PSA:** `psa/chat`, `threads`, `usage`, `selfie-style-analysis`, …
- **Hairstyle:** `hairstyle-analysis-generate`, `hairstyle-analysis-usage`
- **Admin:** 40+ under `api/admin/`
- **Public config:** `special-offer-config`, `lounge-tv-config`, `psa-chat-config`, `analytics/event`

Full registry: **`API_CONTRACT_REGISTRY.md`**.

---

## Supabase tables (migrations)

**32** migration files. Core sync tables:

- `profiles` (JSONB addresses, vouchers, pending mirrors)
- `cart`, `wishlist`, `orders` (JSONB `items` / `active_orders` / `past_orders`)
- `notifications`, `reviews`, `meetings`, `consult_quotes`
- `app_config`, `site_analytics_events`
- Stripe: `membership_payments`, `membership_payment_failures`
- Pending: `pending_order_forms`, `pending_affiliate_submissions`, `pending_review_supplemental`
- PSA: `psa_threads`, `psa_messages`, `psa_member_context`, `psa_message_usage`, `psa_tool_events`
- Hairstyle: `hairstyle_analysis_usage`, `hairstyle_analysis_purchase_grants`

Detail: subagent schema report in genome audit; `db-backed`.

---

## Supabase Storage buckets

**Not created in migrations** (`verify-first` for prod bucket list).

| Bucket | Use | Evidence |
|--------|-----|----------|
| `profile-images` | Account avatars | `api/profile-image.ts`; `CORE.md:82` |
| `live-preview` / `wig-preview` | NOIR WebPs, Fal refs | `.env.example:34-40`; batch scripts |
| Hairstyle templates | Static template PNGs (legacy Fal path) | `hairstyleAnalysisTemplates.ts` |

---

## Stripe

| Flow | Route | Client |
|------|-------|--------|
| Membership Checkout Session | `POST /api/stripe/create-checkout-session` | `/checkout/upgrade` |
| Product PaymentIntent | `POST /api/stripe/create-product-payment-intent` | `checkout/page.tsx` (partial wire) |
| Webhook | `POST /api/stripe/webhook` | Stripe Dashboard |
| Availability probes | `GET .../membership-available`, `product-checkout-available` | checkout UI gates |

---

## Fal / OpenAI image generation

| Pipeline | API | Model |
|----------|-----|-------|
| NOIR live color | `POST /api/wig-preview/live-noir-color` | GPT Image 2 edit |
| After-color styling | `POST /api/live-wig-after-color-styling` | GPT Image 2 edit |
| Live try-on studio | `POST /api/live-try-on-studio-render` | Fal (NBP/Ideogram paths) |
| BAW unit marketing image | `POST /api/build-a-wig-unit-image` | Fal |
| Hairstyle card hair | via `hairstyle-analysis-generate` | Fal hair-only + sharp composite |
| PSA selfie style | `POST /api/psa/selfie-style-analysis` | OpenAI |

Map: **`AI_IMAGE_PIPELINE_MAP.md`**.

---

## PSA assistant

- **Client:** floating widget, thread UI, premium gate
- **Server:** `api/psa/chat.ts` (OpenAI), tool routing in `api/_lib/psaTools.ts`
- **Persistence:** `psa_threads`, `psa_messages`, usage RPC
- **Config:** `GET /api/psa-chat-config` (public), admin PUT variant

---

## Resend / email

| Flow | Route |
|------|-------|
| Admin newsletter | `POST /api/admin/newsletter-send` |
| Brand contact | `POST /api/brand/contact-submit` |
| FAQ submit | `POST /api/brand/faq-question-submit` |

Requires `RESEND_API_KEY` — `.env.example:88-91`.

---

## Analytics

| Layer | Mechanism |
|-------|-----------|
| Client events | `src/utils/socialAnalytics.ts` → `POST /api/analytics/event` |
| DB | `site_analytics_events` (`meta` JSONB) |
| Admin read | `GET /api/admin/analytics` |

---

## Playwright tests

| Project | File | Count |
|---------|------|------:|
| setup-premium | `e2e/auth.premium.setup.ts` | 1 |
| setup-standard | `e2e/auth.standard.setup.ts` | 1 |
| guest | `e2e/guest.spec.ts` | 11 |
| standard-user | `e2e/standard-user.spec.ts` | 7 |
| premium-user | `e2e/premium-user.spec.ts` | 4 |

**Total listed:** 24 — `runtime-verified`.

---

## Browser storage

| Store | Keys (sample) | Owner doc |
|-------|---------------|-----------|
| localStorage | `currentUser`, `registeredUsers`, `cartItems`, `wishlistItems`, `userOrders_{email}`, BAW `selected*` / `customizeSelected*` | `STATE_AND_PERSISTENCE_OWNERSHIP_MAP.md` |
| HttpOnly cookies | `baw_session_rt` (session restore), `baw_auth_b` (backup) | `api/session-restore.ts`, `adminAuth.ts` |
| sessionStorage | `baw_server_restore_attempted_v1`, sign-out flags | `AccountRouteGuard.tsx` |
| Supabase | `sb-*-auth-token` | `supabase.ts` |

**localStorage touch count:** 100+ files — `code-backed` (grep).

---

## Public assets

| Path | Size | Notes |
|------|------|-------|
| `public/assets/` | ~1.2G | Mannequins, marble, SVGs, lounge video — `runtime-verified` |
| `canonical-backup/` | ~830M | **legacy** backup tree in repo — hygiene risk |

---

## Deployment assumptions

| Assumption | Evidence |
|------------|----------|
| Vercel hosts SPA + `api/` | `.vercel` in `.gitignore`; serverless file layout |
| `VITE_API_BASE` empty = same-origin API | `.env.example:12-14` |
| `SITE_URL` for Stripe redirects | `.env.example:85` |
| `SESSION_COOKIE_SECRET` for Safari restore | `.env.example:62-64` |
| Mobile-first; desktop layout **planned** | `CORE.md:36` |
