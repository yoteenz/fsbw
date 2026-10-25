# 08 — Membership, Rewards and Ledger Architecture

**No business rule is set by this document.** Values below are classified **CONFIRMED / CONFLICTING / UNVERIFIED / FOUNDER DECISION REQUIRED (FDR)** from repository evidence. Full evidence, with `file:line` and dated MEMORY entries: `evidence/R2_rewards_canon.md`. Decisions are referenced as D-ids (doc 16).

## 1. Rules reconciliation

### 1.1 Membership

| Rule | Value | Class | Decision |
|---|---|---|---|
| Durations and prices | 3 / 6 / 12 months · $280 / $520 / $960 (client, server and Stripe doc agree) | CONFIRMED | — |
| Billing | Stripe recurring per term; upgrade immediate with refund; downgrade at renewal | CONFIRMED (code) | — |
| 6-month adds | Priority messages | CONFIRMED | — |
| 12-month adds | 2X points (overrides tier multipliers); free domestic standard shipping (−$60) and −$40 express and international; anniversary 1,500; PSA 180/30 | CONFIRMED (code; shipping is code-only) | — |
| Special offers eligibility | 12-month only (chart, list, gate) vs 6 and 12 (Concierge) | CONFLICTING | D2 |
| Slay Challenge / exclusive rewards eligibility | All premium (list) vs 6/12 (Concierge) vs 12-only "exclusive rewards" (chart) | CONFLICTING | D2 |
| Live order tracking minimum | 3-month (copy, MEMORY 2026-05-29) vs 6-month (`psaFeatureGates.ts:14`) | CONFLICTING | D2 |
| Premium welcome credit | Chart $10/$20/$40/$60 vs checkout $10/$20/$40, once per tier | CONFLICTING | D3 |
| Spend-tier welcome credit | SILVER $10 / RED $40 / BLACK $80; both called "WELCOME DISCOUNT" | CONFLICTING (stacking) | D3 |
| Unknown premium tier | Defaults to 12-month privileges | UNVERIFIED (code default) | D10 |
| Lifetime $10k = permanent BLACK ("Status Protection"?) | Code only, no doc | UNVERIFIED | D9 |
| Annual Consultation Benefit | Copy only | UNVERIFIED | D9 |

### 1.2 Hairstyle Analysis

| Rule | Value | Class | Decision |
|---|---|---|---|
| Monthly allowance | 1 free per UTC month for 3/6/12-month subscribers; admins unlimited | CONFIRMED (server) | — |
| Paid credits | 1 = $20, 4 = $60; free first, then paid FIFO; non-refundable (MEMORY 2026-06-12, latest) | CONFIRMED · `PRODUCT_AND_PRICING_GENOME.md` 1/3/6 is **stale** | doc fix |
| Versioned V1/V2 entitlements | None exist | CONFIRMED (absence) | — |
| BLACK-only and non-subscriber use | BLACK gets PSA but not analysis; non-subscribers can buy credits but get 403 | CONFLICTING | E1 |
| Bonus analysis credit (Slay reward) | Copy and art exist; no grant path | UNVERIFIED | D1/E1 |
| PSA "best looks" pick caps 4/6/10 | Interim | UNVERIFIED | E6 |

### 1.3 Points, vouchers, digital cash

