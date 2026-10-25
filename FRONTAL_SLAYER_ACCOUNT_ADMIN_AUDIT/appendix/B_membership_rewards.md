# B — Membership, Rewards, Loyalty, Slay Challenge, Collectibles, Referral, Affiliate, Slay Tickets (forensic audit)

Repo: `/home/user/fsbw`. Read-only audit. No builds, no Supabase/Stripe/network calls, no image assets were opened.
All paths are relative to the repo root. Evidence is cited as `file:line`.

Severity legend in tables: **P0** = money/entitlement can be granted or lost incorrectly, or fake success shown to customers. **P1** = feature does not reach the server or the admin. **P2** = copy or number inconsistency.

---

## 0. Executive summary (top findings)

1. **There are two membership models, and only one is authoritative on the server.**
   - Model A is the **premium subscription** (3/6/12 months, $280/$520/$960). Stripe Billing is wired correctly: Checkout, upgrade with refund, downgrade through a schedule, and webhooks that write `profiles` and `membership_payments`.
   - Model B is the **spend tier** (SILVER/RED/BLACK by 6-month purchase total). It is computed **only in the browser** from `localStorage userOrders_*` and stored in `localStorage lastKnownTier_*`. No server route ever writes `profiles.current_tier_name`, so a customer who is premium only through BLACK passes client gates but fails the server PSA and hair-analysis gates.
2. **The non-Stripe "CONFIRM ORDER" on `/checkout/upgrade` grants PREMIUM in localStorage without charging anything.** It also credits a welcome digital-cash bonus and writes a localStorage "membership payment" row (`src/pages/checkout/page.tsx:6818-6905`; `src/utils/productCheckoutPolicy.ts:77-84` skips Stripe for `isSubscriptionUpgrade`).
3. **CANCEL SUBSCRIPTION is client-only.** It flips `autoRenewMembership=false` in localStorage only (`src/pages/account/membership/page.tsx:1150-1175`). It never calls Stripe, and `/api/profile` strips that field (`api/_lib/profilePrivilegedFields.ts:12-13`). A Stripe subscriber who "cancels" keeps being billed. No route anywhere calls Stripe cancel or the billing portal.
4. **REDEEM on the loyalty rewards chart is fake success.** It shows a "Redeeming … for N points" modal and does nothing else. The code says `// Handle redemption logic here` (`membership/page.tsx:1624-1636`, duplicated at `:2509-2521`).
5. **There is no loyalty ledger.**
   - `profiles.loyalty_points` is privileged and guarded by a trigger, and **no server route ever increments it**. `recordProductOrderFromPaymentIntent.ts:20-28` only reads it for an email.
   - The displayed balance is client-computed: stored points + affiliate points + order totals 1:1 (`membership/page.tsx:473-474`).
   - The desktop dashboard uses a different formula (`src/utils/penthouseSuiteDashboardData.ts:320-324`), and its affiliate reader assumes an array when the data is a map, so it always returns 0 (`:300-316`).
6. **Slay Challenge is presentation only.**
   - Requirement progress booleans are **never set to true anywhere**. Only defaults and resets are written (`concierge/page.tsx:1240-1355`).
   - All state is in localStorage. There are no tables, no admin console and no fulfilment.
   - The config defines **4 tiers** with 7- or 9-task requirements (`src/config/slayChallengeTiers.ts`). The engine models tier 2 as 3 booleans, and the reveal uses `totalRequirements={3}`.
   - **There are no 3D model assets.** The "3D reward" is three pre-rendered PNGs per reward type in Supabase Storage `live-preview/Collectibles/` (`src/config/slayQuestRewardAssets.ts`). There is no three.js and no runtime ghosting/material logic.
7. **Slay Quests show hard-coded progress** (for example `5 / 7`, `5000 / 5000`) to every eligible user as if it were live (`concierge/page.tsx:385-530`).
8. **The referral program cannot work across devices.**
   - Code lookup and the $20 credit read and write `localStorage registeredUsers` and `referralEarnings` (`checkout/page.tsx:2134-2160`, `:6945-6998`).
   - The server table `referral_earnings` is read by admin but **never written** (`api/admin/referrals.ts:18`).
   - Admin "EXPORT REFERRAL DATA" is `onClick={() => {}}` (`src/pages/admin/referrals/page.tsx:254`).
9. **Affiliate approval does not award the published points.**
   - Customer copy says 400 per photo, 600 per video, 600 per social platform, with caps of 2,000 photo/video, 3,000 social and 5,000 per unit per 6-month cycle (`affiliate/page.tsx:95-150`).
   - The server approval writes `points: row.points ?? 100` into the profile JSON (`api/_lib/pendingQueueHandlers.ts:139-141`; email default 100 at `api/admin/pending-queue.ts:180`) and **never credits loyalty_points**.
   - The affiliate per-order card reads `order.pointsEarned`, which checkout fills with **purchase** points. Real customers therefore see purchase points displayed as "photo/video points" (`affiliate/page.tsx:1641-1653`, `:2394`; checkout `:2807`).
10. **POST `/api/slay-tickets/credit-order` trusts client-supplied `orderId` and `lineItems`** with no payment verification. Any premium user can mint pack tickets by posting arbitrary unique order ids (`api/slay-tickets/credit-order.ts:67-89`, `api/_lib/slayTickets.ts:150-224`). The slay-ticket checkout route also skips Stripe (`productCheckoutPolicy.ts:77-84`).
11. **Real customers' vouchers are wiped on every Account visit.** `src/pages/account/page.tsx:402-406` sets `voucherList=[]` for every non-founder account, so vouchers can exist only for the founder mock account.
12. **Hair-analysis entitlement has a single version.** No "V1/V2" membership-versioned entitlement was found. The canonical rule is 1 free analysis per UTC month for 3/6/12-month subscribers, admin unlimited, then paid credits at 1 = $20 or 4 = $60. It is **enforced server-side** through the RPC `hairstyle_analysis_try_consume` and the table `hairstyle_analysis_usage`. Docs disagree on the paid tiers (1/4 versus 1/3/6).

---

## 1. Membership model

### 1.1 Plan definitions
| Item | Value | Where |
|---|---|---|
| Plans | `3months`, `6months`, `12months` | `src/constants/subscriptionPricing.ts:5-15` |
| Prices (USD) | 280 / 520 / 960 | same; chart literals `membership/page.tsx:2091,2118,2146` (`formatPrice(280/520/960)`) |
| Stripe price ids | env `STRIPE_PRICE_ID_3MONTHS/_6MONTHS/_12MONTHS` | `docs/STRIPE_MEMBERSHIP_SETUP.md:39-44`; `api/stripe/create-checkout-session.ts:137` |
| Availability probe | `GET /api/stripe/membership-available` | `api/stripe/membership-available.ts`; client `src/utils/api.ts:285-296` |
| Entitlement lists per plan | `PREMIUM_BENEFITS_BY_TIER` | `src/constants/premiumBenefitsByTier.ts:3-51` |
| PSA chat limits | 45/10, 90/18, 180/30 (month/day) | `src/constants/psaMembershipCopy.ts:17-24` |
| Points multiplier | 12mo = 2x; else BLACK 1.5x, RED 1.25x, else 1x | `src/constants/tiers.ts:21-28` |
| Premium welcome digital cash | 3mo $10 / 6mo $20 / 12mo $40 (once per tier) | `checkout/page.tsx:6845-6848` (client) |
| Spend-tier welcome digital cash | SILVER $10 / RED $40 / BLACK $80 | `src/constants/tiers.ts:6-10` |
| Anniversary bonus | 500 / 1000 / 1500 pts at 3/6/12 months | `membership/page.tsx:194-204` (client-awarded) |
| Annual BLACK bonus | 2,500 pts if BLACK (≥4,000 spend) in both prior 6-month periods | `membership/page.tsx:206-207, 562-573` |

