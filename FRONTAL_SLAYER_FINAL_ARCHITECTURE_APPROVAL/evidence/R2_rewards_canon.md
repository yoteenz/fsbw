# R2: Frontal Slayer membership and rewards canon reconciliation

Scope: read-only. Repo `/home/user/fsbw`. No builds, no network, no database. Sources are cited as `file:line`. motherboard/MEMORY.md entries are cited as `MEMORY:<line> [<date> — <heading>]`. Later MEMORY entries override earlier ones. Within one date, the higher line number is the later entry.

Classification key:
- **CONFIRMED**: docs and code agree, or there is one authoritative source.
- **CONFLICTING**: sources disagree. Each source and its value is listed.
- **UNVERIFIED**: the evidence is weak or indirect, or the rule exists as copy only.
- **FOUNDER DECISION REQUIRED (FDR)**: no rule exists, or the conflict can only be settled by the founder.

General caveat: nearly every reward ledger (points, vouchers, digital cash, Slay Challenge progress, referral earnings, affiliate approvals) is written to the browser's localStorage only. The exceptions are the hairstyle-analysis usage and credits (Supabase RPC) and membership price and billing (Stripe). "Implemented" below means implemented in the client unless it says otherwise. Sources: `docs/REFERRAL_AFFILIATE_REWARDS_SECURITY_ASSESSMENT.md:77-78`, and the prior audit `FRONTAL_SLAYER_ACCOUNT_ADMIN_AUDIT/appendix/B_membership_rewards.md`. I checked the prior audit's claims rather than repeating them. Where I disagree with it, I say so.

---

## 1. Membership tiers, durations, prices and inclusions

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Premium durations | 3, 6 and 12 months (`3months`/`6months`/`12months`) | `src/constants/subscriptionPricing.ts:5-14`; `api/_lib/stripeMembership.ts:3-10`; `docs/STRIPE_MEMBERSHIP_SETUP.md:3,22` | CONFIRMED | |
| Premium prices | $280 / $520 / $960 USD per term | `subscriptionPricing.ts:11-13`; `stripeMembership.ts:6-10`; `membership/page.tsx:2091,2118,2146`; `docs/architecture/PRODUCT_AND_PRICING_GENOME.md:97-99`; `STRIPE_MEMBERSHIP_SETUP.md:3` | CONFIRMED | Client and server copies agree. Stripe recurring interval equals the term. |
| Standard (free) membership | Column "STANDARD" = FREE | `membership/page.tsx` chart (`PRICE`/`FREE` row near :2088) | CONFIRMED | |
| Inclusion list (IIYM) — 3 months | Birthday gift, discounted shipping, premium 3D wig options, members-only lobby + lounge, PSA, priority support, priority booking + processing, Watch + Learn, Slay Academy, **exclusive rewards + challenges**, anniversary rewards, **live order tracking** | `src/constants/premiumBenefitsByTier.ts:3-17` | CONFLICTING (see the rows below) | |
| 6 months adds | Priority messages | `premiumBenefitsByTier.ts:18-32` | CONFIRMED (chart `membership/page.tsx:2035`; `psaFeatureGates.ts:13`) | |
| 12 months adds | Special offers, double your points | `premiumBenefitsByTier.ts:33-49`; MEMORY:29606 [2026-06-19 — IIYM double points limited to 12-month premium] | CONFIRMED for 2X. CONFLICTING for special offers (row below) | |
| Live order tracking — minimum tier | 3 months (benefit list + chart) **vs** 6 months (gate) | `premiumBenefitsByTier.ts:15`; chart `membership/page.tsx:2034` (m3 ✓); MEMORY:20753/20768 [2026-05-29 — Full conversation summary … premium/icon cleanup] ("LIVE ORDER TRACKING appears for the 3-month tier") **vs** `src/constants/psaFeatureGates.ts:14` (`live_order_tracking: '6months'`) | CONFLICTING | The latest dated instruction (2026-05-29) says 3 months. The gate code was not updated. |
| Challenges / Exclusive rewards — eligibility | All 3 tiers ("EXCLUSIVE REWARDS + CHALLENGES" list; chart CHALLENGES ✓3/6/12) **vs** chart "EXCLUSIVE REWARDS" row 12-month only **vs** Concierge Slay Challenge shown to 6/12 only | `premiumBenefitsByTier.ts:13,27,42`; `membership/page.tsx:2033` (CHALLENGES m3 m6 m12), `:2038-2062` (EXCLUSIVE REWARDS ✗✗✗✓); `psaFeatureGates.ts:16` (`exclusive_rewards: '12months'`); `src/pages/account/concierge/page.tsx:1727-1728` (`showSlayAndSpecialOffer` = 6 or 12 only); MEMORY:4402 [2026-03-29 — Premium chart: CHALLENGES, PRIORITY MESSAGES, SPECIAL OFFERS rows] (CHALLENGES ✓ 3/6/12) | CONFLICTING → FDR | The prior audit's FD-3/FD-R3 is confirmed. "Exclusive Rewards" and "Challenges" are treated as different things in the chart but merged in the IIYM list. |
| Special offers — eligibility | 12-month only (chart, IIYM, gate) **vs** 6 and 12 (Concierge) | `membership/page.tsx:2036`; `premiumBenefitsByTier.ts:44`; `psaFeatureGates.ts:15` **vs** `concierge/page.tsx:1727-1728, 3750, 3862`; MEMORY:4402 [2026-03-29] ("SPECIAL OFFERS ✓ 12 mo only"); `motherboard/CORE.md:60` ($40 off, 60-day countdown) | CONFLICTING | Documents say 12 only. The Concierge code shows special offers to 6-month members too. |
| Chart wording vs list wording | "REDUCED SHIPPING" (chart) / "DISCOUNTED SHIPPING" (IIYM); "VIP SUPPORT" / "PRIORITY MEMBER SUPPORT"; "2X LOYALTY POINTS" / "DOUBLE YOUR POINTS" | chart parse of `membership/page.tsx:1850-2087`; `premiumBenefitsByTier.ts` | CONFIRMED (same benefit, different label) | Copy only. |
| PSA message limits | 3 months 45/month, 10/day; 6 months 90/18; 12 months 180/30 | `src/constants/psaMembershipCopy.ts:17-21`; `api/_lib/psaEngagementLimits.ts:17-36` | CONFIRMED | Not shown to clients: MEMORY:29496 [2026-06-19 — IIYM PSA benefit label hides message limits]. |
| BLACK spend tier = premium for gates | BLACK spend tier gets PSA at 12-month limits and premium-gated BAW/booking. It does **not** get hairstyle analysis. | `psaFeatureGates.ts:30`; `api/_lib/psaEngagementLimits.ts:42`; `src/utils/premiumMemberAccess.ts:10-25`; CORE.md:65 ("active premium subscription and/or BLACK spend tier") **vs** `api/_lib/hairstyleAnalysisEntitlement.ts:16-20,62-71`; MEMORY:27265 [2026-06-10 — Hairstyle analysis: 1 free per month] ("requires active subscription tier (not BLACK-only)") | CONFLICTING (intentional?) → FDR | |
| Unknown premium = best tier | If membershipType=PREMIUM with no tier, the code assumes 12 months | `psaFeatureGates.ts:33` | UNVERIFIED (code default) → FDR | Same as the prior audit's FD-6. |
| **What only 12-month (annual) members get** | (a) 2X points that override Red/Black multipliers; (b) Special offers; (c) "Exclusive rewards" chart row; (d) free domestic standard shipping ($60 off), $40 off express, and $40 off international standard/express; (e) anniversary 1,500 pts; (f) PSA 180/30; (g) welcome credit — see §10 | (a) `src/constants/tiers.ts:17-28`, `membership/page.tsx:2366`, `brandMemberPremiumRewards.ts:66-70`; (b)(c) above; (d) `src/pages/checkout/page.tsx:1987-2018`; (e) `membership/page.tsx:194-198`; (f) above | (a) CONFIRMED; (b)(c) CONFLICTING; (d) CONFIRMED in code only (no doc states amounts); (e) CONFIRMED (§3); (f) CONFIRMED | "Annual Black Status" (§3) is a **spend-tier** reward, not a 12-month-membership reward. The two are easy to confuse. |
| Annual consultation benefit | "ANNUAL CONSULTATION BENEFIT" (all spend tiers) | `membership/page.tsx:2338` | UNVERIFIED (copy only) → FDR | No implementation and no definition found. |

