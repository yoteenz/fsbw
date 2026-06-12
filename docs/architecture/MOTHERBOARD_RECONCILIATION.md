# Motherboard Reconciliation — Build-a-Wig

Compares **motherboard claims** to **current repo evidence** at commit `2ea7bd9e`.  
Evidence classes: see `PRODUCT_GENOME_INDEX.md`.

---

## Stack claims

| Claim | Motherboard source | Code / runtime evidence | Status | Action |
|-------|-------------------|-------------------------|--------|--------|
| React 19, Vite 5, TS, RR6, Tailwind | `CORE.md:9` | `package.json` dependencies | **current** | — |
| Supabase Auth + profiles + JSONB cart/orders | `CORE.md:10` | `supabase/migrations/20260325120000_full_app_sync.sql` | **current** | — |
| Vercel serverless `api/` | `CORE.md:10` | 91 route files under `api/` | **current** | Update `CODEBASE.md` count |
| Stripe membership optional | `CORE.md:11` | `api/stripe/create-checkout-session.ts` | **current** | — |
| Fal golden models (GPT2, NBP, Ideogram) | `CORE.md:13` | `motherboard/golden-models/`; API routes | **current** | — |
| OpenAI PSA | `CORE.md` (via `.env.example`) | `api/psa/chat.ts` | **current** | — |

---

## Mobile-only build target

| Claim | Source | Evidence | Status | Action |
|-------|--------|----------|--------|--------|
| MOBILE-ONLY implementation/QA | `CORE.md:30-36` | Playwright mobile projects; no desktop layout phase | **current** | All new E2E use mobile viewport |
| Desktop testing secondary | `CORE.md:33-35` | `e2e/guest.spec.ts` uses mobile | **current** | — |

---

## Auth rules

| Claim | Source | Evidence | Status | Action |
|-------|--------|----------|--------|--------|
| Supabase email/password only | `CORE.md:42` | `src/pages/sign-in/page.tsx` Supabase path | **current** | — |
| Email must be confirmed | `CORE.md:42` | `isSupabaseUserEmailConfirmed` in sign-in | **current** | — |
| Passwords never stored in localStorage | `CORE.md:42` (updated 2026-06-12) | `authPasswordSanitize.ts`; sign-in no writes | **current** | Verify legacy backups cleared on devices |
| ~~Admin local sign-in fallback~~ | ~~older MEMORY~~ | Removed in `2ea7bd9e` | **stale** | CORE already updated |
| AccountRouteGuard trusts localStorage | implied in flows | `AccountRouteGuard.tsx:31-34` comment | **partial** | Server APIs still use Bearer |
| Commerce guest bag/checkout | `CORE.md:45` | `CommerceRouteGuard.tsx:17-22` | **current** | — |
| Sync via Bearer, no password | `CORE.md:67` | `syncProfileWithToken` in `api.ts:194`; password helper removed | **current** | Update stale docs (`PROFILES_COLUMNS...`) |
| ~~Sync my account with password~~ | `CORE.md:47` old bullet | Settings has no sync button; `syncProfileWithPassword` removed | **stale** | Update `docs/PROFILES_COLUMNS_AND_APP_MAPPING.md` |

---

## Build-a-Wig flow

| Claim | Source | Evidence | Status | Action |
|-------|--------|----------|--------|--------|
| Signed-in gate for BAW entry | `CORE.md:43` | `BuildAWigFeatureSignInModal` | **current** | — |
| 146 BAW routes (6 units × edit/customize steps) | `CORE.md` NOIR section | `App.tsx:597-732` | **current** | Consider generated routes |
| NOIR live WebP only on step routes | `CORE.md:87` | `bawNoirLivePreviewStorage.ts` | **code-backed** | verify-first per-route QA |
| Premium gate on BAW options | `CORE.md:58` | `buildWigPremiumOptions.ts`; hooks | **current** | — |
| Pricing in hub page | implied | `build-a-wig/page.tsx:421+` `calculatePricesFromSelections` | **current** | Move to shared catalog (planned) |

---

## Checkout / payment

| Claim | Source | Evidence | Status | Action |
|-------|--------|----------|--------|--------|
| Partial server quote | `CORE.md:80` | `resolveQuote.ts:207-209`; `CHECKOUT_SERVER_QUOTE.md` | **current** | Finish BAW/BCF server pricing |
| PaymentIntent from server quote | `CORE.md:80` | `create-product-payment-intent.ts` | **current** | Wire UI confirm to Stripe.js |
| Membership via Stripe Checkout | `CORE.md:54` | `create-checkout-session.ts` | **current** | — |
| Bookings/gift-card skip product PI | `CORE.md:63-64` | `productCheckoutPolicy.ts` | **code-backed** | Document in checkout tests |
| Legacy local order paths | MEMORY / audit | `checkout/page.tsx` still client totals | **legacy** | Migrate to webhook-only writes |

