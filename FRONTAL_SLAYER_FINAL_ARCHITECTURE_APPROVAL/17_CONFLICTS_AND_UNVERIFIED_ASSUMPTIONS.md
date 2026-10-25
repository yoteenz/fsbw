# 17 — Conflicts and Unverified Assumptions

This document lists every place where sources disagree (**K-ids**) and every assumption the package relies on that has not been verified (**U-ids**). Nothing here is resolved by this package unless it says **RESOLVED (evidence)**. A conflict about a business rule is never resolved by engineering: it goes to a founder decision.

## 1. Conflicts

| ID | Subject | Source A | Source B | Resolution path |
|---|---|---|---|---|
| K-01 | Slay Challenge structure | Brief: three requirements per reward | Repo canon (MEMORY 2026-06-19): 4 tiers, thresholds 5/7, 4/7, 5/9, 6/9, choose 1 of 2 | **D1** |
| K-02 | Phase-2 reveal threshold | Copy: 75% | Code: 2 of 3 = 67% | **D1** |
| K-03 | Special offers / Slay Challenge / exclusive rewards eligibility | Chart and gate: 12-month | Concierge: 6 and 12; list: all premium | **D2** |
| K-04 | Live order tracking minimum tier | Copy: 3-month | `psaFeatureGates.ts:14`: 6-month | **D2** |
| K-05 | Premium welcome credit | Chart $10/$20/$40/$60 | Checkout $10/$20/$40; spend-tier welcome also called "WELCOME DISCOUNT" | **D3** |
| K-06 | Affiliate photo points | Copy 400 (`affiliate/page.tsx:95`) and the brief's reference | Server approval writes 100 (`pendingQueueHandlers.ts:139-141`) | **D6** |
| K-07 | Affiliate product cap scope | Copy: 3,000 social per product | Code: hidden photo/video sub-cap 2 + 2 | **D6** |
| K-08 | Referral activation | Copy: on delivery | Code: shipped or delivered | **D8** |
| K-09 | Referral incentive | Repo implements $20 + $20 (client-side) | Brief: do not implement the $20 incentive automatically | **D8**. This package does not implement or schedule it. |
| K-10 | Hair analysis pack sizes | App and MEMORY 2026-06-12: 1 = $20, 4 = $60 | `PRODUCT_AND_PRICING_GENOME.md`: 1/3/6; live SQL accepts 1/3/6 | App canon is latest. Doc fix + SQL fix in S0B-1 (R-10). Prices themselves are not changed. |
| K-11 | Hair analysis for BLACK and non-subscribers | BLACK gets PSA but not analysis; non-subscribers can buy credits | Same non-subscribers get 403 when using them | **E1** |
| K-12 | Birthday gift eligibility | Chart: premium | Affiliate copy: also VIP/affiliate | **D13** |
| K-13 | Order stage vocabulary | Concierge stage list | `ORDER_TRACKING_STAGE_LABELS` | **C4** |
| K-14 | Do migrations revoke EXECUTE? | Research agent X2: "no migration contains a REVOKE" | Repo grep: `REVOKE ALL … FROM PUBLIC` exists for `hairstyle_analysis_try_consume`, `hairstyle_analysis_refund_consume`, `psa_try_consume_message`, `slay_forecast_public_broadcast_package` | **RESOLVED (evidence):** X2's sentence is wrong for those 4 functions, but its conclusion holds: anon/authenticated keep direct grants (LIVE-CONFIRMED) and the grant function has no revoke at all. The fix revokes from `PUBLIC, anon, authenticated` (R-01). |
| K-15 | Stripe docs vs code | `STRIPE_MEMBERSHIP_SETUP.md`: Edge runtime; `BOOKING_AUTOPAY_SETUP.md`: cron works | Code: Node runtime; cron sends GET with `CRON_SECRET` but the endpoint needs POST and `BOOKING_AUTOPAY_CRON_SECRET` | Docs are stale. Fix docs in S0B-2; fix the cron only after A7 (ENG-08). |
| K-16 | Order route | PSA uses `/orders` (stored in chat history) | Emails use `/account/orders` | Keep both; `/orders` stays an alias and starts preserving the query string (05 CSV X-01). |
| K-17 | Brief reference to a "Hair Bestie Bonus" | Brief lists it among rewards | Repo: does not exist ("hair bestie" is only a PSA voice pillar) | **D12** |
| K-18 | Visual tokens | Design-system black `#1A1A1A`; mobile-mansion tokens use Playfair Display | Pages use `#000`; brand fonts are Futura PT, Covered By Your Grace, Bohemy | Keep page values; do not propagate the design-system values (doc 18 §4). |
| K-19 | Customer page count | Doc 01: 21 routed account pages | Page model: 20 routed page rows | **RESOLVED (evidence):** C-14 holds two URLs (`/wishlist/lists`, `/wishlist/lists/:listId`), so 20 rows = 21 URLs. |
| K-20 | Stripe charged total vs displayed total | Client shows vouchers, cash, tip, shipping, tax | Server PI charges list price only | Architecture decision in doc 07 §3 (server quote is the only total); R-12 |

