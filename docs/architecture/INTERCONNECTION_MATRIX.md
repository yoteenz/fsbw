# Interconnection Matrix — Build-a-Wig / Frontal Slayer

**Purpose:** Tabular map of how domains, routes, APIs, data stores, and integrations connect.  
**Baseline:** genome audit at commit `eaa4c228`; evidence classes match `PRODUCT_GENOME_INDEX.md`.  
**Companion docs:** topology (`APP_TOPOLOGY_MAP.md`), state (`STATE_AND_PERSISTENCE_OWNERSHIP_MAP.md`), products (`PRODUCT_AND_PRICING_GENOME.md`).

**Legend for relationship cells**

| Symbol | Meaning |
|--------|---------|
| **R** | reads |
| **W** | writes |
| **C** | calls (HTTP/RPC) |
| **S** | syncs (bidirectional or push/pull) |
| **G** | gates access (guard or server check) |
| **—** | no direct link |
| **legacy** | present but superseded |
| **partial** | incomplete or client-trusted path |

---

## 1. Master node catalog

Every major node in the system and its primary home.

| Node ID | Name | Type | Primary location | Evidence |
|---------|------|------|------------------|----------|
| N01 | App shell | UI | `src/App.tsx`, `src/main.tsx` | 251 routes |
| N02 | Route guards | UI | `AdminGuard`, `AccountRouteGuard`, `CommerceRouteGuard` | `src/components/` |
| N03 | Page modules | UI | `src/pages/**` (~90 `page.tsx`) | `APP_TOPOLOGY_MAP.md` |
| N04 | Shared components | UI | `src/components/**` | cart, PSA, admin panels |
| N05 | Client utils | logic | `src/utils/**` (~150 files) | `api.ts`, `syncFromApi.ts` |
| N06 | API client | transport | `src/utils/api.ts` | fetch wrapper |
| N07 | Supabase browser client | auth/transport | `src/utils/supabase.ts` | JWT session |
| N08 | localStorage / cookies | persistence | browser | `STATE_AND_PERSISTENCE_OWNERSHIP_MAP.md` |
| N09 | Vercel API | server | `api/**/*.ts` (91 routes) | `API_CONTRACT_REGISTRY.md` |
| N10 | Supabase Postgres | DB | `supabase/migrations/` | 20+ tables |
| N11 | Supabase Storage | object store | buckets (not in migrations) | `profile-images`, `live-preview` |
| N12 | Stripe | payments | Checkout + PI + webhook | `api/stripe/` |
| N13 | Fal | AI images | wig preview, try-on, hairstyle hair | `api/wig-preview/`, etc. |
| N14 | OpenAI | AI chat/vision | PSA, selfie analysis | `api/psa/` |
| N15 | Resend | email | newsletter, brand contact | `api/admin/`, `api/brand/` |
| N16 | Playwright | test runner | `e2e/` | 24 tests listed |
| N17 | Motherboard | docs/memory | `motherboard/` | `CORE.md`, `MEMORY.md` |
| N18 | Public assets | static CDN | `public/assets/` (~1.2G) | runtime `du` |
| N19 | Pricing engine (server) | logic | `api/_lib/pricing/resolveQuote.ts` | partial authority |
| N20 | Pricing engine (client) | logic | hub, PDP, `bcfProductOptions.ts` | duplicated |

---

## 2. Layer stack (vertical interconnection)

How data flows through layers top to bottom.

| Layer | Connected to (below) | Connected to (above) | Sync / trigger |
|-------|----------------------|----------------------|----------------|
| **User (mobile browser)** | N01 App shell | — | viewport, gestures |
| **App shell N01** | N02 guards, N03 pages, N04 components | user | route change |
| **Guards N02** | N08 localStorage, N07 Supabase session | N01 | `AccountRouteGuard` → `syncAllFromApi` |
| **Pages N03** | N05 utils, N06 API client, N08 | N01, N04 | add-to-bag, checkout submit |
| **Utils N05** | N06, N07, N08 | N03, N04 | `syncFromApi`, `checkoutQuote` |
| **API client N06** | N09 Vercel API | N05, N03 | Bearer JWT |
| **Supabase client N07** | N10 Auth (hosted), N11 Storage (signed) | N05, N03 | session refresh |
| **Browser storage N08** | — (leaf) | N03, N05, N02 | sign-in, cart, BAW |
| **Vercel API N09** | N10, N11, N12–N15 | N06 | per-route auth |
| **Postgres N10** | — | N09 | RLS + service role |
| **Storage N11** | — | N09, N07 | public URLs |
| **Stripe N12** | — | N09 webhook + PI | `payment_intent.succeeded` |
| **Fal / OpenAI N13–N14** | — | N09 | billed per call |

