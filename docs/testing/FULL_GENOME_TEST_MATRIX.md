# Full Genome Test Matrix — Build-a-Wig

Test plan derived from Product Genome audit (2026-06-12).  
**Baseline:** 24 Playwright tests (`runtime-verified`); mobile viewport per `CORE.md`.

**Priority:** P0 = release blocker | P1 = before paid launch | P2 = post-launch hardening

---

## 1. Route smoke tests (mobile)

| ID | Route / area | Role | Current | Priority | Notes |
|----|--------------|------|---------|----------|-------|
| R-01 | `/home/shop` | guest | **covered** `guest.spec.ts` | P0 | |
| R-02 | `/bag` | guest | **covered** | P0 | |
| R-03 | `/checkout` | guest | **covered** | P0 | load only |
| R-04 | `/sign-in` | guest | **covered** | P0 | |
| R-05 | `/straight/noir` | guest | **covered** | P0 | + CTA test |
| R-06 | `/build-a-wig` | guest | **covered** | P0 | |
| R-07 | `/tools`, `/brand` | guest | **covered** | P1 | |
| R-08 | `/booking/consultation` | guest | **covered** | P1 | |
| R-09 | All 6 unit PDPs | guest | partial | P1 | 5 missing |
| R-10 | `/shop/bundles` BCF | guest | **missing** | P1 | |
| R-11 | `/checkout/bookings` | guest | **missing** | P1 | |
| R-12 | `/checkout/gift-card` | guest | **missing** | P1 | |
| R-13 | `/checkout/upgrade` | standard | **missing** | P1 | |
| R-14 | `/lobby` | premium | **missing** | P2 | |
| R-15 | Admin dashboard | admin | **missing** | P1 | smoke only |

---

## 2. Mobile viewport tests

| ID | Check | Priority |
|----|-------|----------|
| MV-01 | Playwright config uses mobile device descriptors | P0 |
| MV-02 | Cart dropdown + bag layout at 390px width | P1 |
| MV-03 | BAW three-thumb row alignment (hub) | P2 |
| MV-04 | Checkout order strip tiles | P1 |

---

## 3. Auth / session tests

| ID | Scenario | Priority | Type |
|----|----------|----------|------|
| A-01 | Sign up → email confirm gate | P0 | E2E |
| A-02 | Sign in → profile sync | P0 | E2E |
| A-03 | Sign out clears Supabase + backup | P0 | E2E |
| A-04 | Session restore via cookie after reload | P1 | E2E |
| A-05 | No `password` key in localStorage after sign-in | P0 | E2E assert |
| A-06 | `sanitizeStoredAuthPasswords` strips legacy passwords | P0 | unit |
| A-07 | session-restore origin allowlist | P0 | API contract |
| A-08 | Unconfirmed email rejected | P1 | E2E |

---

## 4. Role / admin / founder access

| ID | Scenario | Priority |
|----|----------|----------|
| AR-01 | Non-admin blocked from `/admin/*` | P0 |
| AR-02 | Admin email allowed | P0 |
| AR-03 | Founder-only batch APIs 403 for non-founder admin | P1 |
| AR-04 | Premium PSA hidden for standard user | **covered** `standard-user.spec.ts` |
| AR-05 | PSA opens for premium | **covered** `premium-user.spec.ts` |
| AR-06 | Account routes redirect when signed out | P1 |

---

## 5. Product catalog tests

| ID | Scenario | Priority |
|----|----------|----------|
| PC-01 | Six units appear on `/shop/units` with correct names | P1 |
| PC-02 | BCF bundles/closures/frontals render options | P1 |
| PC-03 | Sold-out unit shows OUT OF STOCK on PDP | P2 |
| PC-04 | Unit thumbnail paths resolve (no 404) | P2 |

---

## 6. Pricing tests

| ID | Scenario | Priority | Type |
|----|----------|----------|------|
| PR-01 | `resolveQuote` unit bases match catalog | P0 | unit |
| PR-02 | Booking install + add-ons totals | P0 | unit |
| PR-03 | Consult deposit + style tiers | P0 | unit |
| PR-04 | BAW hub total = sum of options (fixture) | P1 | unit |
| PR-05 | BCF bundle deal math | P1 | unit |
| PR-06 | Wishlist BEACH WAVE price = $760 | P1 | unit bugfix |
| PR-07 | Client quote vs server quote `fullyResolved` flag | P0 | integration |

---

## 7. Build-a-Wig selection state