| Rule | Value | Class | Decision |
|---|---|---|---|
| Earn rate | 1 point per $1 eligible net (excludes gift cards, membership, digital) | CONFIRMED (checkout) · the display uses order total 1:1 | D4 (formula) |
| Multipliers | RED 1.25x, BLACK 1.5x; 12-month 2x replaces them | CONFIRMED | — |
| Spend tiers | 1,000 / 2,000 / 4,000 purchase points per Jan–Jun or Jul–Dec cycle | CONFIRMED | — |
| Points expiry | No rule (a `points_expiring` email template exists) | FDR | D5 |
| Voucher, discount and free-gift validity | 6 months from redemption | CONFIRMED (copy) | — |
| Digital cash expiry | Never expires | CONFIRMED (copy) | — |
| Anniversary | 500 / 1,000 / 1,500 at 3 / 6 / 12 months (amounts internal) | CONFIRMED amounts · semantics for renewals FDR | D11 |
| Annual BLACK status reward | 2,500 when both previous 6-month cycles ≥ 4,000 | CONFIRMED | — |
| Tier welcome bonuses (Silver 250; Red 500 + vouchers; Black 1,000 + vouchers) | Copy only | UNVERIFIED | D9 |
| Mystery reward, Early Access, Expedited Processing, Free Shipping *credit*, 2X/2.5X/3X next purchase | Copy (and art) only | UNVERIFIED | D9 |
| **Hair Bestie Bonus** | **Does not exist** in the repo ("hair bestie" is only a PSA voice pillar) | FDR | D12 |
| Birthday gift ($20 gift card or 200 points) | Premium (chart) vs also VIP/affiliate (affiliate copy); eligibility computed but unused | CONFLICTING | D13 |
| Free gift | Selection UI only; never fulfilled | UNVERIFIED | D9 |

### 1.4 Affiliate and referral (reference values from the brief, checked against the repo)

| Reference value (brief) | Repo | Class | Decision |
|---|---|---|---|
| Photo submission 400 points | Customer copy 400 (`affiliate/page.tsx:95`). **Server approval writes 100.** | CONFIRMED copy · implementation conflicts | D6 |
| Video/social content 600 | Copy 600 | CONFIRMED copy | D6 |
| Social tagging 600 per qualifying platform | Copy 600 per platform per unit | CONFIRMED copy | D6 |
| Product earning cap 3,000 | Copy: 3,000 **social** per product. Hidden photo/video sub-cap 2 + 2 = 2,000 in code. | CONFLICTING (scope of the cap) | D6 |
| Unit earning cap 5,000 per six months | Copy 5,000 per unit per 6-month cycle | CONFIRMED copy | D6 |
| Multipliers on affiliate points | Undefined | FDR | D6 |
| Featured Creator up to 1,500 | Copy only | UNVERIFIED | D6 |
| Referral incentive | $20 off the friend's first purchase + $20 digital cash to the referrer at confirmation; self-referral blocked; a client-side cancel reversal exists. **Per the brief, not to be implemented automatically.** | CONFIRMED in repo · **requires founder confirmation** | D8 |
| Referral activation | Copy: delivered only. Code: shipped or delivered. | CONFLICTING | D8 |
| Referral stacking with "+100 pts" earn task and quest rewards | Undefined | FDR | D8 |

### 1.5 Slay Challenge and collectibles

| Rule | Value | Class | Decision |
|---|---|---|---|
| Structure | **Brief:** three requirements per reward. **Repo (MEMORY 2026-06-19, latest):** 4 tiers with 5/7, 4/7, 5/9, 6/9 thresholds, choose 1 of 2 random rewards per tier, 6-month cycle. "3 requirements" is a leftover of an earlier 3-flag engine (`totalRequirements={3}`). | **CONFLICTING** | **D1** |
| Reveal phases | 3 phases (locked → 75% → unlocked) | CONFIRMED (MEMORY 2026-06-19) | — |
| Phase-2 threshold | "75%" in copy; code fires at 2 of 3 = 67% | CONFLICTING | D1 |
| Full silhouette visible throughout; progressive visual unlock; transparent assets | Stated as established in the brief. **No repo canon.** The component only swaps 3 pre-rendered images; the 30 PNGs are in Supabase Storage and were not verifiable offline. | UNVERIFIED | D1 (confirm the art satisfies it) |
| Do not regenerate collectible art | Brief + audit | CONFIRMED | — |
| Engine gaps | Tier 2 needs 3 of 3 (not 4/7); tiers 3–4 unreachable; progress never advances; state not user-scoped | CONFIRMED (defects) | engineering |

## 2. Target ledger architecture (design; no schema in this sprint)

### Tables (proposed)

