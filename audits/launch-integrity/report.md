# Launch Integrity Auditor™ — Frontal Slayer

**Generated:** 2026-07-08T13:30:31.925Z

> **Important:** **Static integrity** = routes/build/TS only. **Launch readiness** includes commerce/payment env blockers. A passing `/checkout` route does **not** mean Stripe is wired or payments work.

**Static integrity score:** 100/100
**Launch readiness score:** 25/100
**Deployment status:** warn
**Commerce launch:** blocked

## Summary

| Metric | Count |
|--------|------:|
| Routes tested | 37 |
| Passed | 40 |
| Failed | 0 |
| Warnings | 5 |
| Manual review | 12 |
| Critical open | 0 |
| High open | 0 |
| Fixed this run | 6 |
| Commerce blockers open | 5 |

## Build checks

- TypeScript: **pass** — tsc --noEmit clean
- Production build: **skip** — Skipped (--skip-build)
- Lazy imports: **pass**
- Public assets: **pass**
- API routes: **277** files

## Commerce integration (env)

- STRIPE_SECRET_KEY: **missing** — Missing — blocks: Product PaymentIntents, membership Checkout, booking autopay
- STRIPE_PUBLISHABLE_KEY: **missing** — Missing — blocks: Client-side Stripe Elements on checkout
- STRIPE_WEBHOOK_SECRET: **missing** — Missing — blocks: Order + membership confirmation after payment
- STRIPE_PRICE_ID_3MONTHS / _6MONTHS / _12MONTHS: **missing** — Missing — blocks: Rewards / membership subscription checkout
- SITE_URL: **missing** — Missing — blocks: Stripe return URLs and webhook callbacks

## Issues