**Entitlement differences by plan** (`premiumBenefitsByTier.ts`):
- 6 months adds PRIORITY MESSAGES.
- 12 months adds SPECIAL OFFERS and DOUBLE YOUR POINTS.
- "EXCLUSIVE REWARDS + CHALLENGES" is listed for **all three plans**, but the concierge shows the Slay Challenge only to 6- and 12-month members (`concierge/page.tsx:1727-1728`). This conflict is founder decision FD-3.

### 1.2 Activation paths
**Path A: Stripe (authoritative)**
1. On `/account/rewards`, CONFIRM SUBSCRIPTION calls `handleUpgradeButtonClick` (`membership/page.tsx:1088-1125`). It writes `localStorage.subscriptionUpgrade` and then `navigate('/checkout/upgrade')`.
2. `/checkout/upgrade` (no route guard, `src/App.tsx:3564-3568`) shows **SUBSCRIBE WITH CARD (STRIPE)** only when the probe is available and a Supabase session exists (`checkout/page.tsx:6402-6416`). The button calls `createStripeMembershipCheckoutSession`, which calls `POST /api/stripe/create-checkout-session` (`checkout/page.tsx:1263`).
3. Server behaviour in `api/stripe/create-checkout-session.ts`:
   - New subscriber: Checkout `mode: subscription` with metadata `subscription_tier` (`:377-400`).
   - Same tier: no-op (`:222-228`).
   - **Downgrade:** subscription schedule, so the new tier starts at the renewal boundary (`:232-292`).
   - **Upgrade:** immediate update with `proration_behavior: 'none'`, billing-cycle reset and a refund of unused time (`:295-370`).
4. Webhook `api/stripe/webhook.ts:350-366`:
   - `checkout.session.completed` sets profiles `membership_type=PREMIUM`, `subscription_tier`, `subscription_period_end` and `auto_renew_membership`, and sends the `membership_welcome` email (`:26-69`).
   - `invoice.paid` refreshes tier, period end, auto-renew and status, and **inserts `membership_payments`** with kind initial or renewal (`:102-171`).
   - `invoice.payment_failed` writes `last_payment_failure_at` and inserts into `membership_payment_failures` (`:186-217`).
   - `customer.subscription.updated` writes the status (`:224-252`).
   - `customer.subscription.deleted` sets `STANDARD` and clears the tier (`:300-315`).
5. Return to `/checkout/upgrade?stripe=success` syncs the profile and routes to Rewards (`docs/STRIPE_MEMBERSHIP_SETUP.md:53`).

**Path B: in-app "CONFIRM ORDER" (non-Stripe, client-only)** — P0
- `shouldRunStripeProductPayment` returns `{run:false, blockLegacy:false}` for `isSubscriptionUpgrade` (`src/utils/productCheckoutPolicy.ts:77-84`).
- Only local card-format validation runs (`checkout/page.tsx:6533-6551`).
- `checkout/page.tsx:6818-6905` then writes `currentUser.membershipType='PREMIUM'`, `subscriptionTier`, `subscriptionEndDate = now + 3/6/12 months` and `giftCardBalance += 10/20/40` to **localStorage**, and calls `recordMembershipPayment` (localStorage demo row for Admin → Revenue).
- **No server write.** `/api/profile` strips these privileged fields (`api/_lib/profilePrivilegedFields.ts:2-50`), and the DB trigger reverts them for non-service-role callers (`supabase/migrations/20260620120000_slay_tickets.sql:85-105`).
- **Effect:**
  - Client gates (`isPremiumMemberForGatedFeatures`) treat the user as premium.
  - Server gates (PSA `api/_lib/psaPremiumCheck.ts`, hair analysis, slay-ticket purchase) treat the user as STANDARD.
- **Gap:** `STRIPE_MEMBERSHIP_SETUP.md:3` says the in-app flow exists "for demos or non-Stripe methods". In production it is fake success unless Stripe-only is enforced.

### 1.3 Renewal, expiration, cancellation, upgrade/downgrade, history
| Concern | Stripe path | In-app path | Verdict |
|---|---|---|---|
| Renewal | Stripe recurring; `invoice.paid` adds a renewal row | None (only the `subscriptionEndDate` string) | Stripe reconciled; in-app orphaned |
| Expiration | Only on `customer.subscription.deleted`. `past_due` is not downgraded by design (`STRIPE_MEMBERSHIP_SETUP.md:55`) | **No client expiry check anywhere** (grep for `subscriptionEndDate` compared with now: 0 hits) | In-app premium never expires |
| Cancellation | Only through the Stripe Dashboard. **No app route** calls `cancel_at_period_end` or the billing portal (grep: only reads at `webhook.ts:53,124,227`) | `confirmCancelSubscription` edits localStorage only (`membership/page.tsx:1150-1175`) | **BROKEN for real subscribers (P0)** |
| Upgrade/downgrade | Server-side and correct (`create-checkout-session.ts:195-370`) | A local overwrite on CONFIRM ORDER | Stripe reconciled |
| Billing history (customer) | `membership_payments` exists but **no customer view** reads it (only `src/pages/admin/revenue/page.tsx`, `src/utils/membershipPayments.ts`) | — | orphaned-admin |
| Membership history | No table, no UI | — | MISSING |
| Admin view | `/admin/revenue` → Payments merges localStorage rows with `GET /api/admin/membership-payments` (`api/admin/membership-payments.ts`; `admin/revenue/page.tsx:7,14,31-33`) | Same merge shows fake local rows | PARTIAL |
| Admin change of a member's plan | **None.** `api/admin/users.ts:39-80` only has disable, enable and password reset | — | MISSING |

### 1.4 Subscription versus spend tier, and how the gate decides
- `isPremiumMemberForGatedFeatures()` (`src/utils/premiumMemberAccess.ts:10-26`) works only from localStorage. It returns true when:
  - creative preview mode or the tutorial bypass is active; or
  - `isSignedIn==='true'` **and** (`getEffectiveSubscriptionTier(user) != null` **or** `getEffectiveTierName(user) === 'BLACK'`).
- `getEffectiveSubscriptionTier` (`src/utils/adminAuth.ts:477-489`):
  - For non-founder users it returns `user.subscriptionTier`. Otherwise, if `membershipType==='PREMIUM'`, it returns **'12months'**, so an unknown premium is treated as the best tier (founder decision FD-6).
  - For the founder it reads `localStorage.adminSubscriptionOverride`.
- `getEffectiveTierName` (`adminAuth.ts:457-471`) reads `user.currentTierName`, `user.tier` or `localStorage lastKnownTier_<email>`. The founder also gets `adminTierOverride`.
- **The spend tier is computed client-side** from localStorage orders (`membership/page.tsx:434-470`, `:760-800`; thresholds SILVER 1,000 / RED 2,000 / BLACK 4,000 purchase points in the current Jan–Jun or Jul–Dec period) and persisted to `localStorage lastKnownTier_` (`:873`; `src/pages/account/page.tsx:999`).
- **Server mirror:** `api/_lib/psaPremiumCheck.ts:18-29` accepts `current_tier_name==='BLACK'`, `membership_type==='PREMIUM'` or a valid tier. `current_tier_name` is privileged (`profilePrivilegedFields.ts:16-17`) and **no API writes it** (grep `current_tier_name` in `api/`: only reads and mapping).
- **Result:** BLACK-tier premium works client-side only (orphaned-customer).

