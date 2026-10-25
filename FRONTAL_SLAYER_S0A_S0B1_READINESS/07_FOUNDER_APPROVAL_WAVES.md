# 07 — Founder Approval Waves

The 55 original decisions (plus 3 carried forward from the audit and 3 new experience decisions) are triaged in `06_FOUNDER_DECISION_TRIAGE.csv`. Only **genuine founder decisions** go into a wave. Engineering defaults are listed for **acknowledgement or objection**, not approval. Already-established rules are listed with their evidence, and can be **reversed** but need not be re-decided.

**Approving a wave approves only the decisions listed in that wave.** It does not approve implementation of other waves, any page design, or any production change that the wave does not name. **Nothing below has been approved.** Every state is RECOMMENDED or BLOCKED.

| Classification of the 55 originals | Count |
|---|---|
| Genuine founder decisions | 34 |
| Engineering defaults | 8 |
| Already established (evidence cited) | 11 |
| Blocked by missing evidence | 2 |
| **Total** | 55 |
| Carried forward from the audit (dropped by V2, never deleted) | D14 (FD-A5), D15 (FD-R4), D16 (FD-R12) |
| New, from the experience-authority correction | XD-1, XD-2, XD-3 |


## WAVE 1 — Immediate security and operational safety

**1 founder decision.** Approving this wave authorizes: Rehearsing the S0B-1 database containment (M1A, M2, M3) on a staging environment, then, after a second explicit approval (A1b) backed by the staging evidence, applying the same files to production.

**It does not authorize:** Any application change (S0B-2), any page-tree work, any rewards rule, M1B (blocked), any SITE00 object.

| ID | Decision | Type | Original V2 recommendation | Proposed disposition (this sprint) | Gate |
|---|---|---|---|---|---|
| A1 | Approve the P0A database containment migration | Founder | 1. Approve narrowly scoped migration with prepared rollback, rehearsed on a Supabase branch, SITE00 smoke-tested | Split into two approvals: A1a rehearse M1A+M2+M3 on staging; A1b apply the same files to production after the staging evidence pack. M1B stays blocked (U-01). | S0B-1 |
| H2 | Staging environment for signed-in verification | Blocked by evidence | 1. Supabase branch + Stripe test mode + seeded test accounts (customer standard/premium, admin, founder) | Recommend option: separate staging Supabase project + Vercel Preview on a staging domain + Stripe test mode (doc 13). Founder chooses once the operator confirms the Supabase plan tier, production host and Stripe test keys. | S0B-1 precondition |
| H3 | SITE00 shares the Supabase project | Engineering default | 1. Coordinate every FS migration with a SITE00 impact check now; plan SITE00 move to its own project | Engineering default: every FS migration gets a shared-database impact review (doc 11); FS never alters SITE00-owned objects; SITE00 owner notified and runs the SITE00/JURNL smoke (doc 11 §4). Founder acknowledges, no choice required. | Every DB sprint |

## WAVE 2 — Application payment and security containment

**4 founder decisions.** Approving this wave authorizes: The S0B-2 containment items in doc 15: BAW interim checkout path, cancellation path, mock quarantine, Slay Ticket pause, autopay dormancy, Slay Cam copy.

**It does not authorize:** Any visual redesign, any reward economics, the order of record (S1), any desktop/tablet presentation work.