## 2. Hairstyle Analysis entitlements

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Free monthly allowance | 1 free analysis per **UTC calendar month** for 3/6/12-month subscribers; the card tier follows the plan | `api/_lib/hairstyleAnalysisEntitlement.ts:1-4,14-20`; `docs/STYLE_ANALYSIS.md:61`; `api/_lib/psaInstructions.ts:161-162`; migration `supabase/migrations/20260610120000_hairstyle_analysis_usage.sql`; MEMORY:27265 [2026-06-10 — Hairstyle analysis: 1 free per month (3 / 6 / 12 month subscribers)]; MEMORY:27482 [2026-06-12 — two templates] ("entitlement unchanged") | CONFIRMED (server-enforced) | The latest MEMORY entry is 2026-06-12. The allowance is the same for 3, 6 and 12 months; there is no tier scaling. |
| Admin/founder | Unlimited (bypasses the cap) | `hairstyleAnalysisEntitlement.ts:31-34` | CONFIRMED | |
| Non-subscribers | Not eligible (403 PREMIUM_REQUIRED), even after buying paid credits | `api/hairstyle-analysis-generate.ts:186-194` | CONFIRMED code; policy → FDR | Paid credits bought by a non-subscriber cannot be used. This confirms the prior audit's FD-7. |
| Paid credits after the free one | 1 comparison = $20; 4 comparisons = $60. Monthly free is consumed first, then paid FIFO. Paid fees are non-refundable. | `api/_lib/hairstyleAnalysisPricing.ts:4-16`; `api/_lib/pricing/resolveQuote.ts:17-20,63-70,141-151`; `psaInstructions.ts:163-169`; `docs/STYLE_ANALYSIS.md:63`; MEMORY:27488 [2026-06-12 — Consult style analysis: 1 or 4 comparisons ($20 / $60)] | CONFIRMED (latest) | **Superseded:** MEMORY:27273 [2026-06-10 — paid credits after monthly free] said 1/3/6 = $20/$40/$60. |
| Stale doc | 1/3/6 comparisons $20/$40/$60 | `docs/architecture/PRODUCT_AND_PRICING_GENOME.md:87,121` | CONFLICTING (doc stale) | The genome doc cites `hairstyleAnalysisPricing.ts:4-8`, but that code now says 1/4. Fix the doc. |
| Consult style-analysis add-on | Optional: none ($40 deposit only) / 1 = +$20 / 4 = +$60 | `docs/STYLE_ANALYSIS.md:7,13-16`; `CORE.md:69`; `src/components/booking/ConsultStyleAnalysisAddonPicker.tsx:34`; MEMORY:28484 [2026-06-14 — Consult style analysis optional + selfie in tier panels] ("NO STYLE ANALYSIS ($40 only) + paid tiers … defaults to no add-on") | CONFIRMED (latest) | Superseded: MEMORY:27488-27492 [2026-06-12] made the add-on required. |
| Versioned (V1/V2) entitlements | **None exist** | Searched `V1`/`V2`/`entitlement`/`analysis credit`/`bonus` in motherboard, docs, knowledge, founder-intelligence, brand-bible, src/constants, src/content, api/_lib | CONFIRMED (absence) | Agrees with the prior audit. |
| PSA "FIND MY BEST LOOKS" pick caps | 3 months → 4, 6 months → 6, 12 months → 10 picks | `docs/STYLE_ANALYSIS.md:82`; MEMORY:27482 ("PSA selfie pick caps (4/6/10) unchanged until phase-2") | UNVERIFIED (interim) | A separate premium feature with 24h delivery. |
| Bonus analysis credit (reward) | "BONUS HAIRSTYLE ANALYSIS CREDIT" is a Slay Challenge Tier 2 reward option and has collectible art | `src/config/slayChallengeTiers.ts:60`; `slayQuestRewardAssets.ts` `bonus_hairstyle_analysis`; MEMORY:30116-30122 [2026-06-20 — Collectible reward phase images expanded] | UNVERIFIED → FDR | No grant path exists. The usage RPCs only grant purchase credits (`api/_lib/hairstyleAnalysisUsage.ts:151-168`). Lobby copy says "Hairstyle Analysis Credits" (`src/constants/desktopGrandLobby.ts:19`). |

