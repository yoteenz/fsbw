# T — Historical founder authority for the 55 V2 decisions

Scope: read-only research in `/home/user/fsbw`. No edits, no network, no database. Sources searched: `motherboard/MEMORY.md` (55,993 lines, 4,048 dated entries; cited as `MEMORY:L<line> [date]`), `motherboard/CORE.md`, `.cursor/rules/*.mdc`, `docs/**` (frontal-slayer, design-dna-canon, SECURITY_HARDENING, CHECKOUT_SERVER_QUOTE, site00), `AGENTS.md`, `founder-intelligence/*`, `src/layouts/PAGE_LAYOUT.md`, the live membership copy (`src/pages/account/membership/page.tsx`), code comments, and `R2_rewards_canon.md`.

How strict the evidence is:
- MEMORY entries record what "User …" (the founder, Kateena) asked for in each chat. I count an explicit user request, correction or approval as founder authority. I do **not** count agent "Decisions / outcomes" or "Conventions" that the user did not ask for, audit recommendations, or ChatGPT/agent proposals.
- Later dated entries override earlier ones.
- Where founder authority exists but code or the live database disagrees, the row says **"rule exists, code conflicts"**.
- ⚠ marks a row where the historical founder authority **contradicts the V2 recommended option**.

Category key: **1** TRUE FOUNDER DECISION · **2** ENGINEERING DEFAULT · **3** ALREADY ESTABLISHED · **4** BLOCKED BY MISSING EVIDENCE.

---

## 1. Decision-by-decision table

