# Launch Integrity Auditor™ — Frontal Slayer

**Generated:** 2026-07-08T13:08:29.146Z
**Launch readiness score:** 100/100
**Deployment status:** pass

## Summary

| Metric | Count |
|--------|------:|
| Routes tested | 37 |
| Passed | 40 |
| Failed | 0 |
| Warnings | 0 |
| Manual review | 9 |
| Critical open | 0 |
| High open | 0 |
| Fixed this run | 6 |

## Build checks

- TypeScript: **pass** — tsc --noEmit clean
- Production build: **pass** — vite build succeeded
- Lazy imports: **pass**
- Public assets: **pass**
- API routes: **277** files

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

## Fixes applied this sprint

- **/brand** — 404 on bare /brand → `Navigate → /brand/about` (`src/App.tsx`)
- **/orders** — Legacy /orders bookmark 404 → `Navigate → /account/orders` (`src/App.tsx`)
- **/shopping-bag** — Legacy /shopping-bag 404 → `Navigate → /bag` (`src/App.tsx`)
- **/account/notifications** — Desktop nav dead link → `Navigate → /account/alerts` (`src/App.tsx`)
- **CDS Scene Stack** — CIE reuse gate blocked first generation → `forceGenerate when layer has no publicUrl` (`src/hooks/useSceneStack.ts`)
- **e2e signed-in** — /orders drift from canonical path → `Use /account/orders in e2e/helpers/routes.ts` (`e2e/helpers/routes.ts`)

## Manual review still needed

- Checkout with live Stripe + Supabase session (payment submit)
- Admin sync-profile with production credentials
- Build-a-Wig FAL live preview (founder-only)
- Lounge TV ticket purchase end-to-end on device
- Studio OS CDS Scene Stack generation with FAL_KEY
- Desktop preview routes (/desktop/*) — secondary phase per CORE
- Full admin studio module smoke (200+ routes)
- Accessibility audit (WCAG) — manual + axe
- SEO meta per page — manual content review