---

## 3. Domain cross-walk matrix

**Row → Column:** what the row domain does to the column domain.

| Domain ↓ / → | Auth | Profile | Cart | Wishlist | Orders | BAW state | Pricing | Checkout | Admin | AI preview | PSA | Analytics |
|--------------|------|---------|------|----------|--------|-----------|---------|----------|-------|------------|-----|-----------|
| **Auth** | S JWT + flags | W profile link | — | — | — | G BAW sign-in | — | G checkout | G admin | G signed-in | G premium | — |
| **Profile** | R user id | S `profiles` + LS | R addresses | — | R history | — | — | W ship addr | R CRM | — | R context | — |
| **Cart** | R email key | — | S LS + `cart` table | R move-to-list | — | W from BAW | **partial** client | W lines | — | — | — | — |
| **Wishlist** | R email key | — | W to cart | S LS + `wishlist` | — | — | R display (**bug** BEACH) | — | — | — | — | — |
| **Orders** | R email | R | — | — | S LS + `orders` JSONB | — | R paid amt | W confirm | R admin | — | — | — |
| **BAW state** | G | — | W line + selections | — | — | W LS only | W hub calc | W custom lines | R founder demos | C Fal APIs | — | — |
| **Pricing (client)** | — | — | W line price | W display | — | R BAW opts | **duplicated** | W pre-quote | — | — | R PSA catalog | — |
| **Pricing (server)** | — | — | R identities | — | W webhook | R metadata | **partial** `resolveQuote` | W quote + PI | — | — | C PSA tools | — |
| **Checkout** | G | R | R | — | W | R BAW lines | C `/checkout/quote` | W flow state | — | — | — | — |
| **Stripe** | — | W membership tier | — | — | W via webhook | — | **G** `fullyResolved` | C PI / Session | — | — | — | — |
| **Admin** | G founder/admin | W sync-profile | R | R | R/W | R previews | — | R revenue | S CRM | C batch tools | C config | R analytics |
| **AI preview** | G | R avatar | — | — | — | R BAW selections | — | — | R admin regen | W Storage | — | — |
| **PSA** | G premium | R | C add-to-cart tool | — | — | — | C quote tool | — | — | S threads | — |
| **Analytics** | — | — | — | — | — | — | — | — | R | — | — | W `site_analytics_events` |

---

## 4. Commerce interconnection chain

End-to-end path from catalog to money to fulfillment record.

| Step | Actor | Input | Output | Next step | Server authority | Evidence |
|------|-------|-------|--------|-----------|------------------|----------|
| 1 Browse | PDP / BAW / BCF page | unit SKU or config | UI selection | add-to-bag | **no** (display prices client) | PDP `page.tsx` |
| 2 Price calc | hub / `bcfProductOptions` | selections | USD line price | cart write | **partial** (units base only on server) | `resolveQuote.ts:78-96` |
| 3 Cart persist | `cartWishlistStorage` | line object | `localStorage.cartItems` | sync on sign-in | **split** | `syncCartFromApi` |
| 4 Cloud cart | `PUT /api/cart` | items JSONB | `cart` row | optimistic `version` | **yes** (storage not price) | `api/cart.ts` |
| 5 Bag UI | `shopping-bag/page.tsx` | cart | edited qty | checkout nav | client qty | — |
| 6 Quote | `POST /api/checkout/quote` | line **identities** | `fullyResolved`, `totalCents` | PI or block | **yes** when resolved | `checkout/quote.ts:82` |
| 7 Payment | `POST /api/stripe/create-product-payment-intent` | quote lines | `clientSecret` | Stripe.js | **G** rejects unresolved | `create-product-payment-intent.ts:107` |
| 8 Webhook | `POST /api/stripe/webhook` | `payment_intent.succeeded` | order append | profile notify | **yes** (service role) | `recordProductOrderFromPaymentIntent.ts` |
| 9 Orders read | `GET /api/orders` + LS | email | order list | account UI | **should be** server post-pay | `syncOrdersFromApi` |