## 3. Anniversary Rewards (plus Annual Black Status)

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Premium anniversary points | 3 months → 500 at 3 months; 6 months → 1,000 at 6 months; 12 months → 1,500 at 12 months | `src/pages/account/membership/page.tsx:194-204,517-547`; MEMORY:29916 [2026-06-19 — Annual Black and premium anniversary reward points]; MEMORY:29926 [2026-06-19 — Reward amounts made internal, visible copy restored] (latest) | CONFIRMED | Milestone = `subscriptionPurchasedAt` + term (falls back to `subscriptionEndDate`). Idempotent id `premium-anniversary-<tier>-<anchorDate>`. Requires membershipType PREMIUM. Client-only. |
| Visibility | Amounts and eligibility are **internal**; client copy is the generic "ANNIVERSARY REWARDS" and history rows say "REWARD" | MEMORY:29926 [2026-06-19] (latest); `brandMemberPremiumRewards.ts:59-64` | CONFIRMED | |
| Anniversary marketing promise | "bonus points, special offers, exclusive gifts + surprise member rewards" | `brandMemberPremiumRewards.ts:63` | UNVERIFIED | Only points are implemented. |
| Meaning of "anniversary" for 3/6-month terms | It fires when each term ends (that is, at renewal), not yearly | `membership/page.tsx:200-204,525-534` | FDR | Unclear whether renewals re-trigger (the anchor changes only if `subscriptionPurchasedAt` is rewritten). |
| Annual Black Status reward | 2,500 pts when **both** previous completed 6-month cycles each had ≥4,000 purchase points | `membership/page.tsx:206-207,574-586`; MEMORY:29916/29926 [2026-06-19] | CONFIRMED | A spend-tier reward. Client copy is "ANNUAL BLACK STATUS GIFT/REWARD" (`:2328,2350,2815`). |

## 4. "Hair Bestie Bonus"

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Hair Bestie Bonus | **No such reward exists anywhere** | Repo-wide grep for `bestie` (excluding node_modules/dist). "Hair bestie" appears only as a PSA voice pillar: `api/_lib/psaInstructions.ts:17,32`; `motherboard/CORE.md:16`; `brand-bible/psa/*.md`. No MEMORY hit for "bestie bonus/reward". | FDR | If the founder intends this reward, it is undefined: no amount, trigger, or code. Do not invent it. |