### 1.5 Admin overrides (founder test toggles, not admin tools)
- `adminSubscriptionOverride` (STANDARD/3/6/12) and `adminTierOverride` (RED/SILVER/BLACK) are rendered only when `showTierColorsForAdmin = isAyoteenzAdminAccount(userData) && !founderViewAsClient` (`membership/page.tsx:1036-1048`, toggles `:2668-2685`, `:2955-2975`, `:3040-3055`).
- `syncAdminSubscriptionOverrideToSupabase` (`src/utils/adminSubscriptionOverrideSync.ts:55-61`) calls `patchProfile({membershipType, subscriptionTier})`, which is **stripped by `/api/profile`** (`api/profile.ts:241`, `profilePrivilegedFields.ts:4-7`) and blocked by the trigger.
- The Supabase "sync" is therefore a **server no-op**. PSA works for the founder only because of `isFounderPsaPremiumBypass` (`api/_lib/psaPremiumCheck.ts:31-35`).
- CORE.md:15 claims these toggles "sync to Supabase". The code shows they do not.
- **Verdict:** founder-only test toggles that operate on the founder's own account. They are not admin tools for customers.

---

## 2. Hair-analysis entitlement versions
- **Versions:** no membership-versioned (V1/V2) entitlement definitions exist. Searched `entitlement`, `V1`, `V2`, `analysis credit`, `bonus`, `MEMBERSHIP_V*` across `src/constants`, `src/config`, `src/utils`, `api/_lib`, `docs`; only unrelated `_v1` storage keys were found. **The single canonical definition is `api/_lib/hairstyleAnalysisEntitlement.ts`.**
- **Rule:**
  - `HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT = 1` per UTC month (`:14`).
  - Eligible only if `subscription_tier ∈ {3months, 6months, 12months}` (`:16-20, :37-41, :62-71`).
  - Admin emails and the founder are unlimited (`:31-34`).
- **Consequences:**
  - `membership_type=PREMIUM` without a tier, or BLACK-only, is **not eligible**. This differs from the PSA gate and from the client gate.
  - Non-subscribers who buy paid credits receive a **403** on generate (`api/hairstyle-analysis-generate.ts:190-191`), so their credits are unusable (founder decision FD-7).
- **Usage storage:**
  - Table `hairstyle_analysis_usage(user_id, month_key, month_count, paid_credit_queue int[])` (`supabase/migrations/20260610120000_hairstyle_analysis_usage.sql`, `20260610140000_hairstyle_analysis_paid_credits.sql:4`).
  - RPCs `hairstyle_analysis_try_consume`, `_refund_consume`, `_grant_purchase_credits` (`api/_lib/hairstyleAnalysisUsage.ts:57-160`).
  - **Server-enforced** on `POST /api/hairstyle-analysis-generate` (consume `:210`, 402 when exhausted `:212`, refund on failure `:244`). `GET /api/hairstyle-analysis-usage` reports it (`api/hairstyle-analysis-usage.ts`).
  - If service role is missing, it falls back to an **in-memory rate limit** (`hairstyleAnalysisUsage.ts:103-117`), which is not durable across lambdas.
- **Paid credits:**
  - `HAIRSTYLE_ANALYSIS_PURCHASE_TIERS` = 1 comparison $20, 4 comparisons $60 (`api/_lib/hairstyleAnalysisPricing.ts:2-16`).
  - Granted by the Stripe webhook from `payment_intent.succeeded` (`api/stripe/webhook.ts:290`, `api/_lib/hairstyleAnalysisCheckoutGrants.ts`).
  - **Conflict:** `docs/architecture/PRODUCT_AND_PRICING_GENOME.md:121` says "1 / 3 / 6 comparisons $20/$40/$60", while `docs/STYLE_ANALYSIS.md:63` and the code say 1/$20 and 4/$60.
- **"Bonus Hairstyle Analysis Credit"** is offered by Slay Challenge tier 2 and Slay Quests (`slayChallengeTiers.ts:60`, `concierge/page.tsx:564,602`). **There is no grant path:** the only writer to `paid_credit_queue` is the Stripe grant RPC. This is copy only.
- **Separate feature, not to be confused with the above:** PSA selfie analysis "pick counts" 4/6/10 by term (`docs/STYLE_ANALYSIS.md:34-41`).

---