### Product type → checkout rail

| Product type | Cart `kind` / identity | Quote server | Stripe rail | Order persistence |
|--------------|------------------------|--------------|-------------|-------------------|
| Simple unit PDP | `product` + unit id | **partial** base | PI if resolved | webhook JSONB |
| Build-a-Wig custom | `build-a-wig` + selections JSON | **no** (`resolved: false`) | **blocked** | — |
| BCF bundle/closure/frontal | `bcf-*` + options | **no** | **blocked** | — |
| Booking install | `booking` | **yes** | **skips PI** (`productCheckoutPolicy`) | meeting + quote |
| Consult deposit | `consult` | **yes** | **skips PI** | `consult_quotes` |
| Membership | — (not cart) | N/A | Checkout Session | `membership_payments` + profile tier |
| Gift card | `gift-card` | **no** | **skips PI** | profile balance |
| Hairstyle analysis | purchase grant / consult tier | **yes** | consult path or grant | `hairstyle_analysis_*` |

---

## 5. Product ↔ pricing ↔ module interconnection

| Sellable | Routes (entry) | Price owner (client) | Price owner (server) | Cart builder | Quote input | Stripe eligible |
|----------|----------------|----------------------|----------------------|--------------|-------------|-----------------|
| NOIR | `/straight/noir`, BAW noir | hub, PDP, `CartDropdown` | `resolveQuote.ts:78` $740 | PDP or BAW | unit id + cap | **partial** |
| BLANCO | `/straight/blanco` | same pattern | `:80` $820 | same | same | **partial** |
| SOFT WAVE | `/wavy/soft-wave` | same | `:81` $760 | same | same | **partial** |
| BEACH WAVE | `/wavy/beach-wave` | wishlist **$780 bug** | `:83` $760 | same | same | **partial** |
| SOFT CURL | `/curly/soft-curl` | same | `:81` $780 | same | same | **partial** |
| OCEAN CURL | `/curly/ocean-curl` | same | `:82` $782 | same | same | **partial** |
| BAW options | `/build-a-wig/{unit}/*` | `page.tsx` + 8 steps | **none** | BAW hub | selections blob | **no** |
| BCF | `/shop/bundles` etc. | `bcfProductOptions.ts` | **none** | texture PDP | bcf options | **no** |
| NEW INSTALL | `/booking/appointment` | booking page | `resolveQuote.ts:46-48` | booking flow | booking line | **no PI** |
| Consult | `/booking/consultation` | consult page | `:61-71` | consult flow | consult line | **no PI** |
| Membership | `/account/rewards` | `subscriptionPricing.ts` | `stripeMembership.ts` | — | — | Checkout Session |
| Gift card | `/tools/gift-card` | `GiftCardBalancePicker` | **none** | gift flow | — | **no PI** |
| Hairstyle analysis | `/tools/hairstyle-analysis` | `hairstyleAnalysisPricing.ts` | same tiers API | — | tier sku | consult/grant |

**Duplication edges (same price, multiple owners):**

| Price fact | Connected modules (all must stay in sync) |
|------------|---------------------------------------------|
| Six unit bases | `resolveQuote.ts`, `build-a-wig/page.tsx`, `CartDropdown.tsx`, `wishlistListItemDetails.ts`, PDPs, `psaCatalogPricing.ts` |
| BAW option tables | hub + `color|length|density|lace|texture|hairline|cap|styling|addons` pages |
| Consult / hairstyle tiers | `resolveQuote.ts`, `consultStyleAnalysisAddon.ts`, `hairstyleAnalysisPricing.ts` |
| Membership USD | `subscriptionPricing.ts`, `stripeMembership.ts`, Stripe Dashboard Price IDs |

---

## 6. Auth & session interconnection