| ID | Scenario | Priority |
|----|----------|----------|
| BAW-01 | Hub → customize → confirm updates `selected*` | P1 |
| BAW-02 | Edit cart line restores selections | P1 |
| BAW-03 | Premium gate blocks lace/color when standard | P1 |
| BAW-04 | NOIR color updates hero (mock Storage URLs) | P2 |
| BAW-05 | Add BAW line to bag preserves breakdown | P1 |

---

## 8. Cart / wishlist

| ID | Scenario | Priority |
|----|----------|----------|
| CW-01 | Add NOIR to bag | **covered** standard-user |
| CW-02 | Cart persists per-user key on sign-in swap | P1 |
| CW-03 | Premium-gated lines stripped when tier drops | P1 |
| CW-04 | Wishlist + LIST from bag | P2 |
| CW-05 | Server cart version conflict handling | P2 |

---

## 9. Checkout / Stripe

| ID | Scenario | Priority |
|----|----------|----------|
| CH-01 | `POST /api/checkout/quote` rejects tampered client price | P0 |
| CH-02 | PI creation fails when `fullyResolved: false` | P0 |
| CH-03 | PI succeeds for booking-only cart (resolved lines) | P1 |
| CH-04 | Membership Checkout Session return URL | P1 |
| CH-05 | Consult code validate + redeem | P1 |
| CH-06 | End-to-end Stripe test mode purchase | P1 | manual + CI optional |

---

## 10. Webhook / order persistence

| ID | Scenario | Priority |
|----|----------|----------|
| WH-01 | `payment_intent.succeeded` idempotent on duplicate event | P0 |
| WH-02 | Order appended to `orders.active_orders` JSONB | P0 |
| WH-03 | JWT user cannot INSERT orders directly (RLS) | P0 |

---

## 11. Supabase RLS

| ID | Table | Policy | Priority |
|----|-------|--------|----------|
| RLS-01 | `profiles` | user SELECT/UPDATE own | P0 |
| RLS-02 | `cart` / `wishlist` | user ALL own | P0 |
| RLS-03 | `orders` | SELECT only for JWT | P0 |
| RLS-04 | `psa_threads` | user SELECT own | P1 |
| RLS-05 | pending queues | no user access | P1 |

---

## 12. AI cost-control tests

| ID | Scenario | Priority |
|----|----------|----------|
| AI-01 | `build-a-wig-unit-image` returns 429 after cap | P1 |
| AI-02 | PSA usage blocks after daily limit | P1 |
| AI-03 | Hairstyle analysis consume/refund RPC | P1 |
| AI-04 | NOIR `forceRegenerate` requires auth | P1 |
| AI-05 | Durable rate limit across instances | P1 | **planned** infra |

---

## 13. PSA assistant

| ID | Scenario | Priority |
|----|----------|----------|
| PSA-01 | Chat returns 403 for standard user | P1 |
| PSA-02 | Thread create/list round-trip | P2 |
| PSA-03 | Selfie style analysis premium gate | P2 |

---

## 14. Analytics

| ID | Scenario | Priority |
|----|----------|----------|
| AN-01 | `POST /api/analytics/event` inserts row | P2 |
| AN-02 | Admin analytics GET matches seeded events | P2 |

---

## 15. localStorage migration / drift

| ID | Scenario | Priority |
|----|----------|----------|
| LS-01 | Bootstrap strips `password` from registeredUsers | P0 |
| LS-02 | Auth backup cookie has no password field | P0 |
| LS-03 | Sign-in does not write password keys | P0 |

---

## 16. Motherboard reconciliation tests

| ID | Scenario | Priority |
|----|----------|----------|
| MB-01 | CODEBASE route count within 10% of `App.tsx` | P2 | manual or script |
| MB-02 | CORE env vars listed in `.env.example` | P2 |
| MB-03 | Genome index P0 list matches open issues | P1 | process |

---

## CI recommendation

| Stage | Commands |
|-------|----------|
| PR | `npm run build`, API `tsc`, unit pricing tests |
| Nightly | Playwright guest + standard + premium |
| Pre-release | Stripe webhook integration, RLS SQL tests, manual mobile device pass |

---

## Coverage gap summary

| Area | Current | Target |
|------|---------|--------|
| Routes | ~4% smoke (10/251) | 80% smoke on commerce paths |
| API routes | 0% contract | 100% P0/P1 handlers |
| Pricing | 0% automated | 100% `resolveQuote` + catalog parity |
| RLS | 0% | critical tables |