| ID | Authority? | Exact evidence (≤25-word quote) | What it settles | What remains open | Cat. + reason |
|---|---|---|---|---|---|
| **A1** | YES-PARTIAL | MEMORY:L24155 [2026-06-03 Security hardening]: "User requested fixes from full-site QA security audit (… server-only order writes, strip privileged profile fields + DB guard…)". L24162: migration "drops `orders_insert_own` / `orders_update_own` RLS". Also `.cursor/rules/supabase-production-migrations.mdc:33`: skip auto-apply for "Destructive DDL … without explicit founder approval". | The founder already ordered this class of fix: server-only order writes and a privileged-column guard. **Rule exists, but the live DB conflicts**: legacy policies are still live, so the migration was apparently not applied in production or was reverted. | The founder never addressed RPC EXECUTE revokes or the policies on meetings, notifications and reviews. Running the production DDL still needs the founder's go-ahead under the migrations rule. | **2**: removes a vulnerability with no business tradeoff and continues a founder-requested fix. Needs a one-line production go-ahead. |
| **A2** | YES-PARTIAL | MEMORY:L24172 [2026-06-03]: "Product Stripe checkout requires … fully server-priced cart …; BCF bundle/custom BAW still block until catalog expanded." `docs/SECURITY_HARDENING.md:45` says the same. | Custom BAW lines must not be charged on unresolved pricing. Today's base + cap charge breaks that convention (the convention came out of the founder-requested hardening). | Which customer path to use: a concierge quote, booking a consult, or shipping server pricing. | **1**: a CX and commerce-flow choice for the flagship product. |
| **A3** | YES-PARTIAL | MEMORY:L24172 [2026-06-03]: "Founder legacy checkout env vars are preview/local only." `docs/SECURITY_HARDENING.md:27`: "Do not set `ALLOW_LEGACY_CHECKOUT` in production". QA item at L24126 flagged the upgrade bypass. | Non-Stripe CONFIRM ORDER is a founder/dev testing path, not a production path. | The 2026-06-03 fix list did not include the `/checkout/upgrade` path. It needs the same treatment. | **2**: extends an established rule to one more route. |
| **A4** | YES-PARTIAL | MEMORY:L10195 [2026-04-04 Stripe membership billing policy]: "upgrades … must charge a full new cycle immediately … refund the prorated unused amount …; downgrades … keep current membership active until renewal". | The founder set the plan-change billing semantics. This limits how a Stripe Portal could be configured: the portal's default proration does not match this policy. | Cancel UX (portal or in-app `cancel_at_period_end`). Stopping raw PAN/CVV collection is a pure security fix. | **1**: a customer-facing billing UX choice, constrained by the founder's billing policy. |
| **A5** | YES-PARTIAL | MEMORY:L2440 [2026-03-27]: "User reported that with VIEW AS CLIENT on, Orders and loyalty… still showed founder seed mock data" (fixed). MEMORY:L29053 [2026-06-17]: "user approved Creative Preview — secret URL on preview deployment only … demo data + banner". | Founder "view as client" must show real data. The founder approved putting demo data for outsiders on **preview only, not production**. Injecting mocks into real customers is a defect with no authority behind it. | Whether the founder's own production account keeps founder-only mocks. The founder set this up on purpose (MEMORY:L2067 [2026-03-27]). | **1** (narrowed): only the founder's own-account mocks are a founder call. Quarantining mocks away from customers is an engineering default. |
| **A6** | NO | Product rules only. MEMORY:L30144 [2026-06-20]: "User requested a full Slay Tickets … purchasable ticket packs". L30172: only premium members can purchase. Nothing covers pausing sales or payment proof. | Packs are a founder-wanted product: premium-only, $4 per ticket (L30199). | Pause now, or ship webhook-only crediting first. | **2**: removes a mintable-credit hole. Production has 0 orders, so a short pause has negligible business cost. It becomes 1 if the founder objects to pausing. |
| **A7** | YES-PARTIAL | MEMORY:L9070 [2026-04-03]: "User approved implementing the full five-part Stripe booking autopay scope end-to-end", with an explicit consent checkbox (L9097). | Autopay is a founder-approved feature, with consent. | How long it stays off, and collecting balances manually in the meantime. | **2**: temporarily disabling a broken charge path keeps the approved design intact. |
| **A8** | NO | None found. MEMORY refund entries cover consult and analysis non-refundability (L28453 [2026-06-14]), not remediation. | — | Whether any affected payments exist. | **4**: inspect Stripe (4-pack PIs, Slay Ticket and BAW payments) before anyone decides. |
| **A9** | YES-PARTIAL | MEMORY:L24162 [2026-06-03, founder-requested hardening]: "PUT /api/orders — 403 for clients; orders appended by Stripe `payment_intent.succeeded` webhook". `supabase-production-migrations.mdc:9` sets the process (auto-apply additive migrations). | The server is the order authority, written by the webhook. That is the S1 premise. | Table design and staging. | **2**: an additive schema in line with the founder's server-authoritative order rule. |
| **B1** | YES-PARTIAL | MEMORY:L38246 [2026-07-06 M84]: "Explicit constraints: do not redesign existing pages · standardize layouts · correct spacing · normalize typography". `docs/frontal-slayer/design-dna-canon/README.md:28`: "Canon pages are architectural references — … never redesign for consistency." | Any reorganisation must keep the canon rooms intact (Concierge, Orders, Rewards, Settings and others). | Approving the tree itself: 10 families, 3 new pages. | **1**: significant product IA. |
| **B2** | NO | None found. No "hair profile", "MY HAIR" or saved-build home in MEMORY. | — | All of it. | **1**: a new customer-facing product family. |
| **B3** | YES-PARTIAL | MEMORY:L29822 [2026-06-19]: "Account Profile CONCIERGE card visibility should follow premium subscription status only; standard rewards members should not see it." L29979: the founder put Slay Quests inside Concierge. | Concierge is a premium surface (the card is premium-only). **Rule exists, but the code conflicts**: the route is open to non-premium members. | What Concierge contains (messages, offers, gifts, quests). Folding tracking into order detail. | **1**: product scope of a canon room. |
| **B4** | YES-PARTIAL ⚠ | MEMORY:L29979 [2026-06-19]: "create a separate Concierge feature/section below SLAY CHALLENGE for SLAY QUESTS". CORE.md:60 lists Slay Challenge under Account / Concierge. | Precedent: the founder has kept Slay Challenge, and added Quests, in Concierge. | Moving it to Rewards, which contradicts the precedent. | **1**: needs an explicit founder reversal. |
| **B5** | YES-PARTIAL | MEMORY:L32042 [2026-06-23]: "account profile icon on tablet routes to mobile `/account` instead of `/desktop/account` (Penthouse Suite)". The fix (L32045) sends "768px+ viewports" to `/desktop/account`. | Keep the tablet/desktop redirect to the Penthouse Suite. This overrides the older CORE.md:39,43 "mobile-only" note (2026-03-26). | Making the numbers match by having the Penthouse read the shared overview API. | **3**: the founder directed the redirect. Data parity is engineering. |
| **B6** | YES-PARTIAL | MEMORY:L32242 [2026-06-24 Mobile Mansion shell]: "Explicit constraints: no final features, no Supabase, no business logic, no placeholder ecommerce pages — foundation only." | The Mansion is a foundation, not a live surface, which matches option 1. | Guarding or unlinking the routes. Fixing Playfair Display. | **3**: the founder framed it as foundation-only. The cleanup is engineering. |
| **B7** | YES-PARTIAL (weak) | MEMORY:L4406 [2026-03-29]: "PRIORITY MESSAGES (✓ 6 & 12 only)". | Priority messaging is a 6- and 12-month premium perk. | Two-way support threads for every member. | **1**: new member-facing support functionality. |
| **B8** | NO | None found. | — | The labels. | **1**: brand wording. |
| **C1** | YES-PARTIAL | `docs/frontal-slayer/ADMIN_ALIGNMENT_PROTOCOL.md:17,31` (founder mandate, MEMORY:L38267 [2026-07-06]): "Assume every existing admin page is finalized unless told otherwise." "If a page is not named, do not touch it." | Each admin page and fold needs explicit founder approval. The tree cannot be applied as a default. | Approving the tree, the 10 folds and the 5 new pages. | **1**: the founder mandated per-page approval. |
| **C2** | YES-PARTIAL | MEMORY:L2067 [2026-03-27]: "The founder-privileged identity (tier/subscription overrides, mock eligibility …) now uses kateenaarmstrong@gmail.com". L29371 [2026-06-19]: add-funds hooks broadened from founder-only to admin scope. | Founder and admin are already distinct identities. | A roles table, and who may refund or adjust money, with a threshold. | **1**: permission model and money authority. |
| **C3** | YES-PARTIAL | `ADMIN_ALIGNMENT_PROTOCOL.md:3` covers `/admin/dashboard`. `.cursor/rules/frontal-slayer-admin-alignment.mdc:14`: "Protected by default — … Do not redesign … unless the user explicitly names the page." | The dashboard is founder-protected. A redesign needs her explicit request. | Which queues and metrics to show. Removing fabricated numbers is a defect fix. | **1**: an admin redesign under founder protocol. |
| **C4** | YES-PARTIAL | MEMORY:L18688 [2026-05-27, founder-supplied Terms]: "custom unit processing 6–8 / 10 / 4–6 weeks". L13695 [2026-04-09]: consult tracking shows "PLACED / PROCESSING / COMPLETE" only. CORE.md:71: gift cards "digital 3-stage". | Overall processing windows, plus the consult and digital stage lists. | The canonical physical stage list, and SLA days per stage. | **1**: operational commitments only the founder can set. |
| **C5** | YES-PARTIAL ⚠ | MEMORY:L38449 [2026-07-06]: "Studio Command Center … should sit to the left of the Headquarters card". L39037: the founder separated the cards "until Command Center moves to its own routes/site". CORE.md:80 "mandatory boundary". | Keep STUDIO COMMAND CENTER and HEADQUARTERS cards on the FS admin dashboard for now. This contradicts V2 option 1. | When Command Center leaves the FS admin. | **3**: founder directive exists. Reopening it is the founder's call. |
| **D1** | YES-FULL | MEMORY:L29969 [2026-06-19]: the founder supplied "four tiers: TIER 1 — DISCOVER … TIER 4 — ICON". L30089: Tier 1 "at least 5/7". L30049: "three phase images: phase 1 locked/incomplete, phase 2 75% complete, phase 3 unlocked/full". L30052: "Do not generate collectible art". | 4 tiers (5/7, 4/7, 5/9, 6/9). Three phases, with phase 2 at 75% of the tier's own requirement. No new art. That is option 1. "3 requirements per reward" has no founder origin (R2 §5). | Rounding when 75% is not a whole number (engineering). Verifying the existing PNGs offline. | **3**: established canon. **Code conflicts**: `totalRequirements = 3`, and phase 2 fires at 67%. |
| **D2** | YES-FULL | MEMORY:L4406 [2026-03-29]: "CHALLENGES (✓ 3 / 6 / 12 mo) … SPECIAL OFFERS (✓ 12 mo only)". MEMORY:L19238 [2026-05-28]: user "asked to add LIVE ORDER TRACKING to the 3 MONTHS PREMIUM tier". | Matches option 1: challenges for all premium, special offers 12-month only, live tracking from 3 months. This supersedes the 2026-04-06 6/12 tracking block (L12363). **Code conflicts**: `psaFeatureGates.ts:14-16` and `concierge/page.tsx:1727-1728`. | Whether the separate "EXCLUSIVE REWARDS" chart row (12-month only) is distinct from CHALLENGES. | **3**: established. Aligning the code is engineering. |
| **D3** | YES-PARTIAL | Founder-supplied Tier Benefits Guide copy, MEMORY:L29518 [2026-06-19], rendered at `membership/page.tsx:2298`: "WELCOME BENEFITS ARE AWARDED ONCE UPON REACHING A NEW TIER." | Spend-tier welcome is once per new tier. | Premium welcome amounts (chart $10/$20/$40/$60 vs checkout $10/$20/$40), once per tier or per term, stacking, and what the "STANDARD $10" means. | **1**: money amounts. |
| **D4** | YES-PARTIAL | Founder TBG copy (MEMORY:L29518 [2026-06-19]) at `membership/page.tsx:2316`: "1.25X POINT MULTIPLIER ON ELIGIBLE PURCHASES". `:2366`: "12 MONTH … 2X … OVERRIDING RED AND BLACK TIER STATUS MULTIPLIERS". | Multipliers apply to eligible purchases. That is option 1 (eligible net × multiplier). The display's 1:1 total contradicts the founder copy. | The founder never states the base rate of 1 point per $1 (it exists only in code). | **3**: the formula follows from founder copy. Confirming the base rate is a one-line check. |
| **D5** | NO | None found. The `points_expiring` template exists (`docs/EMAIL_SYSTEM.md:51`), but no rule does. | — | Whether points expire at all, and how. | **1**: rewards economics. |
| **D6** | YES-PARTIAL | MEMORY:L20753 [2026-05-29]: the founder's chat replaced the copy with a "structured `AFFILIATE REWARDS PROGRAM` content block covering content submissions, social tag rewards, featured creator bonus". L20762: "600-point social reward structure". | The copy values (400/600/600, 5,000 per unit per 6 months, Featured Creator up to 1,500) are the founder's. | The hidden 2+2 sub-cap and whether to show it, whether multipliers apply, and the Featured Creator award process. | **1** (narrowed): the remaining items are economics. |
| **D7** | NO | None found. "+150 content review" and "+200 tag us" appear only in the code display list. | — | Points for review content. | **1**: rewards economics. |
| **D8** | YES-PARTIAL | MEMORY:L18660 [2026-05-27]: "User supplied stock FAQ Q&A … member referral $20 + $10 newsletter". The affiliate copy of 2026-05-29 (L20753) includes referral rewards. | $20 off for the friend and $20 digital cash for the referrer. | Timing (confirmation or delivery), activation, reversal on refund, stacking with +100 and the quests. | **1**: commercial policy. |
| **D9** | YES-PARTIAL | Founder TBG copy at `membership/page.tsx:2304` ("250 BONUS LOYALTY POINTS"), `:2329` ("STATUS PROTECTION BENEFIT"), `:2338` ("ANNUAL CONSULTATION BENEFIT"). Slay reward lists supplied by the founder (MEMORY:L29969). | Tier welcome bonuses are defined: 250, 500 or 1,000 points plus vouchers. Every other perk is **named only**. | Contents, trigger and fulfilment for Mystery, Early Access, Expedited, Free Shipping credit, 2X/2.5X/3X, Annual Consultation and Status Protection. | **1**: perk definitions. |
| **D10** | NO | None found. Only the code default (`psaFeatureGates.ts:33`). | — | The default tier. | **2**: fail closed (least privilege). Unknown data should not grant the top tier. |
| **D11** | YES-PARTIAL | MEMORY:L29918 [2026-06-19]: "premium anniversary rewards should be 500 points for 3 months, 1,000 points for 6 months, and 1,500 points for 12 months". L29928: keep the amounts internal. | Amounts per tier, and that they stay out of client copy. | Whether renewals re-trigger, and whether it is per term or per year. | **1**: rewards economics. |
| **D12** | NO | None found. "Hair bestie" is only a PSA voice pillar (CORE.md:16; R2 §4). | — | Drop the term or define it. | **1**: only the founder knows whether she intends this reward. Trivial to resolve. |
| **D13** | NO (indirect only) | MEMORY:L4954 [2026-03-29]: user resized the "birthday gift: $20 gift card vs 200 loyalty points" thumbnail. That is a UI tweak, not a rule. | Nothing firm. It hints that the two options exist with founder awareness. | Eligibility (premium vs affiliates), claim window, fulfilment. | **1**: perk economics. |
| **E1** | YES-PARTIAL | MEMORY:L27267 [2026-06-10]: "User requested 3, 6, and 12 month subscription members get only one free hairstyle analysis per month". L27275: pay after the free one. MEMORY:L27490 [2026-06-12]: 1 = $20, 4 = $60. | Subscriber allowance and paid credit prices. The "not BLACK-only" exclusion was agent implementation, not founder authority. | Non-subscriber purchase and use, BLACK spend tier, and how the bonus credit is granted. | **1**: product eligibility. |
| **E2** | YES-PARTIAL | MEMORY:L27244 [2026-06-09]: "User clarified `/tools/hairstyle-analysis` should test templates via Fal GPT Image 2". L27247: PSA hidden "on debug/test only" including this path. L27334: "admin generate". | The founder treats the route as a test harness. **Conflict**: `design-dna-canon/README.md:21` (M84, agent-seeded) lists it as the customer "Hair Analysis" canon room. | Fixing the canon list once the route is admin-only. | **2**: gating a credit-consuming test harness is standard practice, consistent with the founder's own framing. |
| **E3** | NO | None found for FS. Only the order-form upload privacy note, MEMORY:L28785 [2026-06-17]. | — | Consent text, retention days, deletion. | **1**: legal and brand wording, plus retention policy. |
| **E4** | YES-FULL ⚠ | MEMORY:L33067 [2026-07-02]: "User asked: … non-members on customize/edit → sign-in (guests) or upgrade subscription modal (signed-in non-premium)". L33206 [2026-07-02]: "edit still requires premium". | Editing from cart is **premium-only**, which is option 2. This is later than CORE.md:50 (sign-in only), so **CORE.md:50 is stale**. V2 option 1 contradicts the founder. | Fixing CORE.md:50. | **3**: established by the latest founder directive. |
| **E5** | NO | None found. | — | — | **2**: a single code-defined catalogue is a source-of-truth fix. An admin price editor would be a later product decision. |
| **E6** | YES-PARTIAL ⚠ | MEMORY:L28468 [2026-06-14]: "User requested PSA hair analysis reflect 24-hour delivery — not immediate in-chat results." | The 24-hour delivery promise is founder canon. V2 option 1's "PSA picks immediately" contradicts it, and option 2 (remove the 24h promise) contradicts it too. | Building delivery within 24h, and fulfilling the consult add-on. | **3**: the promise is set. The pipeline is engineering. |
| **F1** | YES-PARTIAL | MEMORY:L29958 [2026-06-19]: the founder described Slay Cam as "public community content, real client photos/videos". L30019: the founder asked for a lookbook redesign; the "stats" and mock posts were the agent's build. | The founder intends Slay Cam to show real clients. The fabricated stats have no founder authority. | Remove the stats, or label the posts as curated. | **1**: public brand copy, with a strong truth-in-advertising case for option 1. |
| **F2** | NO | None found. | — | All wording. | **1**: legal wording (the founder, with counsel). |
| **F3** | YES-PARTIAL | MEMORY:L34156 [2026-07-03]: "User asked to update the REVIEWS tab on all product pages … show coming-soon copy for real client experiences". L29209: `/brand/reviews` copy "YOUR REVIEW COULD BE THE FIRST. SOON YOU'LL FIND…". | The founder intends to show reviews publicly on PDPs and `/brand/reviews`. | Consent gating (F2) and moderation. | **3**: intent established. Publication waits on F2. |
| **F4** | YES-PARTIAL | MEMORY:L29958 [2026-06-19]: "future Slay MVP recognition". L30019: "Slay MVP front and center". | An MVP exists, so "no MVP" is out. | Who selects it, how often, and the reward. | **1**: reward economics. |
| **F5** | NO | None found. | — | Moderation policy and the report threshold N. | **1**: community policy. |
| **G1** | YES-PARTIAL | CORE.md:39: "MOBILE-ONLY RIGHT NOW." CORE.md:43: "Desktop layout/version will be created later as a separate phase." (MEMORY:L1164 [2026-03-26]). Later founder desktop work lives in `/desktop/*`. | Mobile pages are the build target. Desktop is a separate experience and phase. | Column widths for account pages at ≥768px. | **1**: visual and layout. |
| **G2** | NO | None for FS admin navigation. The Admin Alignment Protocol applies. | — | Drawer or side rail. | **1**: admin visual change under founder protocol. |
| **G3** | NO | None for FS admin width. The Admin Alignment Protocol applies. | — | Wide shell and widths. | **1**: same as G2. |
| **G4** | NO | None. M84 canon protection applies to Rewards and Orders (`design-dna-canon/README.md:22-23`). | — | Panel visuals. | **1**: visual change to canon rooms. |
| **G5** | NO | None found (no Trend Desk or Slay Forecast Broadcast styling directive). | — | Dark or marble. | **1**: visual. Also protected by the admin protocol. |
| **G6** | NO | None. The Slay "do not generate collectible art" rule (MEMORY:L30052) covers a different system. | — | Commission art or keep the placeholder. | **1**: art commission and brand. |
| **H1** | NO | None found. | — | The launch scope. | **1**: production-risk acceptance. |
| **H2** | NO | None. Conflicting environment facts: MEMORY:L30294 [2026-06-21] calls `fsbw.vercel.app` staging ("Not for production `frontalslayer.com`"). L29056 says `isPreviewEnvironment` treats `*.vercel.app` as preview. The audit says E2E targets production. | — | Which host is production, whether Supabase branching is on the plan, and whether Stripe test keys exist. | **4**: inspect the Vercel, Supabase and Stripe configuration first. |
| **H3** | YES-PARTIAL | MEMORY:L54143 [2026-08-18]: "Founder sprint — extract SITE 00 from Frontal Slayer monorepo into independent product". L54152: "still shares project `hyycomvcaqxxvyrfupes` — no destructive split". `docs/site00/STANDALONE_EXTRACTION_STATUS.md:58`. | The founder intends SITE 00 to be independent. A split must not be destructive. | When the SITE 00 Supabase project moves (SITE 00 scope). | **2**: checking each FS migration for SITE 00 impact is standard practice and aligned with the founder's direction. |