| ID | Decision | Type | Original V2 recommendation | Proposed disposition (this sprint) | Gate |
|---|---|---|---|---|---|
| A2 | Build-A-Wig checkout until server pricing exists | Founder | 1. Concierge-confirmed custom quote: Atelier and bag stay open; custom lines become "Request my custom quote" → admin sends consult offer → customer pays the server-held quoted amount | Founder chooses the interim BAW path. Recommendation unchanged (option 1: Concierge-confirmed custom quote), with the corrected evidence that BAW is currently undercharged, not blocked. | S0B-2 |
| A3 | Non-Stripe CONFIRM ORDER on /checkout/upgrade | Engineering default | 1. Disable in production (keep for non-production demo builds only) | Engineering default: remove the non-Stripe CONFIRM ORDER membership path from production (dev-only flag). | S0B-2 |
| A4 | Membership cancellation and saved payment methods | Founder | 1. Stripe Customer Portal for cancel/plan/payment methods | Founder chooses portal vs in-app cancel. Stopping raw card inputs on /account/payment is an engineering default. Portal must be configured for cancel-at-period-end only so it cannot contradict the established upgrade/downgrade policy. | S0B-2 |
| A5 | Mock / demo / seed data in production | Founder | 1. Quarantine all mock paths behind ?demo=1 on non-production hosts; founder "view as client" shows real data | Engineering default (per this brief: accurate empty states over fabricated records): quarantine all mocks from customers and admins. Founder decides only whether the founder's own production account keeps founder-only demo data. | S0B-2 |
| A6 | Slay Ticket purchases | Engineering default | 1. Pause pack purchases until webhook-only crediting ships (in S0B-2) | Engineering default: pause Slay Ticket pack purchases until webhook-only crediting exists; balances and spending stay. | S0B-2 |
| A7 | Booking autopay final payments | Engineering default | 1. Keep autopay off until server-sourced IDs and amounts ship; collect final balances manually meanwhile | Engineering default: keep autopay dormant until card/amount are resolved server-side; do not fix the cron first. Deposit wording/collection preference recorded as U-16 for the founder. | S0B-2 |
| A8 | Remediation for customers affected by money defects | Blocked by evidence | 1. Check Stripe for any 4-pack analysis or Slay Ticket or BAW payments; refund or grant manually with audit | Blocked: run read-only Stripe queries (4-pack payments, billed-after-cancel, Slay Ticket/BAW charges). Database side already known: 0 grants, 0 orders, 0 subscriptions (live 2026-10-25). | S0B-2 |
| E2 | /tools/hairstyle-analysis harness | Engineering default | 1. Admin-only; customers redirect to MY HAIR › ANALYSES | Engineering default: /tools/hairstyle-analysis becomes admin-only (credit-consuming test harness); fix the design-dna canon list accordingly. | S0B-2 |
| F1 | Fabricated Slay Cam stats and testimonials | Founder | 1. Remove stats; label posts as curated editorial until real submissions exist | Founder approves the public Slay Cam copy. Recommendation: remove the fabricated stats and named testimonials; show an accurate empty state until real approved submissions exist. | S0B-2 |

## WAVE 3 — Customer and admin experience architecture

**6 founder decisions.** Approving this wave authorizes: The mobile account tree (B1), the admin tree per page (C1), roles (C2), order stages (C4) and the experience-authority questions XD-1/XD-2.

**It does not authorize:** Visual designs of new pages (each still needs its own approval), rewards rules, any change to the desktop Tower rooms.

| ID | Decision | Type | Original V2 recommendation | Proposed disposition (this sprint) | Gate |
|---|---|---|---|---|---|
| B1 | Approve the customer page tree (10 families, 21 routed pages, 3 new) | Founder | 1. Approve as proposed | Re-scoped as the MOBILE account tree only (10 families, 21 URLs). Desktop/tablet access to the same capabilities is decided separately (XD-1). No universal responsive shell. | S2 (mobile) |
| C1 | Approve the admin page tree (15 families, 24 routed pages, 5 new, 10 folded) | Founder | 1. Approve as proposed | Founder approves per page (Admin Alignment Protocol: every admin page finalized unless named). Present the 5 new pages and 10 folds as separate approvals. | S3 |
| C2 | Admin roles and money authority | Founder | 1. admin_roles: FOUNDER / ADMIN (STAFF later); refunds and adjustments above a threshold need FOUNDER | Founder sets the admin role model and money-action thresholds. | S3 |
| C4 | Canonical order status vocabulary and stage SLAs | Founder | 1. pending_payment → paid → awaiting_form → confirmed → in_production (sourcing, constructing, cleansing, customizing, finalizing) → shipped → delivered; + canceled, refunded, issue; digital: paid → processing → complete; founder supplies SLA days per stage | Founder sets the canonical physical-order stage list and SLA days. Established inputs: custom processing windows (Terms 2026-05-27), consult stages PLACED/PROCESSING/COMPLETE, digital 3-stage gift cards. | S1 |
| XD-1 | How desktop/tablet customers reach account capabilities that have no desktop presentation today | Founder | 1. Keep the hand-off to mobile pages as an explicit INTERIM, and design desktop/tablet presentations capability by capability in the Tower language (each approved separately) | Founder decides. Recommendation option 1, capability order: orders/order detail, rewards/membership, settings. | S2+ |
| XD-2 | Tablet (768–1023px) experience authority | Founder | 1. Tablet = desktop/tablet experience everywhere (one 768px threshold) | Founder decides. Recommendation option 1 (matches the latest tablet directives). | S2 |
| XD-3 | Is the desktop/tablet Tower live on the production domain? | Blocked by evidence | — | Blocked by evidence: which domain serves production (doc 12 A5) and what production visitors at ≥1024px see today. | H1 |