## 5. Slay Challenge (and Slay Quests / collectible reveal)

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Structure | **4 tiers**: 1 DISCOVER 5/7, 2 ENGAGE 4/7, 3 ELEVATE 5/9, 4 ICON 6/9, each with a reward pool | `src/config/slayChallengeTiers.ts:17-111`; MEMORY:29966 [2026-06-19 — Slay Challenge guide copy expanded] (user supplied 4 tiers); MEMORY:30086 [2026-06-19 — Slay Challenge Tier 1 requires 5 of 7] (latest threshold) | CONFIRMED as the documented and configured model | Tier 1 history: 3/7 (MEMORY:29996) → **5/7** (MEMORY:30086, later). Tier 2–4 copy still says "THEY ONLY NEED" (`:42,65,88`), which is internal wording that leaks to clients. |
| Engine vs config | Tier 1 engine = 7 booleans, complete at ≥5 ✓. Tier 2 engine = **3 booleans, all required** (config says 4/7). Tiers 3–4 cannot be reached. | `concierge/page.tsx:282-300,1254-1283` | CONFLICTING | Confirms the prior audit's FD-R1. |
| Reward selection | Per tier, 2 rewards are drawn at random from the pool; the member picks 1; that is the only reward for the tier. The next tier's options appear only after completion. | MEMORY:30066 [2026-06-19 — Slay Challenge two-option reward selection corrected] (latest); `concierge/page.tsx:316-325,1181-1204` | CONFIRMED | Randomization and costs must stay out of client copy: MEMORY:30006. |
| Show only the current tier | Yes | MEMORY:29986 [2026-06-19]; `slayChallengeTiers.ts:10-15` intro bullets | CONFIRMED | |
| Cycle | 6-month cycles Jan–Jun / Jul–Dec; all 4 tiers must fit in one cycle; progress resets each cycle | MEMORY:30069-30072 [2026-06-19]; `CORE.md:60`; `concierge/page.tsx:1149-1178,1240-1250` | CONFIRMED | |
| Selection window | Last 3 days of the current cycle; the challenge starts the next cycle | `concierge/page.tsx:1148-1167,6104` | UNVERIFIED (code only, no doc) → FDR | Prior audit FD-R4. |
| Eligibility | 6- and 12-month premium only (code) **vs** all premium (IIYM + chart CHALLENGES) | see §1 | CONFLICTING → FDR | |
| Reward pools | T1: 600 pts, 1X Flexible Cap voucher, Mystery reward, Free shipping credit, Exclusive wallpaper/member collectible. T2: 1,000 pts, 1X Hairline voucher, 2X points next purchase, $40 digital cash, Priority order-processing upgrade, Mystery reward, Bonus analysis credit. T3: 2,500 pts, 1X Styling voucher, $60 DC, 2.5X next purchase, Premium mystery. T4: 5,000 pts, 1X Color voucher, $80 DC, 3X next purchase, Premium mystery. | `slayChallengeTiers.ts:32-38,53-61,78-84,101-107`; MEMORY:29946 [2026-06-19 — Tier 1 points increased] (200 → 600) | CONFIRMED (config). Fulfilment UNVERIFIED | No code awards these rewards (prior audit M12: client-only and orphaned). |
| **Reveal phases** | **3 visual phases per reward**: phase1 = locked/incomplete, phase2 = "75% complete", phase3 = unlocked/full | MEMORY:30046-30052 [2026-06-19 — Slay Quest collectible reward asset framework] ("each with three phase images: phase 1 locked/incomplete, phase 2 75% complete, phase 3 unlocked/full"); `src/config/slayQuestRewardAssets.ts:13,40-54`; `SlayQuestRewardAsset.tsx:20-24`; MEMORY:30126 [2026-06-20 — admin collectibles preview] | CONFIRMED (3 phases) | |
| **"Three requirements per reward"** | Code default `totalRequirements = 3`, hardcoded at both call sites | `slayQuestRewardAssets.ts:42`; `SlayQuestRewardAsset.tsx:81`; `concierge/page.tsx:6082`; `SlayChallengeCollectiblesPreview.tsx:102` | CONFLICTING (an artifact, not canon) | **Origin found in MEMORY:** when the framework was built (MEMORY:30046-30051 [2026-06-19]), it was wired to "existing progress booleans": Tier 1 then had 3 flags (`purchase && review && post`) and Tier 2 had 3 (`purchase, review, socialTag`). Later the same day, MEMORY:30086-30092 [2026-06-19 — Tier 1 requires 5 of 7] replaced Tier 1 with 7 flags (≥5), but `totalRequirements={3}` was never updated. Result: 3 of 7 tasks shows "UNLOCKED" while the tier needs 5. With total=3, phase2 fires at 2/3 (67%), not 75%. **No document states "three requirements per reward" as a rule.** The latest canon is the 4-tier X/Y thresholds. |
| "Full collectible silhouette visible throughout" | — | Repo-wide grep for `silhouette visible`/`visible silhouette` matched nothing in rewards. "Silhouette Law" (`docs/studio-os/hero-objects/…`, MEMORY:43489) is Studio OS Hero Objects canon, not Slay Challenge. | FDR (no canon) | Prior audit FD-R2. Whether the existing phase PNGs show a full silhouette cannot be checked offline. |
| "Progressive visual unlock" | Phase advances with requirement completion (1 → 2 → 3) | MEMORY:30050-30051; `slayQuestRewardAssets.ts:40-54` | CONFIRMED (mechanism). Wording UNVERIFIED | The phrase itself appears nowhere in the repo. |
| "Transparent assets" | The component **supports** transparent PNG/WebP (`objectFit: contain`). Transparency is not required. | MEMORY:30050 [2026-06-19] | UNVERIFIED as a requirement → FDR | The 30 phase PNGs exist **only** in Supabase `live-preview/Collectibles/` (`slayQuestRewardAssets.ts:59-175`). There is no local copy, so their transparency could not be checked (see §11). |
| Collectible art conventions | Do not generate collectible art; no logo inside assets; use owner-supplied Supabase URLs exactly | MEMORY:30052, 30062, 30122 [2026-06-19/20] | CONFIRMED | |
| 10 reward types | loyalty_points, free_voucher, free_gift, double_points, exclusive_digital_wallpaper, mystery_reward, free_expedited_shipping, free_expedited_processing, bonus_hairstyle_analysis, digital_cash | `slayQuestRewardAssets.ts:1-11`; MEMORY:30116-30122 [2026-06-20] | CONFIRMED | Label-to-art mapping: `src/utils/slayChallengeRewardAssetMap.ts:9-69`. "FREE SHIPPING CREDIT" uses the *expedited shipping* art. |
| Slay Quests (separate system) | 18 quests × 4 levels, display-only | MEMORY:29976-29982 [2026-06-19 — Slay Quests Concierge section added], MEMORY:30036-30042; `concierge/page.tsx:532-697` | CONFIRMED (display only) | Keep separate from Slay Challenge (MEMORY:29982). Rewards are not automated. |