### Counts

- **Authority found:** 3 YES-FULL (D1, D2, E4) · 32 YES-PARTIAL · 20 NO.
- **Categories:**
  - **1 (TRUE FOUNDER DECISION):** 35. A2, A4, A5, B1, B2, B3, B4, B7, B8, C1, C2, C3, C4, D3, D5, D6, D7, D8, D9, D11, D12, D13, E1, E3, F1, F2, F4, F5, G1–G6, H1.
  - **2 (ENGINEERING DEFAULT):** 9. A1, A3, A6, A7, A9, D10, E2, E5, H3.
  - **3 (ALREADY ESTABLISHED):** 9. B5, B6, C5, D1, D2, D4, E4, E6, F3.
  - **4 (BLOCKED BY MISSING EVIDENCE):** 2. A8, H2.
- **Founder authority contradicts the V2 recommendation in 4 rows:** B4 (precedent only), C5, E4, E6. In each, the V2 option 1 reverses a founder directive. They should be presented to the founder as reversals, not as defaults.
- **"Rule exists, but code or DB conflicts":** A1 (live policies), B3 (route open to non-premium), D1 (`totalRequirements = 3`), D2 (`psaFeatureGates.ts:14-16`, `concierge/page.tsx:1727`), D4 (1:1 display), E4 (CORE.md:50 stale, not the code). A3 and A5 also fall partly here.