| Component | Reads | Writes | Calls | Gates | Drift risk |
|-----------|-------|--------|-------|-------|------------|
| `sign-in/page.tsx` | form | `isSignedIn`, `currentUser` (no password) | Supabase auth, `syncAllFromApi` | — | low post-P0 |
| `main.tsx` | — | sanitize passwords | `syncAllFromApi` if session | — | — |
| `supabase.ts` | cookies `sb-*` | session refresh | Supabase Auth | — | — |
| `adminAuth.ts` | `currentUser`, env admin list | auth backup cookie | — | admin/founder UI | medium |
| `session-restore.ts` (API) | HttpOnly `baw_session_rt` | Set-Cookie | Supabase refresh | Safari restore | **P0** origin |
| `AccountRouteGuard` | LS `isSignedIn` **or** session | — | `syncAllFromApi` | `/account/*` | **P1** LS trust |
| `AdminGuard` | `adminAuth` | — | — | `/admin/*` | client-only gate |
| `api/_lib/auth.ts` | Bearer JWT | — | Supabase `getUser` | API routes | server truth |
| `requireAdmin` (API) | JWT + profile role | — | — | admin APIs | server truth |

**Session restore path**

```
Safari/no third-party cookie
  → POST /api/session-restore (cookie baw_session_rt)
  → Supabase refresh
  → client sets session
  → syncAllFromApi → profiles + cart + orders + wishlist
```

---

## 7. Build-a-Wig subgraph

| BAW node | Connected to | Relationship | Storage key / API |
|----------|--------------|--------------|-------------------|
| Hub `build-a-wig/page.tsx` | 8 step pages | parent/nav | `selected*`, prices |
| Step pages | Hub | W selection | `customizeSelected*` per step |
| Hub | `cartWishlistStorage` | W cart line | `build-a-wig` kind + `selections` |
| Hub | `bawNoirLivePreviewStorage` | S preview flags | pending regen keys |
| NOIR color step | `POST /api/wig-preview/live-noir-color` | C Fal | → Storage WebP |
| NOIR styling step | `POST /api/live-wig-after-color-styling` | C Fal | styling refs |
| All units | `public/assets` mannequins | R images | static |
| Edit flow | Hub | R/W | `editingCartItem` |
| Cart | Checkout | W unresolved line | `resolveQuote` **fails** |
| Admin | `resolveAdminNoirHubLiveWigViewsFromStorage` | R Storage | founder preview tools |

**Unit × step matrix (route interconnection):** 6 units × (hub + customize + 9 steps + edit variants) ≈ **146 routes** — all declared in `App.tsx` (`code-backed`).

---

## 8. AI image pipeline interconnection

| Trigger UI | API route | External | Storage write | Reads from | Cost control |
|------------|-----------|----------|---------------|------------|--------------|
| BAW NOIR color | `wig-preview/live-noir-color` | Fal GPT Image 2 | `live-preview/wig-preview-live/...` | mannequin PNG, color hex | in-memory rate limit |
| BAW styling | `live-wig-after-color-styling` | Fal | same tree | after-color WebP, BAW refs | in-memory |
| Live try-on studio | `live-try-on-studio-render` | Fal NBP/Ideogram | try-on output paths | user selfie, unit ref | route caps |
| BAW marketing still | `build-a-wig-unit-image` | Fal | generated unit image | golden prompts | per-route limit |
| Hairstyle analysis | `hairstyle-analysis-generate` | Fal hair + sharp composite | card output URL | blueprint, client photo, templates | `hairstyle_analysis_usage` |
| PSA selfie | `psa/selfie-style-analysis` | OpenAI | — | user upload | `psa_message_usage` |
| Admin batch | `api/admin/*` + scripts | Fal | Storage | golden-models README paths | manual |

**Golden assets interconnection**

| Asset set | Used by | Location |
|-----------|---------|----------|
| Golden models | Fal endpoints, prompt builders | `motherboard/golden-models/` |
| Golden prompts | `api/_lib/*Prompt.ts` modules | `motherboard/golden-prompts/` |
| Code-built hairstyle templates | composite renderer | `hairstyleAnalysisBuiltTemplate.ts` |
| Legacy Supabase PNGs | Fal full-edit fallback | Storage `IMG_*` (**legacy**) |

---

## 9. PSA assistant interconnection