## 6. Points: earning, multipliers, tiers, expiry, redemption

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Purchase earn rate | 1 point per $1 of eligible net (after discounts), then × multiplier | `src/utils/loyaltyPointsEligibleNet.ts:1-8,54-63`; `checkout/page.tsx:1935-1948,3001-3007` | CONFIRMED (code) | No doc states "1 pt per $1". It appears only in code comments and `membership/page.tsx:450-466`. The server `recordProductOrderFromPaymentIntent.ts:20` uses round(total) with no multiplier, for the email only. |
| Points-earning exclusions | No points on gift cards, digital lines, membership purchases, consult deposits, or hairstyle analysis. Appointment deposits do earn. Bookings-only checkout earns nothing. | `loyaltyPointsEligibleNet.ts:1-8,54-63`; `CORE.md:70` | CONFIRMED | |
| Multipliers | Standard 1×, RED 1.25×, BLACK 1.5×; 12-month premium 2× **replaces** the tier multiplier (no stacking) | `src/constants/tiers.ts:17-28`; `membership/page.tsx:2366` (TBG), status card `:2810-2830`; MEMORY:29606 [2026-06-19] | CONFIRMED | |
| 2X / 2.5X / 3X "next purchase" | Slay Challenge T2/T3/T4 reward options | `slayChallengeTiers.ts:56,81,104` | UNVERIFIED (no implementation) | |
| Spend tiers | SILVER ≥1,000, RED ≥2,000, BLACK ≥4,000 **purchase** points per 6-month cycle (Jan–Jun/Jul–Dec). Non-purchase points count toward the balance, not status. | `membership/page.tsx:432-434,2356-2358`; `src/pages/account/page.tsx:864-935`; MEMORY:29856 [2026-06-19 — Tier status clarified as purchase-earned points only] | CONFIRMED | Downgrade logic: once Silver is reached, the member never drops below Silver; Black falls to Red or Silver on current spend (`account/page.tsx:913-930`). |
| VIB | Lifetime spend ≥$10,000 → permanently BLACK | `src/pages/account/page.tsx:795-806,895-898` | UNVERIFIED (code only, no doc or MEMORY rule) → FDR | Possibly what "STATUS PROTECTION BENEFIT" means (`membership/page.tsx:2329,2351,2814`), but nothing links them. |
| Tier welcome bonuses | Silver 250 pts; Red 500 pts + 1X Flexible Cap + 1X Hairline voucher; Black 1,000 pts + 1X Color + 1X Styling voucher | `membership/page.tsx:2303-2329,2810-2830`; MEMORY:29906 [2026-06-19 — voucher bullets clarified] | UNVERIFIED (copy only) | No award code found for the bonus points or vouchers. Only the welcome digital cash is credited (§10). |
| Other earn actions | Newsletter 50, refer a friend 100, content review 150, tag on socials 200, follow FB/IG/TikTok/X 250 each | `membership/page.tsx:219-228` | UNVERIFIED (display list) | Conflicts with affiliate review/photo values (§7) and the referral $20 rule (§8). |
| **Points expiry** | **Not defined.** A `points_expiring` email template exists. | `docs/EMAIL_SYSTEM.md:51`; `src/constants/emailTemplateCatalog.ts:56`; no rule in code, docs or MEMORY | FDR | |
| Redemption catalogue | 5k free gift w/ purchase; 10k 10% off unit; 15k 1X Hairline voucher; 20k $100 DC; 25k 1X Color voucher; 30k 30% off unit; 35k 1X Styling voucher; 40k $200 DC; 45k free gift; 50k 50% off unit | `membership/page.tsx:172-183`; MEMORY:13429-13505 [2026-04-11 Account Rewards styling entries] | CONFIRMED (single source) | MEMORY:4558 [2026-03-29] notes the 5k vs 45k free gifts will later be tied to admin inventory. |

## 7. Affiliate photo / video / social rewards

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Photo | 400 pts per approved photo | `src/pages/account/affiliate/page.tsx:94-96`; `src/pages/admin/pending/page.tsx:313-316` | CONFIRMED | |
| Video | 600 pts per approved video, min 10 s | `affiliate/page.tsx:98-101,117-125` | CONFIRMED | |
| Photo/video cap per unit | 2,000 (code: max 2 photos = 800 + 2 videos = 1,200) | `affiliate/page.tsx:1650-1651` (`Math.min(2000, …)`), `:383` comments | CONFLICTING / UNVERIFIED | Client copy never states the 2,000 cap or the 2-and-2 limit. Copy only gives a 5,000 total. |
| Social tag | 600 pts per approved platform per unit; 5 platforms (IG, TikTok, YouTube, FB, X); cap 3,000 per product | `affiliate/page.tsx:141-156`; MEMORY:20753/20762 [2026-05-29 — Full conversation summary … affiliate rewards program copy] | CONFIRMED | |
| Per-unit cap / period | 5,000 per unit per 6-month cycle (Jan–Jun/Jul–Dec); resets each period | `affiliate/page.tsx:101,1642-1669,2243,4028`; | CONFIRMED | The copy puts the 5,000 cap under the VIDEO heading (`:101`), which reads as if it were video-only. |
| Featured Creator bonus | Up to 1,500 pts, discretionary | `affiliate/page.tsx:170-185` | UNVERIFIED (copy only; no award code) | |
| Review time | Up to 72 business hours | `affiliate/page.tsx:228-235` | CONFIRMED (copy) | |
| Multiplier on affiliate points | Admin pending preview applies the SILVER multiplier (1×) | `admin/pending/page.tsx:313-326` | UNVERIFIED → FDR | Whether tier or 2X multipliers apply to affiliate points is undefined. |