| Route | Status | Severity | Type | What broke | Location | Resolution |
|-------|--------|----------|------|------------|----------|------------|
| / | pass | low | route_registry | None | src/App.tsx | open |
| /lobby | pass | low | route_registry | None | src/App.tsx | open |
| /home/shop | pass | low | route_registry | None | src/App.tsx | open |
| /sign-in | pass | low | route_registry | None | src/App.tsx | open |
| /bag | pass | low | route_registry | None | src/App.tsx | open |
| /checkout | pass | low | route_registry | None | src/App.tsx | open |
| /checkout/bookings | pass | low | route_registry | None | src/App.tsx | open |
| /checkout/gift-card | pass | low | route_registry | None | src/App.tsx | open |
| /straight/noir | pass | low | route_registry | None | src/App.tsx | open |
| /build-a-wig | pass | low | route_registry | None | src/App.tsx | open |
| /build-a-wig/noir | pass | low | route_registry | None | src/App.tsx | open |
| /wishlist | pass | low | route_registry | None | src/App.tsx | open |
| /booking/consultation | pass | low | route_registry | None | src/App.tsx | open |
| /tools/gift-card | pass | low | route_registry | None | src/App.tsx | open |
| /lobby/lounge | pass | low | route_registry | None | src/App.tsx | open |
| /account | pass | low | route_registry | None | src/App.tsx | open |
| /account/settings | pass | low | route_registry | None | src/App.tsx | open |
| /account/concierge | pass | low | route_registry | None | src/App.tsx | open |
| /account/rewards | pass | low | route_registry | None | src/App.tsx | open |
| /account/orders | pass | low | route_registry | None | src/App.tsx | open |
| /account/alerts | pass | low | route_registry | None | src/App.tsx | open |
| /account/payment | pass | low | route_registry | None | src/App.tsx | open |
| /admin/dashboard | pass | low | route_registry | None | src/App.tsx | open |
| /admin/marketing | pass | low | route_registry | None | src/App.tsx | open |
| /admin/clients/overview | pass | low | route_registry | None | src/App.tsx | open |
| /admin/meetings | pass | low | route_registry | None | src/App.tsx | open |
| /admin/pending | pass | low | route_registry | None | src/App.tsx | open |
| /admin/studio/mission-control | pass | low | route_registry | None | src/App.tsx | open |
| /admin/studio/department/creative-direction | pass | low | route_registry | None | src/App.tsx | open |
| /brand | pass | low | route_registry | None | src/App.tsx | open |
| /brand/about | pass | low | route_registry | None | src/App.tsx | open |
| /brand/contact | pass | low | route_registry | None | src/App.tsx | open |
| /brand/faq | pass | low | route_registry | None | src/App.tsx | open |
| /brand/terms | pass | low | route_registry | None | src/App.tsx | open |
| /orders | pass | low | legacy_redirect | None | src/App.tsx | open |
| /brand | pass | low | legacy_redirect | None | src/App.tsx | open |
| /lounge | pass | low | legacy_redirect | None | src/App.tsx | open |
| /shopping-bag | pass | low | legacy_redirect | None | src/App.tsx | open |
| /brand | pass | low | e2e_route_drift | None (resolved) | e2e/helpers/routes.ts | fixed |
| /orders | pass | low | e2e_route_drift | None (resolved) | e2e/helpers/routes.ts | fixed |
| (commerce) STRIPE_SECRET_KEY | warn | critical | commerce_integration | STRIPE_SECRET_KEY not configured — Product PaymentIntents, membership Checkout, booking autopay | docs/STRIPE_MEMBERSHIP_SETUP.md | open |
| (commerce) STRIPE_PUBLISHABLE_KEY | warn | critical | commerce_integration | STRIPE_PUBLISHABLE_KEY not configured — Client-side Stripe Elements on checkout | api/stripe/product-checkout-available.ts | open |
| (commerce) STRIPE_WEBHOOK_SECRET | warn | critical | commerce_integration | STRIPE_WEBHOOK_SECRET not configured — Order + membership confirmation after payment | api/stripe/webhook.ts | open |
| (commerce) STRIPE_PRICE_ID_3MONTHS / _6MONTHS / _12MONTHS | warn | critical | commerce_integration | STRIPE_PRICE_ID_3MONTHS / _6MONTHS / _12MONTHS not configured — Rewards / membership subscription checkout | api/_lib/stripeMembership.ts | open |
| (commerce) SITE_URL | warn | critical | commerce_integration | SITE_URL not configured — Stripe return URLs and webhook callbacks | api/_lib/stripeMembership.ts → siteUrlFromEnv | open |

## Fixes applied this sprint

- **/brand** — 404 on bare /brand → `Navigate → /brand/about` (`src/App.tsx`)
- **/orders** — Legacy /orders bookmark 404 → `Navigate → /account/orders` (`src/App.tsx`)
- **/shopping-bag** — Legacy /shopping-bag 404 → `Navigate → /bag` (`src/App.tsx`)
- **/account/notifications** — Desktop nav dead link → `Navigate → /account/alerts` (`src/App.tsx`)
- **CDS Scene Stack** — CIE reuse gate blocked first generation → `forceGenerate when layer has no publicUrl` (`src/hooks/useSceneStack.ts`)
- **e2e signed-in** — /orders drift from canonical path → `Use /account/orders in e2e/helpers/routes.ts` (`e2e/helpers/routes.ts`)

## Manual review still needed

- End-to-end product checkout: bag → checkout → Stripe PaymentIntent → webhook → order in account
- Membership upgrade checkout: /checkout/upgrade → Stripe session → webhook → rewards profile
- Booking checkout + final balance autopay (saved default payment method)
- Gift card checkout flow
- Admin sync-profile with production credentials
- Build-a-Wig FAL live preview (founder-only)
- Lounge TV ticket purchase end-to-end on device
- Studio OS CDS Scene Stack generation with FAL_KEY
- Desktop preview routes (/desktop/*) — secondary phase per CORE
- Full admin studio module smoke (200+ routes)
- Accessibility audit (WCAG) — manual + axe
- SEO meta per page — manual content review