## WAVE 4 — Rewards and membership economics

**11 founder decisions.** Approving this wave authorizes: The rule values that S4–S6 implement. Established rules (D1, D2, D4, D11 amounts, D6 copy values, D8 amounts) are recorded, not re-asked.

**It does not authorize:** Implementation of any reward; the $20 referral incentive is not implemented automatically.

| ID | Decision | Type | Original V2 recommendation | Proposed disposition (this sprint) | Gate |
|---|---|---|---|---|---|
| D3 | Welcome credits | Founder | 1. Founder confirms amounts, once-per-tier vs per-term, and whether premium and spend-tier credits stack | Founder sets premium welcome amounts and stacking. Established: spend-tier welcome is once per new tier. | S4 |
| D5 | Points expiry | Founder | 1. Points never expire (retire points_expiring email) | Founder decides whether and how points expire. | S4 |
| D6 | Affiliate rewards and caps | Founder | 1. Confirm copy values as canonical; caps per copy; show sub-caps; no multipliers; define Featured Creator later | Established: copy values 400/600/600, 5,000 per unit per 6 months, Featured Creator up to 1,500. Founder decides only: hidden 2+2 sub-cap, multipliers, Featured Creator award process. | S6 |
| D7 | Points for review content | Founder | 1. Founder sets review-content points (or none) | Founder decides points for review content. | S5 |
| D8 | Referral program rules | Founder | 1. Confirm $20/$20; credit when the referred order is delivered; reverse on refund/cancel; no stacking with +100 earn task | Established: $20 off friend / $20 digital cash referrer. Founder decides timing, activation, reversal, stacking. Not implemented automatically. | S6 |
| D9 | Undefined perks | Founder | 1. Define each (contents, trigger, fulfilment) or remove its copy | Established: tier welcome bonuses 250/500/1,000 + vouchers (founder copy). Founder defines contents/trigger/fulfilment of the named-only perks. | S4 |
| D11 | Anniversary semantics | Founder | 1. Once per completed term, including renewals | Established: 500/1,000/1,500 by 3/6/12 months, amounts internal. Founder decides renewal re-trigger semantics. | S4 |
| D12 | "Hair Bestie Bonus" | Founder | 1. Drop the term | Founder: drop the term "Hair Bestie Bonus" or define it. | S4 |
| D13 | Birthday gift | Founder | 1. Premium only; claim window around birthday; fulfilled via ledger | Founder sets birthday gift eligibility, claim window and fulfilment. | S4 |
| E1 | Hair Analysis eligibility and bonus credits | Founder | 1. Subscribers + anyone who buys credits may use purchased credits; BLACK gets no free monthly; bonus credit = one paid-credit grant | Established: 1 free per month for 3/6/12-month members; paid 1=$20, 4=$60. Founder decides non-subscriber use, BLACK spend tier, bonus-credit grant path. | S5 |
| D15 | Slay Challenge selection window and server-side reward options | Founder | 1. Server picks the 2 options per user per tier; selection open for the cycle | Founder decides the selection window. Moving option generation to the server is an engineering default (cross-experience consistency). | S4 |

## WAVE 5 — Remaining product and experience decisions

**15 founder decisions.** Approving this wave authorizes: Product, legal-wording and visual decisions for S2/S3/S5/S6 and the launch definition.

**It does not authorize:** Anything in waves 1–4.