## 8. Referrals

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Friend reward | $20 off the friend's **first** purchase | `src/pages/account/referrals/page.tsx:414-417`; `brandFaqCopy.ts:206-209`; `psaKnowledge.ts:257-260`; `affiliate/page.tsx:189-200`; `checkout/page.tsx:2326-2330` | CONFIRMED | |
| Referrer reward | $20 digital cash | same + `checkout/page.tsx:6946-6995`; MEMORY:18658 [2026-05-27 — Brand FAQ page content] ("member referral $20") | CONFIRMED | Also listed as "+100 pts" (`membership/page.tsx:221`) and in Slay Quest Referral Royalty (250/500/1,000+$25/2,500) (`concierge/page.tsx:686-694`). These are UNVERIFIED and need an FDR on whether they stack. |
| Credit timing | At order **confirmation** (code, FAQ, PSA) | `checkout/page.tsx:6946`; `referrals/page.tsx:417`; `brandFaqCopy.ts:209`; `psaKnowledge.ts:260` | CONFIRMED (code + docs agree) | `docs/REFERRAL_AFFILIATE_REWARDS_SECURITY_ASSESSMENT.md:36-39,103` raises "credit after delivery" as an option → FDR. |
| Code activation | Owner's code is active once they have a delivered order | `referrals/page.tsx:514` ("complete & delivered") **vs** `:145` (code accepts DELIVERED **or SHIPPED**) | CONFLICTING | |
| Revocation | Referrer loses $20 if the referred order is canceled | `referrals/page.tsx:514`; `src/utils/orderFormDeclineCancelRefund.ts:56-100` (client reversal exists) **vs** `REFERRAL_AFFILIATE_REWARDS_SECURITY_ASSESSMENT.md:32-34,100` ("no flow that deducts") | CONFIRMED (copy + code). Security doc is STALE | Refunds (vs cancels) are not covered. |
| Self-referral | Blocked | `checkout/page.tsx:2319-2324`; security doc §1.1 | CONFIRMED | Client-side only (security doc §4.2). |
| First purchase only | Yes; existing customers are blocked | `checkout/page.tsx:2326-2330`; `referrals/page.tsx:414` | CONFIRMED | Guest/multi-account loophole (security doc §1.2-1.3) → FDR. |
| Combinability | Referral code cannot be combined with gift card / digital cash | `checkout/page.tsx:2300-2304` | CONFIRMED (code) | |
| Limit | Unlimited referrals | `affiliate/page.tsx:201-203` | CONFIRMED (copy) | |

