# Route Surface Catalog — Build-a-Wig

**251** React Router declarations in `src/App.tsx` (`code-backed`).  
**E2E coverage:** 10 guest smoke paths + signed-in subsets — see `e2e/helpers/routes.ts`.

**Role legend:** `guest` | `customer` (signed-in) | `premium` | `admin` | `founder` (founder Gmail + admin)

**Evidence:** file paths from route audit; guards from `AdminGuard.tsx`, `AccountRouteGuard.tsx`, `CommerceRouteGuard.tsx`.

---

## Coverage summary

| Route group | Routes | E2E smoke | Missing tests |
|-------------|-------:|-----------|---------------|
| Guest smoke (10 paths) | 10 | **yes** `guest.spec.ts` | Deeper actions (add BCF, gift card) |
| Standard signed-in (5 paths) | 5 | **partial** `standard-user.spec.ts` | Settings, payment, affiliate |
| Premium (3 journeys) | 3 | **partial** `premium-user.spec.ts` | PSA tools, live try-on |
| Admin (30) | 30 | **none** | All admin CRUD, founder-only |
| BAW steps (146) | 146 | hub only | Per-step selection + live preview |
| Checkout variants | 4 | `/checkout` only | `/checkout/bookings`, gift-card, upgrade + Stripe |
| Account (14) | 14 | 4 covered | consult-offer, load-card, reviews |

---

## Landing & lobby

| Route | Page | Roles | Purpose | APIs | localStorage | Tests |
|-------|------|-------|---------|------|--------------|-------|
| `/`, index | `HomeLandingRedirect` | all | Premium→`/lobby`, else→`/home/shop` | — | reads tier/sub | none |
| `/lobby`, `/lobby/lounge` | `lobby/page.tsx` | premium typical | Lounge, TV, shop nav | `GET /api/lounge-tv-config` | lounge viewed tiles | none |
| `/lounge` | redirect | — | → `/lobby/lounge` | — | — | none |

---

## Shop & units

| Route | Page | Roles | Purpose | Data R/W | APIs | Tests |
|-------|------|-------|---------|----------|------|-------|
| `/home/shop` | `products/page.tsx` | guest+ | Shop hub | cart count read | — | guest smoke |
| `/shop/units` | `products/units/page.tsx` | guest+ | Unit grid | — | — | none |
| `/straight/noir` | `straight/noir/page.tsx` | guest+ | NOIR PDP | cart write | — | guest smoke + add bag |
| `/straight/blanco` | `straight/blanco/page.tsx` | guest+ | BLANCO PDP | cart | — | none |
| `/wavy/soft-wave` | `wavy/soft-wave/page.tsx` | guest+ | SOFT WAVE PDP | cart | — | none |
| `/wavy/beach-wave` | `wavy/beach-wave/page.tsx` | guest+ | BEACH WAVE PDP | cart | — | none |
| `/curly/soft-curl` | `curly/soft-curl/page.tsx` | guest+ | SOFT CURL PDP | cart | — | none |
| `/curly/ocean-curl` | `curly/ocean-curl/page.tsx` | guest+ | OCEAN CURL PDP | cart | — | none |
| `/shop/bundles`, `/closures`, `/frontals` | `shop/texture-category-product/page.tsx` | guest+ | BCF catalog | cart, BCF selections | — | none |
| `/units/straight|wavy|curly` | `units/*/page.tsx` | guest+ | Category browsers | — | — | none |

---

## Build-a-Wig (pattern)

**Hub:** `src/pages/build-a-wig/page.tsx` — **705** localStorage operations (`code-backed`).

**Steps:** `color`, `length`, `density`, `lace`, `texture`, `hairline`, `cap`, `styling`, `addons` → respective `build-a-wig/*/page.tsx`.

### Per-unit route pattern (×6 units)

Units: `noir`, `blanco`, `soft-wave`, `beach-wave`, `soft-curl`, `ocean-curl`.

| Route pattern | Component | Roles | Actions | APIs (NOIR) | localStorage |
|---------------|-----------|-------|---------|-------------|--------------|
| `/build-a-wig/{unit}` | hub | customer+ | configure, add bag | live preview (NOIR) | `selected*`, prices |
| `/build-a-wig/{unit}/customize` | hub | customer+ | draft customize | — | `customizeSelected*` |
| `/build-a-wig/{unit}/customize/{step}` | step page | customer+ | option pick | `live-noir-color`, `live-wig-after-color-styling` (NOIR) | step keys |
| `/build-a-wig/{unit}/edit` | hub | customer+ | edit cart line | — | `editingCartItem` |
| `/build-a-wig/{unit}/edit/{step}` | step page | customer+ | edit flow | same as customize | edit keys |

**Legacy:** `/build-a-wig/edit/*` and `/build-a-wig/{step}` without unit — `legacy`.

| Route | Tests |
|-------|-------|
| `/build-a-wig` | guest smoke + standard signed-in |

**Missing tests:** premium gates, live color Fal path, cart round-trip, all non-NOIR units.

---

## Tools & booking

