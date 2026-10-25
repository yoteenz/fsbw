# 15 — Membership and Rewards Completeness

Full evidence: `appendix/B_membership_rewards.md`. No business rules were invented. Where code and copy disagree, the conflict is listed as a founder decision (doc 24).

## 1. Two membership models, one authoritative

| Model | Definition | Authority | Verdict |
|---|---|---|---|
| **Premium subscription** | 3 / 6 / 12 months at $280 / $520 / $960 (`src/constants/subscriptionPricing.ts`), Stripe price IDs from env | **Stripe + webhook → `profiles` + `membership_payments`** | Subscribe, upgrade (immediate with refund) and downgrade (at renewal) are **correct on the server** |
| **Spend tier** SILVER / RED / BLACK | 1,000 / 2,000 / 4,000 purchase points per half-year (Jan–Jun, Jul–Dec) | **Browser only** (`lastKnownTier_*`). The server reads `current_tier_name` but nothing writes it (0 BLACK rows live) | Client gates and server gates disagree |

There is **one canonical hair-analysis entitlement version, not V1/V2**: 1 free analysis per UTC month for 3/6/12-month subscribers (admins unlimited), then paid credits at 1 for $20 or 4 for $60 (`api/_lib/hairstyleAnalysisEntitlement.ts`, `hairstyleAnalysisPricing.ts`). It is enforced on the server. Conflicts:
- BLACK-only members are excluded, while the PSA gate includes them.
- Paid credits are unusable by non-subscribers (the endpoint returns 403).
- The SQL accepts 1/3/6 (live), not 1/4.
- `PRODUCT_AND_PRICING_GENOME.md` says 1/3/6 for $20/$40/$60.

## 2. Membership lifecycle completeness