---

## 2. FD-* coverage (doc 24 → V2)

| Doc 24 id | Subject | V2 decision(s) |
|---|---|---|
| FD-C1 | Security and money hotfix migration | A1 (A6 via FD-R14) |
| FD-C2 | Additive schema plan | A9 |
| FD-C3 | BAW checkout until server pricing | A2 |
| FD-C4 | Remediation for 4-pack analysis buyers | A8 |
| FD-C5 | Non-Stripe CONFIRM ORDER on upgrade | A3 |
| FD-C6 | Cancellation UX | A4 |
| FD-C7 | Mock / demo data | A5 |
| FD-C8 | UGC and selfie consent wording | E3, F2 |
| FD-C9 | `/account/payment` | A4 |
| FD-C10 | Order status vocabulary | C4 |
| FD-C11 | Slay Cam fabricated stats | F1 |
| FD-A1 | Customer page tree | B1 |
| FD-A2 | MY HAIR | B2 |
| FD-A3 | Concierge tracking → order detail | B3 |
| FD-A4 | Slay Challenge → Rewards | B4 |
| **FD-A5** | **Slay Quests (hardcoded progress): hide until real** | **NOT CARRIED FORWARD** |
| FD-A6 | `/tools/hairstyle-analysis` admin-only | E2 |
| FD-A7 | Mobile Mansion | B6 |
| FD-A8 | BAW edit-from-cart gate | E4 |
| FD-A9 | `/account` ≥768px → Penthouse | B5 |
| FD-B1 | Admin page tree | C1 |
| FD-B2 | Roles | C2 |
| FD-B3 | Money-action authority | C2 |
| FD-B4 | Admin desktop width | G3 |
| FD-B5 | Order stage SLAs | C4 |
| FD-R1 | Slay Challenge structure | D1 |
| FD-R2 | Reveal art | D1 |
| FD-R3 | Slay Challenge eligibility | D2 |
| **FD-R4** | **Selection window (last 3 days) + per-user server reward options** | **NOT CARRIED FORWARD** (D1 does not mention it) |
| FD-R5 | (= FD-C5) | A3 (through FD-C5). D2's citation of "FD-R5" is a mis-citation, see below |
| FD-R6 | Unknown premium = 12 months | D10 (D2 also cites it, wrongly) |
| FD-R7 | Hair-analysis eligibility and paid tiers | E1 (D3 also cites it, wrongly) |
| FD-R8 | Points formula, expiry, voucher validity | D4, D5 (voucher validity not explicitly carried) |
| FD-R9 | Referral | D8 |
| FD-R10 | Affiliate points | D6, D7 |
| FD-R11 | Spend-tier vs premium welcome stacking | D3 |
| **FD-R12** | **Vouchers force-cleared for real customers; which events issue vouchers** | **NOT CARRIED FORWARD** |
| FD-R13 | (= FD-C6) | A4 (implicitly, through FD-C6; not cited) |
| FD-R14 | Slay Ticket payment proof | A6 |

