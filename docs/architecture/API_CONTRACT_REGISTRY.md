# API Contract Registry — Build-a-Wig

**91** Vercel serverless route files (`code-backed`, audit 2026-06-12).  
**Typecheck:** `api/**/*.ts` **not** in `tsconfig.json` `include` — separate `tsc` reports **19 errors** (`runtime-verified`).

**Auth shorthand:** `public` | `Bearer` | `Bearer+p` (premium) | `admin` | `founder` | `admin-sync` | `stripe-sig` | `cron` | `cookie`

**CORS:** Most routes set `Access-Control-Allow-Origin` from request origin or `*` — `verify-first` per route for production lockdown.

**Rate limit:** `api/_lib/rateLimit.ts` — in-memory per instance unless noted.

---

## Typecheck failures (sample — fix before release gate)

| File | Error class |
|------|-------------|
| `hairstyleAnalysisBuiltTemplate.ts:61` | RoseMarkerDef vs PixelRect |
| `hairstyleAnalysisFonts.ts:4` | missing `@types/opentype.js` |
| `liveTryOnBatchGenerate.ts` | Jimp types |
| `psa/selfie-style-analysis.ts:134` | auth user shape |
| `admin/live-try-on-batch-step.ts:119` | AuditAction union |

Full list: run `./node_modules/.bin/tsc --noEmit ... api/**/*.ts`.

---

## User & profile

| Route | Methods | Auth | Tables / storage | Rate limit | Tests |
|-------|---------|------|------------------|------------|-------|
| `/api/profile` | GET, PATCH | Bearer | `profiles` | — | none |
| `/api/profile-image` | POST | Bearer | `profiles`, `profile-images` bucket | — | none |
| `/api/cart` | GET, PUT | Bearer | `cart` | — | none |
| `/api/wishlist` | GET, PUT, POST | Bearer | `wishlist` | — | none |
| `/api/orders` | GET; PUT→403 | Bearer | `orders` SELECT only (RLS) | — | none |
| `/api/notifications` | GET | Bearer | `notifications` | — | none |
| `/api/activity` | POST | Bearer | `user_activity` | — | none |
| `/api/delete-account` | DELETE | Bearer | auth + `deleted_accounts` | — | none |

---

## Session

| Route | Methods | Auth | Notes |
|-------|---------|------|-------|
| `/api/session-cookie` | POST | Bearer (register); clear w/o | Sets HttpOnly refresh cookie |
| `/api/session-restore` | GET | cookie | Returns tokens JSON — **P1** origin reflection `session-restore.ts:92` |

---

## Checkout & quotes

| Route | Methods | Auth | Behavior |
|-------|---------|------|----------|
| `/api/checkout/quote` | POST | public | Body `{ lines }` → `resolveQuote.ts`; ignores client `price` |
| `/api/checkout/validate-consult-code` | POST | Bearer | `consult_quotes` |
| `/api/checkout/redeem-consult-code` | POST | Bearer | sets `redeemed_at` |

---

## Stripe

| Route | Methods | Auth | External |
|-------|---------|------|----------|
| `/api/stripe/membership-available` | GET | public | env check |
| `/api/stripe/product-checkout-available` | GET | public | env check |
| `/api/stripe/create-checkout-session` | POST | Bearer | Stripe Checkout |
| `/api/stripe/create-product-payment-intent` | POST | Bearer | Stripe PI; rejects unresolved quote |
| `/api/stripe/webhook` | POST | stripe-sig | Supabase order append idempotent |

---

## Booking

| Route | Methods | Auth | Notes |
|-------|---------|------|-------|
| `/api/booking/appointment-meeting` | POST | Bearer | creates meeting |
| `/api/booking/consult-meeting` | POST | Bearer | consult flow |
| `/api/booking/autopay-final-payment` | POST | cron secret | Stripe off-session |

---

## Wig preview & live try-on

| Route | Methods | Auth | Fal | Rate limit |
|-------|---------|------|-----|------------|
| `/api/wig-preview/live-noir-color` | POST | Bearer | yes | — |
| `/api/live-wig-after-color-styling` | POST | Bearer / cacheOnly public | yes | — |
| `/api/live-try-on-studio-render` | POST | Bearer | yes | — |
| `/api/live-try-on-studio-render-status` | GET | Bearer | — | — |
| `/api/live-try-on-studio-makeup` | POST | Bearer | yes | — |
| `/api/live-try-on-resolve` | POST | public | — | — |
| `/api/live-try-on-ensure-overlays` | POST | Bearer | 410 stub | — |
| `/api/build-a-wig-unit-image` | POST | Bearer | yes | IP 12/hr; user 24/day |

---

## Hairstyle analysis

| Route | Methods | Auth | Notes |
|-------|---------|------|-------|
| `/api/hairstyle-analysis-generate` | POST | Bearer+p | Fal hair + sharp composite; usage consume |
| `/api/hairstyle-analysis-usage` | GET | Bearer+p | allowance read |

---

## PSA