| Layer | Node | Connects to |
|-------|------|-------------|
| UI | `src/components/psa/*` | premium gate, chat threads |
| Config | `GET /api/psa-chat-config` | public feature flags |
| Chat | `POST /api/psa/chat` | OpenAI Responses API |
| Tools | `api/_lib/psaTools.ts` | cart, quote, catalog, meetings |
| Usage | `psa_message_usage` RPC | limits per member |
| Persistence | `psa_threads`, `psa_messages` | thread history |
| Context | `psa_member_context` | profile + preferences |
| Events | `psa_tool_events` | analytics / debugging |
| Pricing tool | `resolveCheckoutQuoteLines` | same engine as checkout |
| Premium | `premiumMemberAccess.ts` | `/account/rewards` tier |

---

## 10. Admin / founder interconnection

| Admin surface | Data sources | APIs (sample) | Customer domain affected |
|---------------|--------------|---------------|--------------------------|
| Dashboard | analytics, orders | `GET /api/admin/analytics` | — |
| Clients CRM | `profiles`, meetings | `admin/clients`, `sync-profile` | profile, tier |
| Revenue | Stripe + orders JSONB | `admin/revenue` | — |
| Marketing | `app_config` | `admin/newsletter-send` (Resend) | subscribers |
| Backend health | env probes | `admin/backend-status` | — |
| Wig preview tools | Storage + Fal | `admin/wig-preview-*` | BAW assets |
| Hairstyle tool | composite + Fal | `hairstyle-analysis-generate` | sellable tier |
| Meetings | `meetings`, consult | `admin/meetings` | bookings |
| Founder-only | Gmail allowlist | `adminAuth` + server checks | demo orders, overrides |

**Guard chain:** UI `AdminGuard` (client) → individual API `requireAdmin` / service role (server). **Gap:** UI gate alone is not sufficient for security (`verify-first` on every admin route).

---

## 11. Supabase table interconnection

| Table | Written by | Read by | JSONB / key columns | Connected tables |
|-------|------------|---------|---------------------|------------------|
| `profiles` | profile API, webhook, admin sync | all account, checkout, PSA | addresses, vouchers, tier, mirrors | auth.users |
| `cart` | `PUT /api/cart` | sync, quote (indirect) | `items`, `version` | profiles |
| `wishlist` | `PUT /api/wishlist` | wishlist UI | `items` | profiles |
| `orders` | webhook, admin | orders UI, concierge | `active_orders`, `past_orders` | profiles |
| `notifications` | API | account notifications | payload | profiles |
| `meetings` | booking, admin | consult flow | — | profiles |
| `consult_quotes` | consult checkout | admin | — | profiles |
| `membership_payments` | Stripe webhook | admin revenue | — | profiles |
| `membership_payment_failures` | webhook | admin | — | — |
| `app_config` | admin | special offers, lounge TV | marketing JSON | — |
| `site_analytics_events` | `POST /api/analytics/event` | admin analytics | `meta` | — |
| `psa_threads` | PSA chat | PSA UI | — | profiles |
| `psa_messages` | PSA chat | PSA UI | — | psa_threads |
| `psa_member_context` | PSA | PSA tools | — | profiles |
| `psa_message_usage` | PSA RPC | limits | — | profiles |
| `psa_tool_events` | PSA tools | debugging | — | — |
| `hairstyle_analysis_usage` | generate API | limits | — | profiles |
| `hairstyle_analysis_purchase_grants` | purchase | credits | — | profiles |
| `pending_order_forms` | order form submit | admin queue | — | — |
| `pending_affiliate_submissions` | affiliate | admin queue | — | — |
| `pending_review_supplemental` | reviews | admin queue | — | — |
| `brand_contact_inquiries` | brand contact API | admin | — | — |
| `user_activity` | activity API | admin | — | profiles |
| `priority_messages` | admin | concierge | — | — |

**FK pattern:** most user-owned tables reference `profiles.id` or `auth.users` (`db-backed` migrations).

---

## 12. API route cluster interconnection