## 9. Digital cash, vouchers, mystery, early access, expedited processing, shipping, free gift, birthday

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Digital cash expiry | Never expires (same for gift-card balances) | `membership/page.tsx:2362`; MEMORY:4558 [2026-03-29]; MEMORY:29458 [2026-06-19] | CONFIRMED | |
| Digital cash sources | Spend-tier welcome credit; premium welcome credit; referral $20; add funds; Slay Challenge $40/$60/$80; redemptions $100/$200; newsletter $10 | §10; `brandFaqCopy.ts:216` (newsletter $10) | Newsletter $10 UNVERIFIED (no crediting code found) | |
| Voucher types | Service vouchers: 1X FLEXIBLE CAP, 1X HAIRLINE, 1X COLOR, 1X STYLING; plus FREE GIFT credits | `membership/page.tsx:172-183,2810-2830`; MEMORY:4580 [2026-03-29 — Free gifts combinable at checkout] | CONFIRMED | Only one service voucher at a time. Free gifts combinable (MEMORY:4584). |
| Voucher / discount / free-gift validity | 6 months from **redemption** | `membership/page.tsx:2362` (TBG, latest copy); MEMORY:4564 [2026-03-29 — Free gifts: 6-month expiry again] (reversed MEMORY:4556 "do not expire"); MEMORY:29456 [2026-06-19] removed the duplicate disclaimer, then MEMORY:29516 [2026-06-19 — TBG copy replaced] restored the term in TBG | CONFIRMED (latest) | Cron `voucher_expiring` 30-day warning: `api/_lib/email/expiringRewardsScan.ts:55-95`. |
| Vouchers for real customers | Non-founder `voucherList` is force-cleared on every Account load | `src/pages/account/page.tsx:397-406` | CONFLICTING (rule vs implementation) | Confirms prior audit finding #11. |
| Mystery reward / Premium mystery reward | Slay Challenge options; collectible art exists | `slayChallengeTiers.ts:35,59,83,106`; MEMORY:30116-30122 | FDR | Contents are not defined anywhere. |
| Early Access | Marketing copy ("early access drops"); Slay Quest "EARLY ACCESS PASS" / "24-HOUR EARLY ACCESS UPGRADE"; lobby benefit | `brandMemberPremiumRewards.ts:27`; `concierge/page.tsx:557,574,638,656`; `desktopGrandLobby.ts:20`; `accountAlertsCatalog.ts:50` | UNVERIFIED → FDR | No gating, window length, or eligibility defined. |
| Expedited processing | "PRIORITY BOOKING + PROCESSING" (all premium); "PRIORITY ORDER PROCESSING UPGRADE" (Slay T2); collectible `free_expedited_processing` | `premiumBenefitsByTier.ts:11`; `brandMemberPremiumRewards.ts:35-40` ("when available"); `slayChallengeTiers.ts:58` | UNVERIFIED → FDR | No processing-time rule found. |
| Free shipping — member discount | Domestic standard: 3 months −$20, 6 months −$40, 12 months −$60 ("Free"); domestic express: 6/12 months −$40; international standard/express: 12 months −$40 | `src/pages/checkout/page.tsx:1971-2020` | CONFIRMED (code only) | No doc states the amounts. "Free" for 12 months assumes a $60 standard rate. |
| Free shipping — credit | "FREE SHIPPING CREDIT" (Slay T1; Slay Quest Digital Cash Collector L2) | `slayChallengeTiers.ts:36`; `concierge/page.tsx:546` | UNVERIFIED → FDR | No credit mechanism. Mapped to the *expedited* shipping collectible (`slayChallengeRewardAssetMap.ts:23-27`). Credit vs discount is undefined. |
| Free Gift | Choice of MELT BAND or WIG BRUSH included in the next order; 6-month validity; combinable | `concierge/page.tsx:6156-6290` (`:6234,6278`); MEMORY:4564, 4580 [2026-03-29] | CONFIRMED | Earned via 5k/45k redemption (`membership/page.tsx:173,181`). |
| Birthday gift | Premium members (chart: 3/6/12 ✓; standard ✗). Choice: $20 GIFT CARD **or** 200 LOYALTY POINTS | chart `membership/page.tsx` BIRTHDAY GIFT row; `premiumBenefitsByTier.ts:4`; `concierge/page.tsx:3156-3160,6377,6425`; MEMORY:4952 [2026-03-29] | CONFIRMED (options) | Eligibility helper (premium within 12 months of purchase) is **unused** (`concierge/page.tsx:1677-1707`). The `birthday_reward` email exists (`docs/EMAIL_SYSTEM.md:51`). Affiliate copy lists "Birthday rewards" as a VIP perk (`affiliate/page.tsx:213`) → FDR on whether non-premium members get it. |

## 10. Spend-tier welcome credits vs premium welcome credits

| RULE | VALUE(S) | SOURCES | CLASSIFICATION | NOTES |
|---|---|---|---|---|
| Spend-tier welcome credit (digital cash) | SILVER $10, RED $40, BLACK $80; once per tier per 6-month cycle | `src/constants/tiers.ts:1-15` (duplicated in `premiumBenefitsByTier.ts` header); `src/pages/account/page.tsx:625-670`; TBG `membership/page.tsx:2298` | CONFIRMED (code) | The client history label is "TIER POINTS". The default fallback is $10 (`tiers.ts:13`). |
| Premium welcome credit — chart | STANDARD $10, 3 months $20, 6 months $40, 12 months $60 | `membership/page.tsx:1852-1857` ("WELCOME DISCOUNT" row) | CONFLICTING | |
| Premium welcome credit — checkout | 3 months $10, 6 months $20, 12 months $40; once per subscription tier **ever** (`unlockedDiscounts`) | `src/pages/checkout/page.tsx:6838-6870` | CONFLICTING | Every tier gets $10 less than the chart shows. Only on the in-app upgrade path; no Stripe webhook credit found. |
| What "STANDARD $10" means | Silver spend credit ($10) or newsletter $10? | chart `:1853`; `tiers.ts:7`; `brandFaqCopy.ts:216` | FDR | |
| Naming collision | Both are called "WELCOME DISCOUNT" and both land in the same digital-cash balance | `checkout/page.tsx:2543,6051` | FDR | |

## 11. Reward collectible PNGs: are they local, and are they transparent?

- The 30 Slay collectible phase images (10 types × 3 phases) are referenced **only** as Supabase URLs: `https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/{image (62–64,66,67).png, IMG_3235–3237, IMG_3264, IMG_3282, IMG_3312, IMG_3316, IMG_3321, IMG_3322, IMG_3326, IMG_3335–3340, IMG_3349–3351, IMG_3353, IMG_3354, IMG_3360–3362, IMG_3364}.png` (`src/config/slayQuestRewardAssets.ts:59-175`).
- **None exist locally.** I searched the whole repo (excluding node_modules) by name for `IMG_32xx`/`IMG_33xx`/`image (6x)` and `*collectible*`. `public/`, `dist/` and `canonical-backup/` have no copies. Their transparency **could not be verified** without a download.
- Related local reward PNGs (IHDR color type; 6 = RGBA, 2 = RGB with no alpha):
  - `public/assets/premium-rewards.png` 2048×2048 type 6
  - `public/assets/loyalty-points-rewards.png` 1024×1024 type 6
  - `public/assets/loyalty-points.png` 5504×3072 **type 2 (opaque)**
  - `public/assets/points-loyalty.png` 3077×2577 **type 2 (opaque)** (Concierge birthday "200 loyalty points" thumbnail)
  - `public/assets/giftcard-product.png` 1116×1284 type 6; `public/assets/gift-card asset.png` 604×628 type 6
  - `public/assets/email/icons/{loyalty-points,rewards-icon,points-icon}.png` 48×48 type 6
  - (Copies exist in `dist/assets/` and `canonical-backup/public/assets/`.) Type 6 means an alpha channel is present. It does not prove the pixels are actually transparent.