**Gaps (doc 24 ids not carried into any V2 decision):**
- **FD-A5**: Slay Quests (hide until real progress exists).
- **FD-R4**: Slay Challenge selection window, and moving per-device random options to the server.
- **FD-R12**: vouchers wiped for real customers and voucher issuance events (`account/page.tsx:397-406`).
- **Partial gap, FD-R8**: voucher validity. Founder copy already settles it: "VALID FOR 6 MONTHS FROM THE DATE OF REDEMPTION" (`membership/page.tsx`, TBG; MEMORY:L29518 [2026-06-19]).

**Mis-citations in V2 "Prior audit ids".** These ids were mixed up with R2's numbered "FOUNDER DECISIONS REQUIRED" list:
- D2 cites FD-R5 and FD-R6. In doc 24, FD-R5 is the non-Stripe confirm order and FD-R6 is the unknown-tier default. They match R2 items #5 (special offers) and #6 (live tracking).
- D3 cites FD-R7. In doc 24 that is hair analysis; it matches R2 #7 (premium welcome).
- D9 cites FD-R15 and FD-R16, and D13 cites FD-R17. **These ids do not exist in doc 24 or any audit appendix.** They match R2 #15, #16 and #17.

**V2 decisions with no FD id (new in V2):** A7, B7, B8, C3, C5, D11, D12, E5, E6, F3, F4, F5, G1, G2, G4, G5, G6, H1, H2, H3.