| Route | Methods | Auth | OpenAI | Rate limit |
|-------|---------|------|--------|------------|
| `/api/psa/chat` | POST | Bearer+p | yes | DB usage RPC |
| `/api/psa/threads` | GET, POST | Bearer+p | — | — |
| `/api/psa/thread` | GET, PATCH, DELETE | Bearer+p | — | — |
| `/api/psa/usage` | GET | Bearer+p | — | — |
| `/api/psa/health` | GET | public / admin probe | optional | — |
| `/api/psa/purchase-context` | POST | Bearer+p | — | — |
| `/api/psa/selfie-style-analysis` | POST | Bearer+p | yes | — |
| `/api/psa/slay-identity` | POST | Bearer+p | — | — |
| `/api/psa-chat-config` | GET | public | — | — |

---

## Public config & brand

| Route | Methods | Auth | Notes |
|-------|---------|------|-------|
| `/api/special-offer-config` | GET | public | `app_config` |
| `/api/lounge-tv-config` | GET | public | `app_config` |
| `/api/analytics/event` | POST | public | `site_analytics_events` |
| `/api/brand/contact-submit` | POST | public | Resend + DB |
| `/api/brand/faq-question-submit` | POST | public | Resend + DB |
| `/api/consult-quote` | GET | Bearer | client quote read |

---

## Client submissions

| Route | Methods | Auth | Notes |
|-------|---------|------|-------|
| `/api/client/submissions` | POST | Bearer | order form, review, affiliate → pending queues |
| `/api/client/priority-messages` | POST | Bearer+p | concierge messages |

---

## Admin routes (40+)

All require **`admin`** (`requireAdmin`) unless **founder** noted.

| Route | Methods | Founder? | Purpose |
|-------|---------|----------|---------|
| `/api/admin/sync-profile` | POST | — | Bearer or email+password body |
| `/api/admin/dashboard` | GET | — | stats |
| `/api/admin/clients` | GET | — | client list |
| `/api/admin/export/clients` | GET | — | CSV export |
| `/api/admin/cart`, `wishlist`, `orders` | GET | — | per-user read |
| `/api/admin/meetings` | CRUD | — | scheduling |
| `/api/admin/consult-quotes` | POST | — | send offer |
| `/api/admin/meeting-client-alert` | POST | — | client notifications |
| `/api/admin/pending-queue` | GET, PATCH | — | approve/decline |
| `/api/admin/revenue` | GET | — | revenue stats |
| `/api/admin/analytics` | GET | — | marketing analytics |
| `/api/admin/newsletter-send` | POST | — | Resend bulk |
| `/api/admin/special-offer-config` | PUT | — | marketing card |
| `/api/admin/lounge-tv-config` | PUT | — | lobby content |
| `/api/admin/live-try-on-batch-step` | POST | **founder** | Fal batch |
| `/api/admin/live-try-on-batch-status` | POST | **founder** | batch status |
| `/api/admin/live-try-on-batch-manifest` | GET | — | manifest |
| `/api/admin/page-debug-config` | GET, PUT | **founder** | debug overlays |
| `/api/admin/psa-chat-config` | GET, PUT | — | PSA config |
| `/api/admin/psa-review` | GET | — | PSA audit |
| `/api/admin/users` | GET, POST | — | disable/reset |
| `/api/admin/audit-log` | GET | — | audit |
| `/api/admin/booking-autopay-attempts` | GET | — | autopay log |
| `/api/admin/membership-payments` | GET | — | Stripe history |
| `/api/admin/brand-contact-inquiries` | GET, PATCH | — | inquiries |
| `/api/admin/priority-messages` | GET, PATCH | — | messages |
| `/api/admin/notifications` | GET, POST | — | admin alerts |
| `/api/admin/referrals` | GET | — | referrals |
| `/api/admin/reviews` | GET, PATCH, POST | — | moderation |
| `/api/admin/deleted-accounts` | GET | — | tombstones |
| `/api/admin/activity` | GET | — | activity feed |
| `/api/admin/live-presence` | GET | — | globe presence |
| `/api/admin/pending` | GET | — | legacy pending read |

---

## Request/response schemas

**Status:** Informal — no OpenAPI. Client shapes in `src/utils/api.ts`; server validation ad hoc per handler.

**Recommended:** Generate from shared Zod schemas (`planned`).

---

## Error behavior (common patterns)

| Pattern | Example |
|---------|---------|
| 401 missing/invalid JWT | Most Bearer routes |
| 403 non-admin | `requireAdmin` |
| 400 unresolved quote | `create-product-payment-intent` |
| 429 rate limit | `build-a-wig-unit-image`, PSA usage |
| 503 missing env | `session-restore` missing `SESSION_COOKIE_SECRET` |

---

## Test status

**Automated API contract tests:** **none**.  
**Manual:** `docs/VERIFY_SYNC_PROFILE_API.md`, walkthrough docs.

See **`../testing/FULL_GENOME_TEST_MATRIX.md`** for required coverage.