- Education "collectibles" (`api/collectibles/index.ts`, `src/content/education/collectibles/*`, migration `20260809180000_education_certifications_collectibles.sql`) are a separate certification system. Do not conflate them with Slay Challenge collectibles.

---

## FOUNDER DECISIONS REQUIRED

1. **Slay Challenge requirement model.** (A) Keep the 4-tier X/Y thresholds (5/7, 4/7, 5/9, 6/9) and drive the reveal phase from the tier's own required count. (B) Adopt "3 requirements per reward" and rewrite the tiers to 3 tasks each. (C) Keep 4 tiers but reveal on a % of the tier's required count (for example phase2 at ≥75% of required). Evidence: no document states option B. It is a leftover from the 3-flag engine of MEMORY 2026-06-19, before the 5/7 change.
2. **Phase-2 threshold.** Is phase 2 at "75% complete" literally (needs a 4+ requirement count), or "all but one requirement"? The current code gives 67% at 2/3.
3. **Reveal art requirements.** (A) Accept the existing 3 pre-rendered PNGs per reward as canon (do not regenerate). (B) Require full-silhouette-visible, transparent PNGs, and verify the existing Supabase files against that spec. No repo canon exists for "silhouette visible throughout" or for requiring transparency.
4. **Slay Challenge / Exclusive Rewards eligibility.** (A) All premium (3/6/12), as the IIYM list and chart CHALLENGES row show. (B) 6/12 only, as the Concierge code does. (C) Challenges for all, "Exclusive Rewards" for 12-month only, as the chart shows.
5. **Special Offers eligibility.** (A) 12-month only (chart, list, gate). (B) 6 and 12 (Concierge code).
6. **Live Order Tracking minimum tier.** (A) 3 months (latest MEMORY 2026-05-29, chart, list). (B) 6 months (`psaFeatureGates.ts`).
7. **Premium welcome credit amounts.** (A) Chart: Std $10 / 3 months $20 / 6 months $40 / 12 months $60. (B) Checkout: 3 months $10 / 6 months $20 / 12 months $40. Also decide whether it is once per tier ever or once per term, and what the Standard $10 is (Silver credit vs newsletter).
8. **Hairstyle Analysis for BLACK-only and non-subscribers.** (A) Subscribers only; disable paid purchase for everyone else. (B) Let anyone who buys credits use them. (C) Give BLACK spend tier the monthly free analysis.
9. **Bonus Hairstyle Analysis Credit** (Slay T2 reward). Define a grant mechanism: (A) one paid-credit grant, or (B) remove it from the pool.
10. **"Hair Bestie Bonus".** It does not exist. (A) Drop the term. (B) Define its amount, trigger, eligibility and ledger.
11. **Points expiry.** (A) Points never expire (then retire the `points_expiring` email). (B) Points expire after N months of inactivity or after a fixed period.
12. **Anniversary semantics for 3/6-month plans.** (A) Award on each completed term (current code). (B) Award once per membership year. (C) Award only on the first term. Also decide whether renewals re-trigger.
13. **Referral rules.** Timing: (A) at confirmation (current) or (B) at delivery. Code activation: (A) delivered only (copy) or (B) shipped or delivered (code). Stacking: should the +100 pts earn task and the Referral Royalty quest rewards stack with the $20 digital cash? Refund handling: reverse on refund as well as cancel?
14. **Affiliate caps.** Confirm the hidden sub-caps (2 photos + 2 videos = 2,000) and decide whether to show them. Decide whether tier/2X multipliers apply to affiliate points. Define how Featured Creator (up to 1,500) is awarded.
15. **Tier welcome bonuses** (Silver 250; Red 500 + cap/hairline vouchers; Black 1,000 + color/styling vouchers). (A) Implement them as written. (B) Remove the copy.
16. **Undefined perks needing definition or removal.** Mystery / Premium Mystery reward contents; Early Access (window, eligibility); Expedited/Priority processing (SLA); Free Shipping *credit* (vs the member shipping discount); "Annual Consultation Benefit"; "Status Protection Benefit" (is it the code's VIB rule of lifetime $10k = permanent BLACK?); "2X/2.5X/3X points next purchase".
17. **Birthday gift eligibility.** (A) Premium only (chart). (B) Also a VIP/affiliate perk (affiliate copy). Also confirm the $20 gift card / 200 pts choice and the timing window.
18. **Unknown-premium default.** Should a PREMIUM member with no stored tier default to 12-month privileges (current) or to 3-month privileges?
19. **Stale docs to fix once decided:** `docs/architecture/PRODUCT_AND_PRICING_GENOME.md:87,121` (1/3/6 → 1/4) and `docs/REFERRAL_AFFILIATE_REWARDS_SECURITY_ASSESSMENT.md:32-34` (a cancel reversal now exists client-side).