---

## 3. Founder rules on mobile vs desktop/tablet separation

Frontal Slayer:
1. **CORE.md:39 and :43** (MEMORY:L1164 and L1723 [2026-03-26]): "MOBILE-ONLY RIGHT NOW. Treat this project as mobile-only for implementation, manual QA, automated tests…" and "Desktop layout/version will be created later as a separate phase." Repeated in `founder-intelligence/FOUNDER_PREFERENCES.md:20` ("Mobile-first QA — real phone default") and `DECISION_HISTORY.md:48-56` (D-003).
2. **MEMORY:L30294 [2026-06-21]**: desktop is built as a separate `/desktop/*` "skyscraper". "Not for production `frontalslayer.com` until desktop launches."
3. **MEMORY:L30822-30824 [2026-06-22]**: "user reported iPad should not get phone artboard/letterboxing — restore native desktop on iPad". Scaled artboard applies to phones only.
4. **MEMORY:L31011 [2026-06-22]**: "Artboard now phones only (≤767px) …; tablets (768px+) use native desktop layout like monitors."
5. **MEMORY:L30798-30800 [2026-06-22]**: user asked to "hide the floating PSA on desktop/tablet" (PSA lives only in the PSA Suite). "mobile site FAB unchanged."
6. **MEMORY:L32042-32045 [2026-06-23]**: tablet account icon must go to `/desktop/account` (Penthouse Suite). `/account` redirects for 768px+. "mobile `/account` unchanged" (L31761).
7. **MEMORY:L31337-31340 [2026-06-23]**: separate placement profiles. "desktop (viewport ≥1024px) … tablet (768–1023px native layout) … Phone artboard ≤767px excluded."
8. **MEMORY:L32242 [2026-06-24]**: Mobile Mansion `/mobile/*` is "foundation only", with no final features.
9. **`src/components/AccountHubRedirect.tsx:8`** (code comment): "Tablet / desktop clients land on Penthouse Suite instead of mobile `/account`."

**Net for FS:** item 1 (mobile-only) is the oldest founder rule. Items 3–7 (June 2026) set three tiers: phone ≤767px uses the mobile site, tablet 768–1023px and desktop ≥1024px use the native `/desktop/*` experience. Mobile stays unchanged throughout. CORE.md:39-43 was never updated to reflect this.

Other products in the same repo (not FS, but the same founder's separation rules):
- **SITE 00, MEMORY:L53028 [2026-08-18]**: "Founder reported desktop Origin was changing despite explicit mobile-only requests." The fix scoped all mobile CSS to ≤767px. L53062: "desktop design only — do not touch mobile."
- **AIO client migration, MEMORY:L55430 [2026-10-07]**: Founder: "are these responsive for tablet/desktop? they should be." L55452 [2026-10-08]: "Founder approved root masters for tablet (834×1194) and desktop (1440×900). 'DO NOT SCALE. REFLOW.' Phone authorities stay locked."
- **Studio OS Experience Lab, MEMORY:L48546 [2026-07-13]**: "Desktop is canonical master; mobile is responsive adaptation of same architecture." This applies to Studio OS only.