| Route | Page | Roles | Purpose | APIs | Tests |
|-------|------|-------|---------|------|-------|
| `/tools`, `/home/tools` | `tools/page.tsx` | guest+ | Tools hub | — | guest smoke |
| `/tools/gift-card` | `tools/gift-card/page.tsx` | guest+ | Gift card purchase | — | none |
| `/tools/live-try-on` | `tools/live-try-on/page.tsx` | customer+ | Live try-on studio | `live-try-on-*` | none |
| `/tools/hairstyle-analysis` | `HairstyleAnalysisDemo.tsx` | premium+ | Hairstyle cards | `hairstyle-analysis-*` | none |
| `/tools/order-form` | `shop/order-form/page.tsx` | customer+ | Order authorization form | `client/submissions` | none |
| `/booking/consultation` | `booking/consultation/page.tsx` | guest+ | Consult booking | — | guest smoke |
| `/booking/appointment` | `booking/appointment/page.tsx` | guest+ | Install booking | — | none |
| `/booking/premium/*` | same pages | premium | Premium paths | — | premium consult test |

---

## Brand

| Route | Page | Roles | APIs | Tests |
|-------|------|-------|------|-------|
| `/brand/about`, `contact`, `faq`, `reviews`, `terms`, `member` | `brand/page.tsx` | guest+ | contact/faq → `brand/*-submit` | guest `/brand` smoke |
| `/brand/careers` | `brand/careers/page.tsx` | guest+ | — | none |

---

## Wishlist

| Route | Page | Guard | Tests |
|-------|------|-------|-------|
| `/wishlist`, `/wishlist/lists`, `.../lists/:listId` | wishlist pages | AccountRouteGuard | standard smoke |
| `/wishlist/shared/:token` | `wishlist/shared/page.tsx` | none (public) | none |

---

## Account (AccountRouteGuard)

| Route | Page | Purpose | APIs | Tests |
|-------|------|---------|------|-------|
| `/account` | `account/page.tsx` | Account menu | profile sync | standard |
| `/account/concierge` | `concierge/page.tsx` | Concierge, offers | special-offer-config | standard |
| `/account/rewards` | `membership/page.tsx` | Premium chart | stripe membership-available | standard |
| `/account/settings` | `settings/page.tsx` | Profile, delete account | profile PATCH, delete-account | **missing** |
| `/account/orders` | `orders/page.tsx` | Orders list | orders GET | via `/orders`? |
| `/orders` | `orders/page.tsx` | Same module | orders | standard |
| `/account/payment`, `/shipping` | payment/shipping | Saved cards/addresses | profile | missing |
| `/account/notifications` | `notifications/page.tsx` | Alerts | notifications | missing |
| `/account/affiliate`, `/referrals`, `/reviews` | respective | Programs | client/submissions | missing |

---

## Bag & checkout

| Route | Page | Guard | Stripe | Server quote | Tests |
|-------|------|-------|--------|--------------|-------|
| `/bag` | `shopping-bag/page.tsx` | Commerce (guest OK) | — | — | guest smoke |
| `/checkout` | `checkout/page.tsx` | Commerce (guest OK) | PI when wired | `POST /api/checkout/quote` | guest smoke |
| `/checkout/bookings` | `checkout/page.tsx` | Commerce | skipped PI | partial | **missing** |
| `/checkout/gift-card` | `checkout/page.tsx` | Commerce | skipped PI | no | **missing** |
| `/checkout/upgrade` | `checkout/page.tsx` | none | Checkout Session | N/A membership | **missing** |
| `/checkout/summary` | `checkout/confirm/page.tsx` | none | — | — | **missing** |

---

## Auth

| Route | Page | Roles | APIs | Tests |
|-------|------|-------|------|-------|
| `/sign-in` | `sign-in/page.tsx` | guest | Supabase auth; session-cookie | guest smoke |

---

## Admin (AdminGuard — admin email)

| Route | Page | Founder-only features | APIs |
|-------|------|----------------------|------|
| `/admin/dashboard` | dashboard | — | dashboard |
| `/admin/clients/overview` | clients | mock merge | clients, export |
| `/admin/meetings` | meetings | send offer, demo orders | meetings, consult-quotes |
| `/admin/marketing` | marketing | newsletter | special-offer-config, newsletter-send |
| `/admin/revenue` | revenue | globe, inventory | revenue, live-presence |
| `/admin/backend` | backend | live try-on batch, lounge TV | lounge-tv-config, live-try-on-batch-* |
| `/admin/pending` | pending | approve queues | pending-queue |
| `/admin/analytics` | analytics | — | admin/analytics |
| `/admin/audit` | audit | — | audit-log |
| … | (see `App.tsx:419-548`) | | |

**Tests:** none automated.

---

## Integrations touched by route class

| Integration | Routes |
|-------------|--------|
| Supabase Auth | account, checkout (PI), sign-in, PSA |
| Stripe | `/checkout`, `/checkout/upgrade` |
| Fal | BAW NOIR steps, live try-on, hairstyle |
| OpenAI | PSA widget routes, hairstyle (optional) |
| localStorage | virtually all customer routes |
| Resend | admin marketing, brand contact |

---

## How to extend this catalog

1. Add a row when shipping a new `App.tsx` route.
2. Link Playwright spec in **Tests** column.
3. For BAW, prefer **pattern rows** over 146 duplicate lines unless behavior diverges by unit.