| Stage | Customer | Admin | Status |
|---|---|---|---|
| Plan definitions + benefits | Rewards premium chart; `premiumBenefitsByTier.ts` | — | OK (benefit conflicts FD-R3) |
| Activation | Stripe ✔ / **CONFIRM ORDER grants free local premium ✘** | Payments list (read) | **P0** |
| Renewal | Stripe `invoice.paid` ✔ | Payments list | OK |
| Expiration | Stripe `subscription.deleted` ✔; local premium never expires | — | Partial |
| Cancellation | **Local flag only ✘** (Stripe keeps billing) | none | **P0** |
| Upgrade / downgrade | Stripe ✔ | none | OK (no admin) |
| Billing history | **No customer view** of `membership_payments` | Payments list | Orphaned-admin |
| Membership history | none | none | MISSING (S5) |
| Benefit usage | PSA limits server-side; analysis server-side; others client-side | none | Partial |
| Admin adjustment (comp, extend, cancel) | — | **none** (founder toggles affect only the founder's own browser) | MISSING |

## 3. Rewards catalogue

| Reward | Unlock path | Fulfilment | Server? | Status |
|---|---|---|---|---|
| Loyalty points | Purchases (3 formulas), anniversary/annual bonuses (client) | REDEEM is fake | No ledger | **BROKEN** |
| Vouchers | Founder seed only; wiped for everyone else | Checkout reads the local list | No writer | **BROKEN** |
| Free gifts | Concierge pick, loyalty chart | Never consumed | No | PLACEHOLDER |
| 2X points | 12-month multiplier on checkout `pointsEarned` only | Not reflected in the displayed balance | No | PARTIAL |
| Early access | Copy | None | No | PLACEHOLDER |
| Expedited processing | Slay tier copy | None | No | PLACEHOLDER |
| Free shipping credit | Slay tier copy | None | No | PLACEHOLDER |
| Mystery reward | Copy + asset | None | No | PLACEHOLDER |
| Digital cash | Welcome credits, referral, gift cards (all client) | Checkout from localStorage | No writer | **CLIENT-ONLY** |
| Bonus hair-analysis credit | Slay tier 2 / quests copy | **No grant path** (only Stripe writes credits) | — | PLACEHOLDER |
| Digital collectibles | Education certification only | Gallery | Yes (education) | PARTIAL |
| Slay Tickets | Purchase (no payment proof) | Lounge unlocks (server) | Yes | EXPLOITABLE (C1) |
| Special offer | 6/12-month | Client-priced cart line | Config server-side | PARTIAL |

**One shared rewards ledger for customer and admin?** **No.** The mobile rewards page, the desktop Penthouse dashboard, checkout and the admin pending tally each compute points differently, and none of them reads a server ledger. This is the single biggest functional gap in the rewards family (critical path CP-3, doc 23).

## 4. Slay Challenge

| Aspect | Finding |
|---|---|
| Structure | **The config defines 4 tiers** (5/7, 4/7, 5/9, 6/9 requirements). The engine models tier 1 as 7 booleans (≥5) and tier 2 as 3 booleans (all required), and tiers 3–4 are unreachable. **The reveal component assumes 3 requirements / 3 phases.** Founder decision FD-R1. |
| Assignment | 2 random rewards per device (`Math.random`), cached in localStorage |
| Requirement completion | **Not implemented**: no code ever sets a requirement to true |
| Unlock / posting / redemption / expiration | None, apart from a cycle-label reset |
| Fraud prevention | None (localStorage, not user-scoped) |
| Admin adjustment | Founder-only stage dropdown inside the customer concierge page |
| Notifications | None |
| Eligibility | 6/12-month only in code, while benefits copy lists challenges for the 3-month plan (FD-R3) |

### Reward assets and reveal logic (asset verification, read-only)

- **No 3D model files exist for rewards** (no `.glb`, `.gltf` or `.usdz` in `public/`; no `three`, `@react-three` or `model-viewer` in `package.json`).
- Each of the **10 reward types** is **three pre-rendered PNGs** (`phase1Url`, `phase2Url`, `phase3Url`) in Supabase Storage `live-preview/Collectibles/…`, referenced from `src/config/slayQuestRewardAssets.ts:56-176`.
- `SlayQuestRewardAsset.tsx` swaps the whole image per phase (`totalRequirements=3`; phase 2 at ≥2 complete, phase 3 at 3).
- **The required reveal behaviour is not implemented in code:** "asset visible throughout all three phases, unlocked sections receive their materials/colour, locked sections remain ghosted". It can only be satisfied if the three PNGs were authored that way. The audit did not open the images (no network or asset downloads), so this is **UNVERIFIED** and is founder decision FD-R2.
- **Do not regenerate these assets.** The fix is wiring progress to real requirements, which advances the phase index. That preserves the existing art.

## 5. Affiliate and referral policy

| Item | Customer copy (current) | Code / server | Status |
|---|---|---|---|
| Photo | 400 pts per approved photo | Approval writes `points ?? 100`; no loyalty credit | **Mismatch** |
| Video | 600 pts; up to 5,000 per unit per 6-month cycle | Same | **Mismatch** |
| Social | 600 per platform per unit; cap 3,000 per product | Client-side caps only | Unenforced |
| Featured Creator Bonus | up to 1,500 | Not implemented | Copy only |
| Referral | $20 off for friend; $20 digital cash to referrer "when confirmed"; "complete & delivered" | Client-side only; SHIPPED counts; no revocation; `referral_earnings` never written | **Not functional across devices** |
| Loyalty chart | "Refer a friend +100", "Content review +150", "Tag us +200" | No award | Conflicting copy (FD-R9/R10) |

The **historical 400/600 policy matches the current customer copy**. Treat it as canonical unless the founder decides otherwise.

## 6. Completion standard for this family

Membership and rewards are complete when:
1. Every balance shown to a customer is the sum of a server ledger (S4).
2. Every reward has a defined grant event and a defined redemption event, on the server.
3. Cancel and change-plan go through Stripe.
4. Admin can see and adjust any customer's ledger, with every adjustment audit-logged.
5. Slay Challenge progress is per user, server-side, and drives the existing 3-phase art.