| API cluster | Upstream (called from) | Downstream (calls) | Auth | Tables / services |
|-------------|------------------------|--------------------|------|-------------------|
| `/api/profile` | sync, settings | Supabase | Bearer | `profiles` |
| `/api/cart`, `/api/wishlist` | sync, bag | Supabase | Bearer | `cart`, `wishlist` |
| `/api/orders` | sync, orders page | Supabase | Bearer | `orders` |
| `/api/checkout/quote` | checkout, PSA tools | `resolveQuote` | optional Bearer | — |
| `/api/stripe/*` | checkout, rewards | Stripe SDK | mixed | `orders`, `profiles`, `membership_*` |
| `/api/session-restore` | `main.tsx`, supabase bootstrap | Supabase refresh | cookie | — |
| `/api/wig-preview/*` | BAW NOIR pages | Fal, Storage | Bearer | Storage |
| `/api/live-*` | try-on, styling | Fal | Bearer | Storage |
| `/api/hairstyle-analysis-*` | tools, admin | Fal, sharp, Storage | Bearer / admin | usage tables |
| `/api/psa/*` | PSA widget | OpenAI, tools | Bearer premium | psa_* tables |
| `/api/admin/*` | admin pages | service role, Stripe, Resend | admin JWT | most tables |
| `/api/analytics/event` | social clicks | Supabase insert | public | `site_analytics_events` |
| `/api/brand/*` | brand page | Resend | public | `brand_contact_inquiries` |

Full per-route detail: **`API_CONTRACT_REGISTRY.md`**.

---

## 13. Sync & event trigger table

| Event | Trigger location | Actions chained | Stores touched |
|-------|------------------|-----------------|----------------|
| App boot | `main.tsx` | password sanitize → session restore → `syncAllFromApi` | LS, profiles, cart, orders, wishlist |
| Sign-in success | `sign-in/page.tsx` | `syncAllFromApi` | same |
| Account route enter | `AccountRouteGuard` | `syncAllFromApi` if session | same |
| Membership return | `MembershipRouteSync` | `syncAllFromApi` | profile tier |
| Cart edit | bag, PDP, BAW | write LS → debounced `PUT /api/cart` (if signed in) | LS + `cart` |
| Checkout submit | `checkout/page.tsx` | quote → PI → Stripe.js → webhook order | orders, profiles |
| Payment success | Stripe webhook | `recordProductOrderFromPaymentIntent` | `orders` JSONB |
| Membership paid | Stripe webhook | tier update on profile | `profiles`, `membership_payments` |
| Admin profile sync | admin clients | `admin/sync-profile` | `profiles` + LS merge |
| Sign-out | account | clear LS flags, Supabase signOut | LS, cookies |

---

## 14. Route cluster → dependency table (condensed)

| Route cluster | Pages | Guards | APIs | LS keys | External |
|---------------|-------|--------|------|---------|----------|
| Landing `/`, `/lobby` | 2 | — | lounge-tv-config | tier, lounge | — |
| Shop `/home/shop`, PDPs | 15+ | — | — | cart | assets |
| BAW `/build-a-wig/**` | 146 | in-page sign-in | live-noir, styling | `selected*`, preview | Fal, Storage |
| Bag `/bag` | 1 | — | cart PUT | cartItems | — |
| Checkout `/checkout/*` | 4 | Commerce partial | quote, stripe | vouchers, address | Stripe |
| Account `/account/**` | 14 | Account | profile, orders, notifications | currentUser | Supabase |
| Wishlist `/wishlist/**` | 4 | Account | wishlist | wishlistItems | — |
| Booking `/booking/**` | 2 | — | meetings, quote | — | — |
| Tools `/tools/**` | 3 | mixed | hairstyle, gift | — | Fal |
| Admin `/admin/**` | 30 | Admin | 40+ admin routes | admin flags | all integrations |
| Brand `/brand` | 1 | — | brand contact | — | Resend |

Full per-route rows: **`ROUTE_SURFACE_CATALOG.md`**.

---

## 15. Test ↔ system interconnection

| System area | E2E file | Covered routes | Missing connection tests |
|-------------|----------|----------------|--------------------------|
| Guest smoke | `guest.spec.ts` | shop, noir PDP, bag, BAW hub | BCF, gift, checkout PI |
| Standard user | `standard-user.spec.ts` | account subset, bag | settings, sync drift |
| Premium user | `premium-user.spec.ts` | rewards, lobby | PSA, live try-on, Fal |
| Auth setup | `auth.*.setup.ts` | — | session-restore cookie path |
| Pricing | **none** | — | quote vs client mismatch |
| Webhook | **none** | — | order persistence |
| Admin | **none** | — | all 30 routes |
| RLS | **none** | — | cross-user isolation |