## 3. Loyalty ledger
| Aspect | Finding | Evidence |
|---|---|---|
| Stored balance | `profiles.loyalty_points` (int/numeric) exists, but is **privileged + trigger-frozen** for clients | `supabase/migrations/20260325120000_full_app_sync.sql:34`; `20260620120000_slay_tickets.sql:80,93`; `profilePrivilegedFields.ts:19-20` |
| Server writers of loyalty_points | **None.** Only a read for the "points_earned" email balance | `api/_lib/recordProductOrderFromPaymentIntent.ts:20-28` (falls back to pointsEarned when balance 0) |
| Ledger table | **None.** No `loyalty_ledger` or `points_transactions` exists. Only JSON arrays `currentUser.loyaltyPointRewardHistory` and `awardedLoyaltyRewardIds` in localStorage | `membership/page.tsx:586-639` |
| Displayed balance (mobile Rewards) | `userData.loyaltyPoints + calculateTotalAffiliatePoints() + getPointsFromSpend()` | `membership/page.tsx:473-474` |
| Purchase points | Computed as **order.total 1:1** from localStorage orders in the current period (`:448-466`, history rows `:677-683`). Checkout separately computes `pointsEarned = round(eligibleNet × multiplier)` and stores it on the order (`checkout/page.tsx:3001-3007`, `:2807`). **The two disagree:** multiplier, eligibility exclusions and gift-card or membership exclusions are ignored by the display | as cited |
| Desktop balance | `storedPoints + spending` with a different history source (`user.pointsHistory`). The affiliate reader treats the per-order map as an array, so it always returns 0 | `src/utils/penthouseSuiteDashboardData.ts:300-324` |
| 2X points | Implemented only as a 12-month multiplier on the checkout-computed `pointsEarned` (`src/constants/tiers.ts:21-28`; `checkout/page.tsx:1934-1948`). It does not affect the displayed balance. "2X/2.5X/3X POINTS NEXT PURCHASE" rewards have **no implementation** | grep `2X POINTS NEXT`: config and concierge only |
| Client-awarded bonuses | Anniversary and Annual BLACK awards are written to **localStorage currentUser.loyaltyPoints** on Rewards page load, idempotent by id (`membership/page.tsx:583-657`). They never reach the server (privileged) | — |
| Reversal | `reverseLoyaltyForDeclinedOrder` edits localStorage (`src/utils/orderFormDeclineCancelRefund.ts:130-138`) | — |
| Redemption | **Fake.** REDEEM shows a modal only (`membership/page.tsx:1624-1636`, `:2509-2521`, modal `:3172-3181`). Checkout does **not** redeem points (grep `redeem.*point` in checkout: 0 hits) | P0 |
| Expiration | Copy only: "VOUCHERS… VALID FOR 6 MONTHS…" (`membership/page.tsx:2362`). The `points_expiring` email template exists (`api/admin/rewards-notify.ts:24-26`), but **no expiry logic** exists | — |
| "More ways to earn" | `EARN_TASKS` 50/100/150/200/250 (`membership/page.tsx:219-228`). The links only call `recordSocialClick` analytics (`:2924`). **No award** | Hard-coded numbers presented as earnable |
| Mock loyalty data | Founder: hard-coded affiliate orders 2000/400/2000/2000 points (`membership/page.tsx:366-396`); affiliate mock orders (`affiliate/page.tsx:375-565`, `:644-955`); account vouchers seed (`account/page.tsx:384-396`); `accountAlertsCatalog.ts:41` sample "2,450" | — |
| One ledger shared by customer and admin? | **No.** Customer mobile, customer desktop, checkout and admin (`admin/pending/page.tsx:293-334` computes pending points from the **admin's own** localStorage keyed by client email) all compute differently | **orphaned / client-only** |

---

## 4. Rewards catalogue
| Reward | Defined where | How unlocked | How redeemed or fulfilled | Server-enforced? | Verdict |
|---|---|---|---|---|---|
| Vouchers (1X COLOR/HAIRLINE/STYLING/FLEXIBLE CAP) | Loyalty chart `membership/page.tsx:172-183`; Slay Challenge tiers; checkout reads `voucherList` (`checkout/page.tsx:1463-1474`) | Founder mock seed only (`account/page.tsx:384-396`). **Non-founder voucherList is force-cleared to [] on every Account load** (`account/page.tsx:397-406`) | Checkout applies from localStorage list | `voucher_list` is privileged; no server writer; expiry cron scans an always-empty server list (`api/_lib/email/expiringRewardsScan.ts:24,69`; `api/cron/expiring-rewards-emails.ts`) | **BROKEN for customers (P0)** |
| Free Gift (loyalty 5,000 / 45,000 pts; concierge "choose gift") | `membership/page.tsx:173,181`; concierge `selectedFreeGift` (`concierge/page.tsx:1130`) | Points threshold (fake redeem) or concierge pick | `selectedFreeGift` is **never read** outside concierge (grep: 0 hits) | No | PLACEHOLDER |
| Birthday gift (points or gift card) | concierge `:1137-1145, 1677-1700, 3220-3255` | Premium within 12 months | Sets localStorage `birthdayGiftClaimed` and a confirmation modal; never fulfilled | No | PLACEHOLDER (fake success) |
| 2X points | `tiers.ts:21-28`; Slay tier 2 "2X POINTS NEXT PURCHASE", tier 3 2.5X, tier 4 3X | 12-month plan; Slay selection | 12-month multiplier on checkout `pointsEarned` only; "next purchase" variants are unimplemented | No | PARTIAL / copy only |
| Early Access | Slay Quests, brand copy | — | No gating code (grep `earlyAccess` only lounge/marketing copy) | No | PLACEHOLDER |
| Expedited processing | Slay tier 2 "PRIORITY ORDER PROCESSING UPGRADE"; asset type `free_expedited_processing` | — | No checkout or orders consumer (grep 0) | No | PLACEHOLDER |
| Free shipping (credit) | Slay tier 1 "FREE SHIPPING CREDIT"; premium "DISCOUNTED SHIPPING" | — | No consumer for a credit (grep 0) | No | PLACEHOLDER |
| Mystery reward | Slay tiers and Quests; asset `mystery_reward` | — | None | No | PLACEHOLDER |
| Digital Cash | `profiles.gift_card_balance` (privileged); loyalty chart $100/$200; Slay $40/$60/$80; referral $20; welcome $10–$80 | Client writes to localStorage (checkout `:6845-6866`, referral `:6955-6967`) | Applied at checkout from localStorage `giftCardBalance` (`checkout/page.tsx:1459-1462`, deduct `:6907-6930`) | **No server writer** of `gift_card_balance` (grep) | client-only (P0 integrity) |
| Bonus hair-analysis credits | Slay tier 2; Quests | — | No grant path (see §2) | Paid credits are server-side, bonus is not | PLACEHOLDER |
| Digital collectibles | `user_collectibles` table; Slay "EXCLUSIVE DIGITAL WALLPAPER / MEMBER COLLECTIBLE" | Only education season certification writes them (`api/_lib/educationCertifications.ts:270-290`, `source_type:'education'`) | Display in gallery | Yes for education; **no writer for `slay-challenge` / `reward` / `special`** | PARTIAL |
| Discount codes (10/30/50% OFF UNIT) | Loyalty chart `membership/page.tsx:174,179,183` | Fake redeem | None | No | PLACEHOLDER |
| Special Offer ($40 off, 60-day) | Admin → Marketing / `api/special-offer-config.ts`; concierge `:1406-1510`, claim `:1606-1660` | 6/12-month premium | Adds a special-offer cart line (client price) | Config is server-side; the discount price is client-side | PARTIAL (out of primary scope) |

---

## 5. Slay Challenge and the "3D" asset reveal

### 5.1 Canon versus code
- CORE.md:60 says: "Slay Challenge (6-month cycles, reward selection) … Founder-privileged admin can override Slay Challenge stage for testing."
- The audit brief says: "three requirements and three reveal phases".
- **Code (`src/config/slayChallengeTiers.ts:17-111`) has 4 tiers:**

  | Tier | Requirement |
  |---|---|
  | 1 DISCOVER | 5/7 tasks |
  | 2 ENGAGE | 4/7 tasks |
  | 3 ELEVATE | 5/9 tasks |
  | 4 ICON | 6/9 tasks |

  Each tier has a 5–7 item reward pool. Some copy is internal and leaks to customers ("THEY ONLY NEED…", `:46,69,90`).
- **The engine models something else (`concierge/page.tsx`):**
  - Tier 1: 7 booleans (`purchase, review, hairstyleAnalysis, psaUse, wishlist, digitalCash, newsletter`), complete at ≥5 (`:282-301, 1265-1267`).
  - Tier 2: **3 booleans** (`purchase, review, socialTag`) that must all be true (`:1254-1268`). The config says 4/7.
  - Tiers 3 and 4: **never reachable**. The index is capped at 2, and index 2 still shows the tier-2 label (`:1269-1283`).
- **Reveal:** `SlayQuestRewardAsset` is called with `totalRequirements={3}` (`concierge/page.tsx:6079-6084`). Phase is computed as `min(completed, 3)`:
  - phase2 at ≥2 (`max(2, floor(3×0.75))`), phase3 at 3 (`src/config/slayQuestRewardAssets.ts:41-54`).
  - With tier 1's 7 tasks, 3 of 7 complete would already show **UNLOCKED** while the tier needs 5.

  This is the source of the "three requirements / three phases" model, and it **conflicts** with the 4-tier config (FD-1).

### 5.2 Lifecycle (all localStorage, per device)
| Step | Implementation | Evidence |
|---|---|---|
| Cycle | Jan–Jun / Jul–Dec. Selection window = last 3 days of the cycle | `concierge/page.tsx:1147-1180` |
| Reward options | **2 random rewards** from the tier pool via `Math.random`, cached per device in `slayChallengeRewardOptions:<cycle>:tierN` | `:316-325, 1181-1204` |
| Selection | `handleSlayChallengeRewardSelect` writes localStorage (`slayChallengeRewardSelection:*`, legacy `slayChallengeTier1Reward`) | `:1316-1333` |
| Start | START CHALLENGE (`handleSlayChallengeConfirmSelection`) sets `slayChallengeSelectedCycle = next cycle` and resets progress | `:1335-1347`, button `:6110-6125` |
| Requirement completion | **Not implemented.** `setSlayChallengeTier1Progress` / `setSlayChallengeTier2Progress` are only called with defaults (`:1342-1343`). No other module writes `slayChallengeTier*Progress` (grep) | P1 |
| Unlock / posting / fulfilment | None. No server table (grep `slay_challenge` in migrations: only `user_collectibles.source_type` CHECK) | — |
| Expiration | Cycle-label mismatch clears progress (`:1242-1247`) | — |
| Fraud prevention | None (localStorage) | — |
| Admin adjustment | Founder-only stage `<select>` (selection / selected_waiting / active / closed / collectibles) stored in `localStorage.slayChallengeAdminStage` (`:1286-1314, 6022-6045`). There is no `/admin` surface (grep in `src/pages/admin`: 0) | founder test toggle |
| Notifications | None. Asset copy `psaSuccessMessage` is display text only (`slayQuestRewardAssets.ts`) | — |
| Eligibility | 6 and 12 months only (`concierge/page.tsx:1727-1728, 6004-6005`) | Conflicts with 3-month benefits list (FD-3) |

### 5.3 "3D" reward assets and the reveal
- **No `.glb`, `.gltf` or `.usdz` in `public/`.**
  - The only `.glb` files in the repo are studio-OS world-fabrication benchmarks (`src/studio-os-core/world-fabrication-engine/benchmarks/**`), which are unrelated.
  - `package.json` has no `three`, `@react-three/*` or `model-viewer`.
- **Asset storage:** each of the 10 reward types has 3 PNG URLs (`phase1Url`, `phase2Url`, `phase3Url`) in Supabase Storage at `https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/…` (`src/config/slayQuestRewardAssets.ts:56-176`).
  - Types: loyalty_points, free_voucher, free_gift, double_points, exclusive_digital_wallpaper, mystery_reward, free_expedited_shipping, free_expedited_processing, bonus_hairstyle_analysis, digital_cash.
- **Reveal implementation** (`src/components/account/SlayQuestRewardAsset.tsx:79-175`):
  - Picks one of three static images by phase and renders `<img objectFit: contain>`.
  - Shows a pulsing skeleton while loading and an icon fallback on error. Labels: "LOCKED / IN PROGRESS", "75% COMPLETE", "UNLOCKED".
- **Verification of the requested reveal behaviour** ("full object visible across phases; unlocked sections get material/color; locked sections ghosted"): **NOT IMPLEMENTED in code.**
  - There is no section-level material, opacity or mask logic.
  - Any ghosting or partial colouring would have to be **baked into the three PNGs**. Whether the art does this is **UNVERIFIED** because images were not fetched (network prohibited).
- Mapping from reward label to asset type: `src/utils/slayChallengeRewardAssetMap.ts:9-71`.
- Admin preview of all phases: `src/components/account/SlayChallengeCollectiblesPreview.tsx` (founder stage "collectibles").

### 5.4 Slay Quests (concierge, shown to all signed-in concierge users)
- 18 quests × 4 levels with point and badge rewards (`concierge/page.tsx:540-696`).
- Progress is **hard-coded** in `SLAY_QUEST_META` (for example `progressCurrent: 5`, `5000`, `10`; `:385-530`) and rendered as live "CURRENT LEVEL x / y" bars (`:720-790`).
- **Fake progress presented as live (P0 trust).** No awarding logic exists.

---

## 6. Collectibles (`/account/collectibles`)
- **Page:** `src/pages/account/collectibles/page.tsx:1-38` is a thin wrapper around `CollectiblesGallery`.
- **Reachable from:** Account hub card (`src/pages/account/page.tsx:1166`), desktop Rewards Room (`src/components/desktop-rewards/RewardsRoomCertificationWall.tsx:79,130`) and the penthouse dashboard (`penthouseSuiteDashboardData.ts:364`).
- **Data:** `GET /api/collectibles` (auth required, service role). It joins `user_collectibles` and `education_certifications` with `EDUCATION_COLLECTIBLE_DEFINITIONS` (`api/collectibles/index.ts:27-80`). Tables: `supabase/migrations/20260809180000_education_certifications_collectibles.sql:35-80` (RLS on). `source_type` CHECK allows `education | slay-challenge | reward | promotion | special` (`:63-64`).
- **Writers:** only `api/_lib/educationCertifications.ts:270-290` (education season certification through `api/education/episode-completion.ts`).
- **Filters:** ALL, CERTIFICATIONS, REWARDS, SLAY CHALLENGE, SPECIAL (`CollectiblesGallery.tsx:8-14`). The non-education filters are hidden when empty (`:23-31`), so they never appear.
- **Stats:**
  - `seasonsCompleted` equals `certificationsEarned`; both are counted the same way (`api/collectibles/index.ts:71-75`).
  - The hook swallows non-OK responses and shows an empty state (`useUserCollectibles.ts:43-48`), so errors are indistinguishable from "no collectibles".
- **Slay Challenge collectible art** (§5.3) is **not connected** to `user_collectibles`.
- **Verdict:** working for education certifications; disconnected from the rewards and Slay Challenge it advertises.

---

## 7. Referral

**Customer side: `/account/referrals`** (`src/pages/account/referrals/page.tsx`, 587 lines)
- Copy: "$20 off their first order. You get $20 digital cash when their order is confirmed" (`:417`). It also says "active only after your order has been marked complete & delivered. If a referred friend's order is canceled, you won't receive the $20" (`:514`).
- Code status: active if any local order is **DELIVERED or SHIPPED**, or if the user has orders without `hasMadeFirstPurchase` (`:130-155`). This contradicts the copy "complete & delivered" (FD-9).
- The code is generated client-side from initials, birthday digits and phone, with a collision check against **local `registeredUsers`** (`:157-196`).
- Earnings list comes from `localStorage referralEarnings` (`:92, :121`).

**Checkout**
- `getReferralCodeOwner` searches **localStorage `registeredUsers`** (`checkout/page.tsx:2134-2160`).
- First-purchase check uses local `userOrders_*` (`:2163-2178`).
- Own-code block exists (`docs/REFERRAL_AFFILIATE_REWARDS_SECURITY_ASSESSMENT.md §1.1`).
- The $20 credit is written to the referrer's record **in the buyer's browser localStorage** plus local `referralEarnings` (`checkout/page.tsx:6945-6998`).
- **On a real site the referrer will not exist in the buyer's browser, so codes fail ("not found") cross-device, and any credit is invisible to the referrer.**

**Server**
- `referral_earnings` table (`supabase/migrations/002_admin_gaps.sql:75-90`) has **no writer** in `api/` or `src/`.
- `GET /api/admin/referrals` reads it (`api/admin/referrals.ts:18-48`).
- No server referral validation in quote or checkout (grep `referral` in `api/checkout`, `api/_lib/pricing`: 0).

**Admin: `/admin/referrals`** (`src/pages/admin/referrals/page.tsx`)
- Uses the API, falling back to the **admin's own localStorage `referralEarnings`** (`:33-75`).
- EXPORT REFERRAL DATA is `onClick={() => {}}` (`:251-258`).

**Other**
- Revocation on cancel or refund: none, even though the copy promises it (security doc §1.4).
- Loyalty-chart "REFER A FRIEND +100" (`membership/page.tsx:221`) and Slay Quests "250 pts / $10 / $25" (`concierge/page.tsx:619-625, 681-687`) conflict with $20 digital cash (FD-9).
- **Verdict:** client-only, orphaned on both sides. Maturity: PARTIALLY_IMPLEMENTED (customer), SHELL_ONLY (admin).

---

## 8. Affiliate policy and enforcement

### 8.1 Current policy (customer copy, `src/pages/account/affiliate/page.tsx:88-170`)
- **Photo:** 400 points per approved photo (`:95`).
- **Video:** 600 points per approved video; "Maximum Earnings: Up to 5,000 points per unit during each 6-month reward cycle" (`:100-101`).
- **Social:** 600 points per approved platform per unit; "Up to 3,000 points per product across all eligible social media platforms" (`:150, :160`). Platforms: IG, TikTok, YouTube, FB, X.
- **Featured Creator Bonus:** up to 1,500 points (`:165-170`). **No implementation** (grep).
- **Code caps:**
  - 2 photos × 400 = 800 and 2 videos × 600 = 1,200, so photo/video is capped at 2,000 (`:1650-1652`, `:2394-2400`).
  - Socials: 5 × 600 = 3,000.
  - Total available: `5000` hard-coded (`:2243, :2337`).
  - 6-month period reset (`:1627-1653`).
- This matches the historical policy (400 photo / 600 video and social, per-unit caps), so **the copy is current**.

### 8.2 Enforcement
- **Submit** (`handleSubmitContent`, `:1159-1560`):
  - Saves content with media stored as **base64 data URLs** in `localStorage affiliateSubmittedContent:<email>` (`:1107-1149`).
  - Enqueues local mock admin items (`:1529`).
  - **Fire-and-forget** `POST /api/client/submissions {kind:'affiliate', items, affiliateContent}` only when Supabase and a token exist. Errors go to the console only (`:1539-1550`).
  - Then **always shows "Content submitted successfully!"** (`:1556`). This is fake success whenever the server write fails or is skipped.
- **Server** (`api/client/submissions.ts:79-105`):
  - Inserts `pending_affiliate_submissions` rows (status pending, client `payload`).
  - **Overwrites `profiles.affiliate_submitted_content` with the client-supplied map**, including any client-set `status`/`points`.
  - `email` can come from the body (`:82`).
  - Sends the `affiliate_content_pending` email.
  - `affiliate_submitted_content` is also writable through `PATCH /api/profile` because it is not privileged (`api/profile.ts:117,170`; not in `profilePrivilegedFields.ts`).
- **Admin approve/decline** at `/admin/pending` → AFFILIATE tab, then `PATCH /api/admin/pending-queue` (`src/pages/admin/pending/page.tsx:948-990, 1028-1036`; `api/admin/pending-queue.ts:135-185`):
  - Sets the row status, writes `admin_decline_reason`, writes the audit log `pending_affiliate.approve|decline` (`:158-166`) and emails `affiliate_content_approved|denied`.
  - The profile JSON item becomes `status:'approved', points: row.points ?? 100` (`api/_lib/pendingQueueHandlers.ts:114-145`), and the client mirror does the same (`src/utils/adminPendingClientSync.ts:82`).
  - **The points are wrong (100 instead of 400 or 600) and loyalty_points is never credited.**
  - Decline stores `rejectionReason` (`pendingQueueHandlers.ts:148-178`). The email default is "DOES NOT MEET GUIDELINES" (`pending-queue.ts:182`).
- **Duplicate prevention:**
  - The approve handler does not check `status='pending'` before applying (`pending-queue.ts:136-147`). Re-approval is harmless only because no points are credited.
  - Client delete of a submission is localStorage-only (`affiliate/page.tsx:4185-4245`); the server pending row stays approvable.
- **Points display bug:** real customers' per-order "photo/video points" equal `min(2000, order.pointsEarned)`, and checkout sets `order.pointsEarned` to **purchase** loyalty points (`checkout/page.tsx:2807`). The period guard is skipped when no period is set (`affiliate/page.tsx:1627-1653`), so purchase points appear as content points (`:2394`).
- **Admin pending points tally** reads the **admin browser's** localStorage per client email (`admin/pending/page.tsx:278-334`), so it shows 0 for real clients.
- **Mock data:** founder mock orders and content (`affiliate/page.tsx:375-565, 644-955`).
- **Verdict:** submission and admin queue are reconciled (server table + audit + email). Points policy is **client-only, unenforced, and contradicted by the server default of 100**.

---

## 9. Slay Tickets
- **What they are:** a virtual currency for Lounge TV content unlocks (rewatch cost 1 ticket, 365-day library access; `api/_lib/slayTickets.ts:226-240`).
- **Ledger:**
  - `profiles.slay_ticket_balance` (privileged, trigger-guarded).
  - `slay_ticket_transactions` (types earned / used / purchased / adjusted / expired).
  - `lounge_content_unlocks` (`supabase/migrations/20260620120000_slay_tickets.sql`; `api/_lib/slayTickets.ts:7,137,259-350`).
- **Purchase:**
  - `/tools/slay-tickets` (`src/pages/tools/slay-tickets/page.tsx`, packs from `src/utils/slayTicketPacks.ts:19-60`, 4- and 8-ticket packs, unit-price based) leads to `/checkout/slay-tickets` (`App.tsx:3583`).
  - **Stripe is skipped for this route** (`productCheckoutPolicy.ts:77-84`), so only the local card-format check runs.
- **Credit:**
  - `POST /api/slay-tickets/credit-order {orderId, lineItems}` is called by checkout with `orderId = 'order-'+localOrderNumber` (`checkout/page.tsx:2879-2885`).
  - Server side it requires premium for packs (`credit-order.ts:75-81`), then credits from **client lineItems**, de-duplicated only by `(user, related_order_id, type)` (`slayTickets.ts:150-224`).
  - **No payment proof:** a premium user can mint tickets with arbitrary orderIds (P0).
  - Device-local order numbers can **collide** across devices (`order-12`), so a legitimate second purchase may be silently de-duplicated.
- **Hair-purchase earning** (+2 tickets per hair unit) has been deprecated since `2026-08-09T00:00:00Z` (`src/content/education/commerce/slayTicketEconomyPolicy.ts:10-36`). `credit-order` does not pass `orderPlacedAt`, so "now" is used and earning is off.
- **Admin adjustment:** the `adjusted` type exists, but **no admin route** writes it (grep).
- **Relation to rewards:** none of the Slay Challenge, loyalty or quest rewards grant tickets. Premium gating only (`isPremiumGatedCartLine` `premiumMemberAccess.ts:44-50`).

---

## 10. Mirror matrix rows
| # | Capability | CUSTOMER ACTION | ADMIN COUNTERPART (route + control) | SHARED DATA SOURCE | STATE TRANSITIONS | AUTHORIZATION | NOTIFICATIONS | AUDIT HISTORY | VERDICT |
|---|---|---|---|---|---|---|---|---|---|
| M1 | Subscribe (Stripe) | Rewards → CONFIRM SUBSCRIPTION → /checkout/upgrade → SUBSCRIBE WITH CARD | /admin/revenue Payments list (read) | `profiles.membership_type/subscription_tier/subscription_period_end/auto_renew_membership/stripe_*`; `membership_payments` | STANDARD → PREMIUM(tier) → renew / downgrade-scheduled / deleted → STANDARD | Server (Bearer + Stripe signature) | `membership_welcome` email (webhook.ts:64-69) | `membership_payments`, `membership_payment_failures` | **reconciled** (no admin edit) |
| M2 | Subscribe (in-app CONFIRM ORDER) | Same page, CONFIRM ORDER | Admin Revenue shows localStorage demo row | localStorage `currentUser`, `membershipPayments` | Local only | Client only | None | None | **client-only (P0 fake success)** |
| M3 | Cancel subscription | Rewards → CANCEL SUBSCRIPTION → CONFIRM | None | localStorage `autoRenewMembership` | Local flag only | Client only | None | None | **orphaned-customer / BROKEN** |
| M4 | Change tier | CHANGE / UPGRADE SUBSCRIPTION | None | Stripe + profiles | Upgrade now / downgrade at renewal | Server | None for change | `membership_payments` | reconciled (Stripe) |
| M5 | Spend tier SILVER/RED/BLACK | Passive (purchases) | Founder toggle only | localStorage `lastKnownTier_*`; server `current_tier_name` never written | Recomputed per 6-month period client-side | Client only | None | None | **client-only** |
| M6 | Founder subscription/tier override | Founder toggles on Rewards | n/a | localStorage `adminSubscriptionOverride`, `adminTierOverride`; PATCH stripped | Local | Founder email check (client) | None | None | founder-test toggle |
| M7 | Hair-analysis monthly entitlement | Generate analysis | None (admins bypass) | `hairstyle_analysis_usage` | count++ per UTC month; paid queue pop; refund on failure | **Server** RPC | PSA status copy | Table row only | reconciled-customer / orphaned-admin |
| M8 | Loyalty balance | View Rewards | None | localStorage composite; `profiles.loyalty_points` frozen | Client awards only | Client | `points_earned` email (Stripe product) shows stale balance | None | **client-only** |
| M9 | Redeem points | REDEEM | None | none | none | — | none | none | **PLACEHOLDER (fake success)** |
| M10 | Vouchers | Use at checkout | `rewards-notify` email only | localStorage `voucherList`; `profiles.voucher_list` privileged, never written | Seeded (founder) / wiped (others) | Client | `voucher_expiring` cron (empty) | None | **BROKEN** |
| M11 | Digital cash | Apply at checkout | None | localStorage `giftCardBalance`; `profiles.gift_card_balance` frozen | Client +/− | Client | None | localStorage `digitalCashHistory` | **client-only** |
| M12 | Slay Challenge select/start | Pick reward → START CHALLENGE | Founder stage select (concierge) | localStorage `slayChallenge*` | selection → selected_waiting → active → closed (labels only) | Client | None | None | **client-only / orphaned** |
| M13 | Slay Challenge progress/unlock | (none possible) | None | none | never advances | — | — | — | **PLACEHOLDER** |
| M14 | Slay Quests | VIEW LEVELS | None | hard-coded `SLAY_QUEST_META` | static | — | — | — | **PLACEHOLDER (fake progress)** |
| M15 | Collectibles (education) | View gallery / filter | None | `user_collectibles`, `education_certifications` | issued on season certification | Server | Certification reveal modal (lounge) | rows | reconciled-customer / orphaned-admin |
| M16 | Referral code use + $20 | Apply code at checkout | /admin/referrals (read), EXPORT no-op | localStorage `registeredUsers`, `referralEarnings*`; `referral_earnings` (never written) | confirmed at order (client) | Client | `referralNewActivity_*` local flag | none | **orphaned both sides** |
| M17 | Affiliate submit | Upload photo/video/social → SUBMIT | /admin/pending AFFILIATE tab | `pending_affiliate_submissions`, `profiles.affiliate_submitted_content`, localStorage mirror + mock queue | pending → approved/declined | Server Bearer (submit), requireAdmin (decide) | pending / approved / denied emails | `audit_log` `pending_affiliate.*` | **reconciled (workflow)** |
| M18 | Affiliate points award | (implicit on approval) | Approve button | JSON `points ?? 100`; no loyalty write | none effective | — | email shows `points ?? 100` | audit row | **disconnected (P0 policy mismatch)** |
| M19 | Slay tickets purchase/credit | Buy pack → checkout | None | `slay_ticket_transactions`, `profiles.slay_ticket_balance` | earned/purchased/used | Server auth + premium check, **no payment proof** | None | transactions table | reconciled-customer / orphaned-admin / exploitable |
| M20 | Birthday gift | Select points/gift card → confirm | None | localStorage | claimed flag | Client | Modal only | None | **PLACEHOLDER** |
| M21 | Free gift | Choose gift | None | localStorage `selectedFreeGift` | never consumed | Client | None | None | **PLACEHOLDER** |
| M22 | Membership billing history | (none) | /admin/revenue Payments | `membership_payments` | — | admin API | — | table | orphaned-admin |

---

## 11. Controls classification

### 11.1 `/account/rewards` (`src/pages/account/membership/page.tsx`)
| Control | Class | Evidence |
|---|---|---|
| Header ACCOUNT / WISHLIST / back / breadcrumbs / mobile menu | WORKING | `:1253-1458` navigate calls |
| Loyalty rewards card open/close | WORKING | `:1502` |
| REDEEM (×10, two copies) | **PLACEHOLDER — fake success** | `:1624-1636`, `:2509-2521` ("Handle redemption logic here") |
| Premium chart SELECT/DESELECT 3/6/12 | WORKING (UI state) | `:2093-2160` |
| SEE ALL BENEFITS toggle / benefits modal | WORKING | `:1755`, `:2836`, `:2269` |
| CONFIRM SUBSCRIPTION → /checkout/upgrade | WORKING (navigation + localStorage handoff) | `:1088-1125`, `:3090` |
| CHANGE / UPGRADE SUBSCRIPTION | WORKING (opens chart) | `:1127-1143` |
| CANCEL SUBSCRIPTION → CONFIRM | **BROKEN / client-only** | `:1145-1175`, modal `:3160-3170` |
| Close premium view | WORKING | `:1215-1224`, `:1692` |
| Founder tier toggles RED/SILVER/BLACK | WORKING as founder test (localStorage) | `:2668-2685` |
| Founder subscription toggles STD/3/6/12 | PARTIAL (local works, Supabase sync no-op) | `:1050-1058`, `:2955-2975`, `:3040-3055` |
| Points history back-to-top | WORKING | `:2627` |
| More-ways-to-earn social links | PARTIAL (open link + analytics; **no points**, numbers hard-coded) | `:219-228`, `:2924` |
| Membership status / points / next tier figures | UNVERIFIED-live; client-computed from localStorage, founder mock values | `:351-474`, `:749-800` |
| Currency selector | WORKING (local) | `:888-950` |

### 11.2 `/account/collectibles`
| Control | Class | Evidence |
|---|---|---|
| ← Account | WORKING | `collectibles/page.tsx:12-32` |
| Filter ALL / CERTIFICATIONS | WORKING | `CollectiblesGallery.tsx:8-31,211-227` |
| Filter REWARDS / SLAY CHALLENGE / SPECIAL | UNREACHABLE (hidden; no writers) | same |
| Collectible cards | WORKING (education only) | `api/collectibles/index.ts` |
| Error state | PARTIAL (errors shown as empty) | `useUserCollectibles.ts:43-48` |

### 11.3 `/account/referrals`
| Control | Class | Evidence |
|---|---|---|
| ACTIVE / PAST tabs | PARTIAL (local `referralEarnings` only) | `referrals/page.tsx:443-470` |
| Rules scroll link | WORKING | `:488` |
| INVITE → modal | WORKING | `:522-570` |
| COPY LINK / COPY CODE | WORKING (clipboard) but the code is not valid cross-device | `:550-558`, checkout `:2134` |
| Code ACTIVE/INACTIVE badge | PARTIAL (local orders; SHIPPED counts, contrary to copy) | `:130-155` |
| Earnings numbers | client-only | `:92-123` |

### 11.4 `/account/affiliate`
| Control | Class | Evidence |
|---|---|---|
| Order list expand (3 entry points) | WORKING | `affiliate/page.tsx:3984-4006` |
| Close expanded order | WORKING | `:2271` |
| Photo 1/2, Video 1/2 file pickers | WORKING (local data URLs) | `:2428, 2561, 2728, 2861` |
| Social link inputs | WORKING (local) | `:1159-1170` |
| SUBMIT CONTENT | PARTIAL — server write is fire-and-forget, **success is always shown** | `:1529-1557`, `:4108-4125` |
| Gallery tabs PHOTOS/VIDEOS/SOCIALS | WORKING | `:3473-3517` |
| Delete submission (×3 kinds) | PARTIAL — local only, server pending row persists | `:3588, 3709, 3796, 4185-4245` |
| Image/video viewer | WORKING | `:3645, 3756` |
| Points earned / caps display | BROKEN for real users (purchase points shown as content points; approvals not reflected) | `:1641-1653, 2228-2400` |
| Policy copy sections | WORKING (static) | `:88-170` |

### 11.5 Concierge — Slay Challenge, Slay Quests and gifts (`src/pages/account/concierge/page.tsx`)
| Control | Class | Evidence |
|---|---|---|
| Section visibility (6/12-month only) | WORKING per code; conflicts with benefits list | `:1727-1728, 6004-6005` |
| Founder "Test stage (admin)" select | WORKING as founder test (localStorage) | `:6022-6045` |
| Reward option pick (2 random) | PARTIAL (localStorage, per-device random) | `:1181-1204, 1316-1333` |
| START CHALLENGE | PARTIAL (sets next-cycle label locally; nothing downstream) | `:1335-1347, 6110-6125` |
| Reward collectible image (phase) | DISCONNECTED (progress never advances, so always phase 1 unless founder forces it) | `:6070-6087`, `:1240-1268` |
| Collectibles preview (all phases) | WORKING (founder only) | `SlayChallengeCollectiblesPreview.tsx` |
| Slay Quests category / VIEW LEVELS | WORKING UI; **progress hard-coded (fake live)** | `:385-530, 698-800` |
| CLAIM OFFER (special offer) | PARTIAL (adds a cart line client-side) | `:1606-1660, 3857` |
| Free gift pick | PLACEHOLDER (never consumed) | `:1130, 6178+` |
| Birthday gift confirm | PLACEHOLDER (fake confirmation) | `:3220-3255` |

### 11.6 Admin
| Control | Class | Evidence |
|---|---|---|
| /admin/referrals tabs | PARTIAL (API read of a never-written table → falls back to admin localStorage) | `admin/referrals/page.tsx:33-75` |
| EXPORT REFERRAL DATA | **PLACEHOLDER (no-op)** | `:254` |
| /admin/pending AFFILIATE approve/decline + reason | WORKING (server queue, audit, email); points wrong | `admin/pending/page.tsx:948-1036`; `api/admin/pending-queue.ts:135-185` |
| /admin/pending pending-points tally | BROKEN for real clients (reads admin's localStorage) | `admin/pending/page.tsx:278-334` |
| /admin/revenue membership payments | PARTIAL (Stripe rows real; local demo rows merged) | `admin/revenue/page.tsx:7-33` |

---

## 12. Page maturity
| Page | Status | Rationale |
|---|---|---|
| `/account/rewards` (membership/page.tsx) | **VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE** | Stripe subscribe/upgrade path is real. Redeem is fake, cancel is broken, balance and tier are client-only, earn tasks award nothing, founder mocks are present |
| `/checkout/upgrade` | **PARTIALLY_IMPLEMENTED** | Stripe button is real when configured. The adjacent CONFIRM ORDER grants PREMIUM locally without charge; no route guard |
| `/account/collectibles` | **PARTIALLY_IMPLEMENTED** | Server-backed for education certifications; advertised Slay Challenge, reward and special collectibles have no writer |
| `/account/referrals` | **PARTIALLY_IMPLEMENTED** (functionally client-only) | All data localStorage; cross-device non-functional; `referral_earnings` unwritten |
| `/account/affiliate` | **VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE** | Submission reaches the server queue; points engine is client-only and wrong for real users; always-success message |
| Concierge — Slay Challenge | **SHELL_ONLY** | Selection UI only; no progress, unlock, fulfilment, server or admin |
| Concierge — Slay Quests | **PLACEHOLDER** | Hard-coded progress |
| `/admin/referrals` | **SHELL_ONLY** | Reads an empty table, export no-op |
| `/admin/pending` (affiliate tab) | **FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT** for queue mechanics; points tally broken | — |
| `/tools/slay-tickets` + `/checkout/slay-tickets` | **PARTIALLY_IMPLEMENTED** | Server ledger is real; purchase has no payment verification |

---

## 13. Founder decisions needed (conflicting evidence; no rule invented)

**FD-1 — Slay Challenge structure.**
- Brief / reveal component: 3 requirements and 3 phases (`SlayQuestRewardAsset` default `totalRequirements=3`; `concierge/page.tsx:6082`).
- Config: 4 tiers with 5/7, 4/7, 5/9, 6/9 requirements (`slayChallengeTiers.ts`).
- Engine: tier 1 has 7 booleans (≥5); tier 2 has 3 booleans, all required (`concierge/page.tsx:1254-1268`).
- Intro copy: "TIER 2, TIER 3 + TIER 4" (`slayChallengeTiers.ts:14`).
- **Decision needed:** which structure is canonical, and how phases map to requirement counts.

**FD-2 — Reveal art model.** Pre-rendered 3 PNGs per reward type (current) versus a runtime 3D object with per-section material/ghosting (requested; not implemented). No `.glb` reward assets exist.

**FD-3 — Slay Challenge eligibility.** 6/12-month only (`concierge/page.tsx:1727-1728`) versus "EXCLUSIVE REWARDS + CHALLENGES" listed for 3 months (`premiumBenefitsByTier.ts:13`) and in marketing (`brandMemberPremiumRewards.ts:41-45`).

**FD-4 — Selection window / start timing.**
- Code: selection only in the last 3 days of a 6-month cycle, and the challenge starts **next** cycle (`concierge/page.tsx:1147-1180, 1335-1341`).
- Intro copy: "CHOOSE YOUR REWARD FOR THE CURRENT TIER ONLY".
- Rewards are 2 random options per device.
- **Decision needed:** the intended timing, and whether randomisation is per user (server) or per device.

**FD-5 — In-app (non-Stripe) membership checkout.** `STRIPE_MEMBERSHIP_SETUP.md:3` keeps it "for demos or non-Stripe methods". In production it grants PREMIUM without charge (client-side). **Decision needed:** keep it for founder or demo only, or remove it.

**FD-6 — Unknown-tier PREMIUM defaults to '12months'** (`adminAuth.ts:481,484,488`), which grants 2x points and Slay/Special Offer access. Intentional?

**FD-7 — Hair-analysis eligibility.**
- Requires a subscription tier, which excludes BLACK-only premium even though the PSA gate and the client gate include BLACK.
- Paid credits are unusable by non-subscribers (`api/hairstyle-analysis-generate.ts:190`).
- Paid tiers: 1/$20, 4/$60 (code, `STYLE_ANALYSIS.md:63`) versus 1/3/6 at $20/$40/$60 (`PRODUCT_AND_PRICING_GENOME.md:121`).

**FD-8 — Loyalty purchase points.**
- Display: order.total 1:1 (`membership/page.tsx:448-466, 677-683`).
- Checkout: eligible net × multiplier, excluding gift cards, membership and digital lines (`checkout/page.tsx:3001-3007`).
- Desktop: a third formula.
- Plus: is there point expiry? Are vouchers valid "6 months from redemption" (`membership/page.tsx:2362`)?

**FD-9 — Referral reward.**
- $20 digital cash at order **confirm** (`referrals/page.tsx:417`; checkout).
- Copy says active only after "complete & delivered", yet code accepts SHIPPED (`referrals/page.tsx:144`).
- Copy says no reward on cancel, but no revocation exists.
- Loyalty chart: "REFER A FRIEND +100 pts" (`membership/page.tsx:221`).
- Slay Quests: 250 pts / $10 / $25 milestones (`concierge/page.tsx:619-625, 681-687`).

**FD-10 — Affiliate points.**
- Customer copy: 400 / 600 / 600 with caps 2,000 / 3,000 / 5,000 per unit per 6-month cycle.
- Server approval default: 100 (`pendingQueueHandlers.ts:141`, `pending-queue.ts:180`).
- Featured Creator Bonus up to 1,500 (unimplemented).
- Reviews: photo 400 / video 600 × SILVER multiplier (`admin/pending/page.tsx:313-317`).
- Loyalty chart: "LEAVE A CONTENT REVIEW +150", "TAG US ON SOCIALS +200" (`membership/page.tsx:222-223`).
- Content Creator quest: 200 pts for 1 approved photo (`concierge/page.tsx:629`).

**FD-11 — Spend-tier welcome digital cash** SILVER $10 / RED $40 / BLACK $80 (`constants/tiers.ts`) versus premium welcome $10 / $20 / $40 (`checkout/page.tsx:6847`). Do they stack, and where should they be server-authoritative?

**FD-12 — Vouchers for real customers** are force-cleared (`account/page.tsx:397-406`). Is this intentional until a server voucher ledger exists?

**FD-13 — Cancellation UX.** Wire in-app cancel to Stripe (`cancel_at_period_end`) or the billing portal, or remove the button. Today it misleads.

**FD-14 — Slay Ticket purchase payment.** The route bypasses Stripe and the credit endpoint trusts client lines. **Decision needed:** require a PaymentIntent proof before crediting.