| ID | Decision | Type | Original V2 recommendation | Proposed disposition (this sprint) | Gate |
|---|---|---|---|---|---|
| B2 | MY HAIR as its own family (profile, analyses, builds) | Founder | 1. Own family /account/hair with 3 tabs + analysis detail route | Founder decides MY HAIR as a MOBILE family. Desktop/tablet already has a Penthouse Analysis Lab room; its account-history presentation belongs to XD-1. | S5 |
| B3 | Concierge scope | Founder | 1. Premium-only page: messages (with replies), offers, orders-in-progress links, gifts; tracking → order detail | Founder decides Concierge contents. Established: Concierge is premium-only (code conflicts: route open to non-premium). | S2 |
| B7 | Support for all members (MY REQUESTS + replies) | Founder | 1. support_requests threads for everyone; premium keeps priority routing | Founder decides two-way support for all members. Established: priority messages are a 6/12-month perk. | S6 |
| B8 | Navigation labels (creative) | Founder | 1. Use proposed labels | Founder approves navigation labels (mobile). | S2 |
| C3 | Command Center content | Founder | 1. Queues first (forms, ready to ship, delayed, approvals, inbox, meetings, offers expiring, low stock) + system alerts + 4 metrics | Removing fabricated numbers is an engineering default (S0B-2 #8, no layout change). Founder decides which queues/metrics the Command Center shows. | S3 |
| E3 | Selfie consent, retention and deletion | Founder | 1. Founder-approved consent text; private storage; retention N days (founder sets); delete on request and account deletion | Founder (with counsel) approves selfie consent wording, retention and deletion. | S5 |
| F2 | UGC consent, usage rights and retention wording | Founder | 1. Founder supplies wording (or approves a drafted version reviewed by counsel) | Founder (with counsel) approves UGC consent and usage-rights wording. | S5 |
| F4 | Slay MVP selection and reward | Founder | 1. Admin picks MVP per period; reward defined by founder | Established: a Slay MVP exists. Founder decides selection, cadence and reward. | S5 |
| F5 | Lounge comment moderation | Founder | 1. Keep live posting; auto-hide at N unique reports (founder sets N); admin queue | Founder sets community moderation policy and report threshold. | S5 |
| G2 | Admin menu drawer | Founder | 1. Hamburger drawer in AdminHeader using the existing menu-toggle card pattern | Founder approves any admin navigation change (drawer/rail). | S3 |
| G3 | Admin wide shell and Command Center layout | Founder | 1. 448 phone · 720 tablet · 1280 desktop shell on marble, glass panels | Founder approves any admin width change. | S3 |
| G4 | Account Overview status panels and MY HAIR page visuals | Founder | 1. Approve panels in the existing glass card language (screenshot review in S2) | Mobile-only: status panels on the mobile /account hub and MY HAIR visuals. The Penthouse Suite keeps its own design. | S2/S5 |
| G5 | Trend Desk and PSA Broadcast re-skin | Founder | 1. Re-skin onto marble/glass admin shell | Founder decides Trend Desk / PSA Broadcast visual treatment. | S6 |
| G6 | Certification collectible art | Founder | 2. Keep placeholder | Founder decides whether to commission certification collectible art or keep the placeholder. No art is generated by engineering. | — |
| H1 | Launch definition | Founder | 1. Launch-critical = P0A + P0B + S2 + S3 + S4 at H (verified) with doc 19 launch rows passing; S5/S6 may follow | Founder defines launch scope — now per experience (mobile, desktop/tablet, admin). | S7 |

## No wave: engineering defaults and established rules (for acknowledgement or objection)

| ID | Subject | Type | Evidence / reason | Disposition |
|---|---|---|---|---|
| A9 | Approve the additive schema plan (orders first) | Engineering default | MEMORY L24162 (2026-06-03). | Engineering default: additive order-of-record schema (S1). |
| D10 | Unknown premium tier default | Engineering default | None needed. | Engineering default: an unknown tier fails closed (least privilege), never defaults to 12-month privileges. |
| E5 | Build-A-Wig price catalogue ownership | Engineering default | None needed. | Engineering default: one code-defined BAW catalogue used by client and server (S1B). An admin price editor would be a later product decision. |
| B4 | Where Slay Challenge lives | Established | MEMORY L29979 (2026-06-19); CORE.md:60. | Slay Challenge (and Quests) stay in Concierge. V2 recommendation to move them to Rewards is withdrawn; a move would be a founder reversal. |
| B5 | /account on tablet/desktop | Established | MEMORY L32042/L32045 (2026-06-23). | ≥768px /account → /desktop/account (Penthouse Suite) stays. The "pause redirect / 720px column" options are withdrawn. Data parity (one server source) is engineering. |
| B6 | Mobile Mansion /mobile/* placeholder pages | Established | MEMORY L32242 (2026-06-24). | Mobile Mansion /mobile/* stays a foundation-only, unlinked prototype. Guarding routes and the Playfair token are engineering hygiene. |
| C5 | Studio OS boundary | Established | MEMORY L38449/L39037 (2026-07-06); CORE.md:80. | Studio Command Center and Headquarters cards stay on the FS admin dashboard until Command Center moves to its own routes. V2 option 1 withdrawn. |
| D1 | Slay Challenge requirement and reveal model | Established | MEMORY L29969/L30089/L30049/L30052 (2026-06-19). | 4 tiers (5/7, 4/7, 5/9, 6/9), choose 1 of 2, 3 phases with phase 2 at 75%, no new art. Code conflicts (totalRequirements=3; 67%) are engineering fixes. |
| D2 | Benefit eligibility conflicts | Established | MEMORY L4406 (2026-03-29), L19238 (2026-05-28). | Challenges for all premium; special offers 12-month only; live order tracking from 3 months. Code conflicts (psaFeatureGates.ts:14-16, concierge/page.tsx:1727) are engineering fixes. |
| D4 | Purchase points formula | Established | Founder TBG copy, membership/page.tsx:2316, 2366 (MEMORY L29518). | Multipliers apply to eligible purchases (eligible net × multiplier; 12-month 2X overrides). Base rate 1 point/$1 exists only in code: one-line founder confirmation optional. |
| E4 | Edit-from-cart gate | Established | MEMORY L33067/L33206 (2026-07-02). | Edit-from-cart is premium-only (latest founder directive). V2 option 1 withdrawn; CORE.md:50 is stale (doc fix). |
| E6 | Asynchronous deliverables (PSA picks, consult add-on) | Established | MEMORY L28468 (2026-06-14). | PSA hair analysis keeps the 24-hour delivery promise; engineering builds the delivery. V2 options that removed or replaced the promise are withdrawn. |
| F3 | Public review display | Established | MEMORY L34156 (2026-07-03), L29209. | Reviews will be shown publicly on PDPs and /brand/reviews; publication waits on F2 consent. |
| G1 | Account desktop column widths | Established | MEMORY L31011 (2026-06-22), L32042 (2026-06-23); this brief. | Moot: ≥768px customers are in the desktop/tablet experience. No 720/960 widened mobile column. Residual question moved to XD-1. |
| D14 | Slay Quests show hardcoded progress | Established | This brief (2026-10-25). | No fabricated progress (this brief: accurate empty states over fabricated records). Engineering chooses empty state vs hide by data availability. |
| D16 | Vouchers wiped for real customers; which events issue vouchers | Engineering default | Founder TBG copy (6-month validity, MEMORY L29518). | Engineering default: stop the wipe (defect). Issuance events are decided inside D3/D9. Voucher validity (6 months from redemption) is established founder copy. |

## Where the V2 recommendation was withdrawn or superseded

| ID | Status | Why |
|---|---|---|
| B1 | SUPERSEDED | Significant product IA; the prior tree wrongly assumed a responsive scale-up for ≥768px. — design-dna-canon README:28 and MEMORY L38246 (do not redesign canon rooms). |
| B4 | WITHDRAWN | Founder precedent exists. — MEMORY L29979 (2026-06-19); CORE.md:60. |
| B5 | SUPERSEDED | Founder directed the redirect. — MEMORY L32042/L32045 (2026-06-23). |
| C5 | WITHDRAWN | Founder directive exists. — MEMORY L38449/L39037 (2026-07-06); CORE.md:80. |
| E4 | WITHDRAWN | Latest founder directive. — MEMORY L33067/L33206 (2026-07-02). |
| E6 | WITHDRAWN | Founder canon. — MEMORY L28468 (2026-06-14). |
| G1 | SUPERSEDED | Superseded by the experience authority correction and the established routing. — MEMORY L31011 (2026-06-22), L32042 (2026-06-23); this brief. |

## Immediate founder actions (Wave 1)

1. **H2: staging.** Ask the operator for three facts: the Supabase plan tier, the production domain, and whether Stripe test keys exist. Then choose the staging option (doc 13 recommends a separate staging Supabase project + Vercel Preview + Stripe test mode).
2. **A1a: approve rehearsal** of M1A, M2 and M3 on staging. A1b (production) comes later, as a separate approval with the evidence attached.
3. **H3: acknowledge** the shared-database rules and ask the SITE00 owner to run the SITE00/JURNL smoke test on staging (doc 11 §4).
4. **U-01 (an action, not a decision):** have the operator complete doc 12 §3 checks A–D. **No keys in chat.**