Test plan rows: **`FULL_GENOME_TEST_MATRIX.md`**.

---

## 16. Documentation interconnection

| Doc | Feeds | Fed by |
|-----|-------|--------|
| `motherboard/CORE.md` | design truth (may be stale) | team decisions |
| `motherboard/CODEBASE.md` | structure (stale vs 91 APIs) | snapshots |
| `motherboard/MEMORY.md` | chat decisions | auto-add |
| `docs/architecture/*` | genome evidence | code audit |
| `docs/testing/*` | release gates | genome risks |
| `docs/SECURITY_SECRETS_ROTATION.md` | ops runbook | P0 remediation |
| `docs/CHECKOUT_SERVER_QUOTE.md` | checkout policy | partial impl |

**Reconciliation entry point:** `MOTHERBOARD_RECONCILIATION.md`.

---

## 17. Environment variable interconnection

| Env var | Connected integration | Required by (files) |
|---------|----------------------|---------------------|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase Auth (client) | `supabase.ts` |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | DB + admin writes | `api/_lib/supabase.ts` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe.js | checkout pages |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe server | `api/stripe/*` |
| `STRIPE_PRICE_ID_*` | membership SKUs | `stripeMembership.ts` |
| `FAL_KEY` | all Fal routes | wig-preview, hairstyle, try-on |
| `OPENAI_API_KEY` | PSA + analysis | `api/psa/chat.ts` |
| `RESEND_API_KEY` | email | newsletter, brand |
| `SESSION_COOKIE_SECRET` | session restore | `session-restore.ts` |
| `SITE_URL` | redirects, public Storage URLs | Stripe, Fal refs |
| `WIG_PREVIEW_*` | bucket, resolution, render mode | preview APIs |

Full list: **`INTEGRATION_CONTRACT_REGISTRY.md`**, `.env.example`.

---

## 18. Risk interconnection (what connects to launch blockers)

| Risk ID | Interconnected nodes | Blast radius if unfixed |
|---------|---------------------|-------------------------|
| P0-3 secrets history | Fal, Supabase, all APIs | full infra compromise |
| P0 checkout unresolved | BAW, BCF, cart, Stripe PI | cannot charge custom wigs |
| P0 session-restore | auth, sync, Safari users | session hijack / token leak |
| P1 AccountRouteGuard | account, orders, admin UI | unauthorized account views |
| P1 pricing drift | cart, wishlist, quote, PSA | wrong charges / display |
| P1 API no typecheck | all 91 routes | silent deploy breakage |
| P1 Fal rate limits | BAW, try-on, hairstyle | cost runaway |
| P2 JSONB orders | webhook, admin, concierge | reporting fragility |
| P2 251 routes | App.tsx, tests | untested surface |

---

## 19. Recommended canonical wiring (target interconnection)

| Hub module (planned) | Should connect to | Replaces edges |
|---------------------|-------------------|----------------|
| `catalog/units.ts` | PDP, BAW hub, cart, wishlist, `resolveQuote`, PSA | 6+ price maps |
| `catalog/bawOptions.ts` | hub, 8 steps, `resolveQuote` | 9 option tables |
| `bcfProductOptions.ts` (server port) | shop, cart, `resolveQuote` | unresolved BCF |
| Server cart service | checkout quote, webhook | LS price authority |
| Durable rate limiter | all Fal/OpenAI routes | in-memory `rateLimit.ts` |
| Relational orders | webhook, admin | JSONB `orders` blob |

---

## Quick navigation

| Question | Go to section |
|----------|---------------|
| How does checkout connect to Stripe? | §4, §12 |
| What talks to localStorage? | §3, §7, §13 |
| Which products block PaymentIntent? | §4 product type table |
| How does PSA add to cart? | §9 |
| Which DB tables touch orders? | §11 |
| What runs on sign-in? | §6, §13 |
| Where is Fal in the loop? | §8 |