## 2. Unverified assumptions

| ID | Assumption | Why it matters | How to verify | Owner / when |
|---|---|---|---|---|
| U-01 | `SUPABASE_SERVICE_ROLE_KEY` is set in FRONTAL SLAYER **and** SITE00 production | Without it, the R-01 revoke silently breaks server features (R-02) | Operator checks both Vercel projects' env (names only) | Founder/operator, before S0B-1 |
| U-02 | Number of customers affected by money defects (4-pack, billed after cancel, undelivered add-ons, PSA picks) | Sizes A8 remediation | Read-only Stripe + DB queries | S0B-2 |
| U-03 | The 30 existing collectible phase images are transparent and show the full silhouette throughout | Brief states this is established; repo has no canon; images are in Supabase Storage and were not inspected offline | Download and inspect alpha channels on staging (no regeneration) | S4, under D1 |
| U-04 | Signed-in flows work end-to-end | No staging environment and no test accounts were used; every page tops out at status G (doc 13) | Staging with test accounts and Stripe test mode (H2) | S7 |
| U-05 | Stripe dashboard configuration (webhook endpoints and events, portal settings, price ids, currencies) | Code shows intent, not configuration | Read-only dashboard review | Founder/operator, before S0B-2 |
| U-06 | Live database matches the migrations beyond the audit's read-only checks | Out-of-band changes are invisible to a code read; two repos write one migration history | `list_migrations` + catalog diff before each DB sprint | Each DB sprint |
| U-07 | What an unknown premium tier should get (code defaults to 12-month privileges) | Wrong default over-grants | Founder rule | **D10** |
| U-08 | Visual layout of new surfaces (status panels, MY HAIR, order detail, admin orders) | No mockups exist; only rules (doc 12) | Founder review of first build on staging | S2/S5 (G4) |
| U-09 | How many real customers hold local-only orders on their devices | Affects the S1 migration message | Not observable from the server; estimate from webhook rows (0 production server orders at audit time) | S1 |
| U-10 | SITE00 has no `/account/*` paths of its own that collide with FRONTAL SLAYER routes | Only FRONTAL SLAYER links were scanned | Route scan of SITE00 (read-only) | Before S2 redirects |
| U-11 | Emails render and deliver with the deep links listed in doc 05 | Templates were read, not sent | Send test emails on staging | S7 |
| U-12 | Lifetime $10k = permanent BLACK; Annual Consultation Benefit; tier welcome bonuses; mystery reward; early access; free gift | Copy or code only, no rule | Founder rule | **D9** |
| U-13 | Build and test health | The audit ran `tsc` (0 errors) and vitest once; **no tests were run in this sprint** (planning only) | CI on each sprint branch | Each sprint |
| U-14 | Responsive findings hold for signed-in data | The audit sweep ran with local, signed-out or seeded state | Re-run the sweep on staging | S2/S3 (gate G5 in doc 12) |
| U-15 | Non-USD charges occur in production | The webhook records them as USD (R-12) | Read-only Stripe query | S1 |
| U-16 | Founder preferences on the interim checkout choices (deposit collection, gift card visibility) | Doc 07 §3 lists options | Founder answer inside A6/A7 | S0B-2 |
