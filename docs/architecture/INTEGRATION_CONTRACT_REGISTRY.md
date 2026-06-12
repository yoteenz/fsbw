# Integration Contract Registry — Build-a-Wig

External and internal integration boundaries. **No secret values** — env names only.

---

## Supabase Auth

| Field | Detail |
|-------|--------|
| Files | `src/utils/supabase.ts`, `api/_lib/auth.ts` (`getAuthUser`) |
| Env | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client); `SUPABASE_URL`, `SUPABASE_ANON_KEY` (API) |
| Auth model | Email/password; JWT Bearer on API routes |
| Failure modes | Unconfirmed email blocked; session restore via cookie |
| Tests | `e2e/auth.*.setup.ts`; **missing** token expiry matrix |
| Launch risk | **P1** UI trusts localStorage when JWT missing |

---

## Supabase DB (Postgres)

| Field | Detail |
|-------|--------|
| Files | `api/_lib/supabase.ts`, migrations `supabase/migrations/` |
| Env | `SUPABASE_SERVICE_ROLE_KEY` for admin/webhook writes |
| Auth model | RLS per-user; service role bypasses |
| JSONB-heavy | `cart.items`, `orders.active_orders`, `profiles.*` mirrors |
| Failure modes | Missing migrations → API 500 / fallback localStorage |
| Tests | **none** automated RLS |
| Launch risk | **P1** orders client INSERT removed — verify webhook writes |

---

## Supabase Storage

| Field | Detail |
|-------|--------|
| Files | `api/profile-image.ts`, wig preview APIs, hairstyle templates |
| Env | `WIG_PREVIEW_STORAGE_BUCKET`, public URLs via `SITE_URL` |
| Buckets | `profile-images`, `live-preview` / `wig-preview` (**verify-first** on prod) |
| Failure modes | Missing object → preview fallback/static |
| Tests | **none** |
| Launch risk | **P2** cost + orphan objects |

---

## Vercel API (serverless)

| Field | Detail |
|-------|--------|
| Files | `api/**/*.ts` (91 routes) |
| Env | All `SUPABASE_*`, `STRIPE_*`, `FAL_KEY`, `OPENAI_API_KEY`, etc. |
| Auth model | Per-route (see `API_CONTRACT_REGISTRY.md`) |
| Failure modes | Cold start, `FUNCTION_INVOCATION_TIMEOUT` on Fal |
| Tests | **none** contract tests |
| Launch risk | **P1** API not in `tsc` build (19 errors) |

---

## Stripe

| Field | Detail |
|-------|--------|
| Files | `api/stripe/webhook.ts`, `create-checkout-session.ts`, `create-product-payment-intent.ts`, `_lib/stripeMembership.ts`, `_lib/recordProductOrderFromPaymentIntent.ts` |
| Env | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_*`, `VITE_STRIPE_PUBLISHABLE_KEY` |
| Flows | Membership Checkout Session; Product PaymentIntent; webhook `payment_intent.succeeded` |
| Failure modes | Unresolved quote → PI 400; webhook without service role → order not persisted |
| Tests | **none** webhook idempotency |
| Launch risk | **P0/P1** until all charge lines server-priced |

---

## Fal image generation

| Field | Detail |
|-------|--------|
| Files | `live-noir-color.ts`, `live-wig-after-color-styling.ts`, `live-try-on-studio-render.ts`, `build-a-wig-unit-image.ts`, `hairstyleAnalysisHairGenerate.ts`, batch scripts |
| Env | `FAL_KEY`, resolution overrides `WIG_PREVIEW_*` |
| Cost risk | **High** — regen per user; `forceRegenerate` on NOIR color |
| Rate limit | In-memory `rateLimit.ts` + route-specific caps (unit image); **not durable** |
| Tests | **none** |
| Launch risk | **P1** abuse / bill shock |

---

## OpenAI (PSA + analysis)

| Field | Detail |
|-------|--------|
| Files | `api/psa/chat.ts`, `api/psa/selfie-style-analysis.ts`, optional hairstyle Fal fallback |
| Env | `OPENAI_API_KEY`, `PSA_OPENAI_MODEL` |
| Auth | Premium Bearer + usage RPC |
| Cost risk | Medium — daily/monthly caps in `psaUsageLimit.ts` (DB-backed) |
| Tests | **none** |
| Launch risk | **P2** compared to Fal |

---

## Resend (email)

| Field | Detail |
|-------|--------|
| Files | `api/admin/newsletter-send.ts`, `api/brand/contact-submit.ts`, `_lib/contactNotifyEmail.ts` |
| Env | `RESEND_API_KEY`, `NEWSLETTER_FROM_EMAIL` |
| Failure modes | Silent skip if key missing |
| Tests | **none** |
| Launch risk | **P2** (admin-only paths) |

---

## Analytics ingestion

| Field | Detail |
|-------|--------|
| Files | `api/analytics/event.ts`, `src/utils/socialAnalytics.ts` |
| DB | `site_analytics_events` |
| Auth | Public POST (spam risk) |
| Tests | **none** |
| Launch risk | **P2** |

---

## Browser localStorage / cookies

| Field | Detail |
|-------|--------|
| Files | 100+ `src/**` readers/writers; `adminAuth.ts`, `authPasswordSanitize.ts` |
| Keys | `currentUser`, `cartItems`, `registeredUsers`, BAW `selected*`, per-user `userOrders_*` |
| Cookies | `baw_session_rt` (HttpOnly), `baw_auth_b` backup |
| Drift risk | **High** — primary commerce draft store |
| Tests | **none** migration tests |
| Launch risk | **P1** until server is source of truth |

---

## Playwright

| Field | Detail |
|-------|--------|
| Files | `e2e/*.spec.ts`, `playwright.config.ts` |
| Env | `.env.e2e.local` for auth setup |
| Coverage | 24 tests — smoke only |
| Launch risk | **P1** gap vs 251 routes |

---

## Environment variables (master list)

See `.env.example` (lines 1–110+). Critical groups:

| Group | Vars |
|-------|------|
| Supabase | `VITE_SUPABASE_*`, `SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` |
| API base | `VITE_API_BASE`, `VITE_DEV_PROXY_TARGET` |
| Session | `SESSION_COOKIE_SECRET` |
| Admin | `VITE_ADMIN_EMAILS`, `ADMIN_EMAILS` |
| Stripe | `STRIPE_*`, `VITE_STRIPE_PUBLISHABLE_KEY`, `SITE_URL` |
| Fal / previews | `FAL_KEY`, `WIG_PREVIEW_*` |
| OpenAI PSA | `OPENAI_API_KEY`, `PSA_OPENAI_MODEL` |
| Email | `RESEND_API_KEY`, `NEWSLETTER_FROM_EMAIL` |
| Cron | `BOOKING_AUTOPAY_CRON_SECRET` |

**Wig preview local:** `.env.wig-preview` — **gitignored**; example `.env.wig-preview.example.txt`.

---

## Public asset pipeline

| Field | Detail |
|-------|--------|
| Path | `public/assets/` (~1.2G) |
| Build | Vite static copy; no CDN pipeline in repo |
| Scripts | `npm run wig-preview:*` batch uploads to Supabase |
| Risk | Clone/deploy size; **P2** |

---

## Deployment runtime assumptions

| Assumption | Evidence |
|------------|----------|
| Vercel Node serverless for `api/` | file-based routing |
| Same-origin or `VITE_API_BASE` proxy | `.env.example` |
| Mobile Safari session restore | `session-restore.ts`, `session-cookie.ts` |
| Branches `master` + `preview/mobile` | `CORE.md:86` |