---

## Supabase sync

| Claim | Source | Evidence | Status | Action |
|-------|--------|----------|--------|--------|
| Run `full_app_sync.sql` for setup | `CORE.md:10` | migration file exists | **current** | — |
| Cart version column | MEMORY | `20260415120000_cart_version.sql` | **current** | — |
| Orders JWT cannot INSERT/UPDATE | — | `20260604120000_security_profiles_orders_guard.sql` | **current** | Test RLS |
| Pending admin queues migrations | `CORE.md:66` | `20260413120000_pending_admin_queues.sql` | **current** | verify-first if applied on prod DB |

---

## AI / Fal preview rules

| Claim | Source | Evidence | Status | Action |
|-------|--------|----------|--------|--------|
| GPT2 for NOIR color + styling | `golden-models/gpt-image-2.md` | `live-noir-color.ts`, `live-wig-after-color-styling.ts` | **current** | — |
| `forceRegenerate` for signed-in users | `CORE.md:87` | `live-noir-color.ts` header comment | **current** | Add durable rate limits |
| Founder-only regen UI on most steps | `CORE.md:87` | `isFounderNoirFalRegenUiVisible()` | **code-backed** | — |
| Hairstyle analysis composite default | MEMORY 2026-06-12 | `HAIRSTYLE_ANALYSIS_RENDER_MODE=composite` | **current** | — |

---

## PSA assistant

| Claim | Source | Evidence | Status | Action |
|-------|--------|----------|--------|--------|
| Premium gate client + server | `CORE.md:15` | `premiumMemberAccess.ts`; `psaPremiumCheck.ts` | **current** | — |
| Founder voice in `psaInstructions.ts` | `golden-prompts/psa-founder-voice.md` | `api/_lib/psaInstructions.ts` | **current** | — |
| PSA threads in Supabase | — | `20260606120000_psa_chat_threads.sql` | **current** | — |
| Kateena bypass if profile stale | `CORE.md:15` | `psaPremiumCheck.ts` | **verify-first** | Confirm still intended |

---

## Admin / founder behavior

| Claim | Source | Evidence | Status | Action |
|-------|--------|----------|--------|--------|
| Admin emails env + defaults | `CORE.md:46` | `adminAuth.ts:336-355` | **current** | — |
| Founder Gmail privileges | `CORE.md:47` | `FOUNDER_PRIVILEGED_ADMIN_EMAIL` | **current** | — |
| Demo consult orders 331/340/341 | `CORE.md:47` | `orders/page.tsx` merge helpers | **current** | — |
| Admin marketing at `/admin/marketing` | `CORE.md:55` | `App.tsx` route | **current** | — |
| Pending queue server-backed | `CORE.md:66` | `api/admin/pending-queue.ts` | **partial** | Falls back to localStorage without migration |

---

## Branch / deploy assumptions

| Claim | Source | Evidence | Status | Action |
|-------|--------|----------|--------|--------|
| Work on `master` + `preview/mobile` only | `CORE.md:86` | git branches; AGENTS.md | **current** | Ignore cloud `cursor/*` instructions |
| Push both remotes after work | `CORE.md:86` | git policy rules | **current** | — |
| Vercel env for API secrets | `.env.example` | documented vars | **deploy-verified** | Audit Vercel dashboard manually |

---

## CODEBASE.md snapshot accuracy

| Claim in CODEBASE.md | Actual (2026-06-12) | Status |
|----------------------|----------------------|--------|
| ~68 `.tsx` under `src/` | **200+** page/component files | **stale** |
| ~29 API files | **91** route handlers | **stale** |
| Missing PSA, hairstyle, live-try-on, pending-queue APIs | Present in `api/` | **stale** |
| Last snapshot note | "initial snapshot" | **stale** |

**Action:** Run **"Snapshot codebase to motherboard"** or treat this genome as interim CODEBASE replacement.

---

## MEMORY.md vs current code

| MEMORY topic | Still accurate? | Notes |
|--------------|-----------------|-------|
| P0 security 2026-06-12 | Yes | `.env.wig-preview` untracked; password sanitize |
| Hairstyle composite pipeline | Yes | `hairstyleAnalysisBuiltTemplate.ts` |
| DRM deferred for lounge TV | Yes | `planned` — no EME in repo |
| Older local-only auth entries | No | superseded by `2ea7bd9e` |

**Convention:** Treat **CORE + latest MEMORY + this genome** as operational truth; older MEMORY is timeline only.