| Table | Purpose | Key columns |
|---|---|---|
| `loyalty_ledger` | Points | `id`, `user_id`, `delta` (int), `reason` (purchase · purchase_multiplier · affiliate_photo · affiliate_video · affiliate_social · review_content · referral · anniversary · annual_black · slay_reward · birthday · redemption · expiry · reversal · admin_adjustment), `source_type`, `source_id`, `period_key` (e.g. `2026-H2`), `expires_at`, `reverses_entry_id`, `actor_type` (system/webhook/admin), `actor_id`, `created_at`. **Unique `(reason, source_type, source_id)`.** |
| `wallet_ledger` | Digital cash and gift-card value (USD cents) | same shape; reasons: gift_card_load · referral_credit · welcome_credit · slay_reward · redemption_checkout · refund_restore · reversal · admin_adjustment |
| `customer_vouchers` | Discrete vouchers | `id`, `user_id`, `voucher_type`, `value`, `status` (available · reserved · used · expired · void), `issued_reason`, `issued_source_id`, `expires_at`, `used_order_id` |
| `gift_card_codes` / `promo_codes` | Codes created by admin | code hash, value, limits, window, status, created_by, redeemed_by |
| `membership_events` | Lifecycle history | Stripe event id (unique), type, from/to tier, period_end |
| `slay_challenge_progress` | Per user per cycle and tier | `cycle_key`, `tier_index`, `requirements` (JSON of task → done_at, source), `reward_choice`, `phase` (derived), `completed_at`, `claimed_at` |
| `reward_claims` | One row per reward fulfilment (gift, birthday, Slay reward) | `reward_type`, `source`, `status` (claimed · fulfilled · cancelled), `fulfilled_order_id` |

Cached balances (`profiles.loyalty_points`, `gift_card_balance`) become **trigger-maintained from the ledger sums**. No API writes them directly.

### Write rules
- **Earn:** written by server event handlers only:
  - Stripe webhook for purchases and multipliers;
  - the approvals transaction for affiliate and review content;
  - order status `delivered`/`confirmed` for referral (per D8);
  - a scheduled job for anniversary and annual BLACK;
  - the Slay Challenge evaluator.
- **Redeem:** checkout reserves vouchers and points or cash inside the order transaction. On payment success they are committed; on failure or expiry the reservation is released.
- **Reverse:** a refund or cancel writes compensating entries for everything that order earned or consumed (points, referral credit, voucher restore).
- **Expire:** a nightly job writes `expiry` entries (rule D5). It never deletes.
- **Admin adjustments:** reason required; founder approval above a threshold (decision C2); audit-logged.
- **Idempotency:** unique source keys and the webhook event table (doc 06 §3).
- **Reconciliation:** nightly cached balance vs ledger sum, and ledger purchase entries vs paid orders. Mismatches go to SYSTEM ALERTS.

## 3. Slay Challenge evaluator (design, independent of D1 outcome)

- Requirements are **events**, not checkboxes: purchase (paid order), review approved, hairstyle analysis completed, PSA used, wishlist add, digital cash used, newsletter subscribed, social tag approved, …
- The evaluator writes `requirements[task] = done_at` per user, cycle and tier.
- **Phase** = f(completed count, required count) per the D1 mapping. The existing 3 images per reward render by phase (no new art).
- Claim → `reward_claims` + ledger entry (points, cash, voucher or analysis credit) or a fulfilment task (free gift, shipping).
- Admin: REWARDS console › SLAY CHALLENGE (cycle config, participant progress, claims to fulfil).

## 4. Customer and admin views (one ledger, two lenses)

| Customer | Admin |
|---|---|
| REWARDS › POINTS (balance, activity, expiring soon, redeem) | REWARDS › POINTS LEDGER (search, adjust, reverse) |
| REWARDS › WALLET (vouchers, cash, tickets) | REWARDS › WALLET & VOUCHERS, CODES |
| REWARDS › MEMBERSHIP (plan, renewal, billing history) | REWARDS › MEMBERS (plans, renewals, failures) |
| REWARDS › SLAY CHALLENGE | REWARDS › SLAY CHALLENGE |
| EARN & SHARE › REFERRALS | REWARDS › REFERRALS |
| MY HAIR › ANALYSES (credits) | REWARDS › ANALYSIS CREDITS |
