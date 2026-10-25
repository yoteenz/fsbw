# 16 — Founder Decision Board V2

**Nothing on this board is approved.** Every decision has `FOUNDER SELECTION: — (pending)`. The OPUS RECOMMENDATION column is a recommendation only. A selection counts as recorded only when it is written to a durable decision record (doc 20 manifest updated in the repository, or the owner-only store of the interactive board, doc 21) and committed. A visual toggle is not approval.

55 decisions in 8 groups. Prior audit decision ids (audit doc 24) are cross-referenced.

| Group | Decisions | Gates |
|---|---|---|
| A. Security/payment | A1, A2, A3, A4, A5, A6, A7, A8, A9 | S0B-1, S0B-2, S1 |
| B. Customer architecture | B1, B2, B3, B4, B5, B6, B7, B8 | S2, S5, S4, —, S6 |
| C. Admin architecture | C1, C2, C3, C4, C5 | S3, S1 |
| D. Membership/rewards | D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13 | S4, S6, S5 |
| E. Hair Analysis/Build-A-Wig | E1, E2, E3, E4, E5, E6 | S5, S0B-2, S1B |
| F. Community/affiliate | F1, F2, F3, F4, F5 | S0B-2, S5 |
| G. Visual/responsive | G1, G2, G3, G4, G5, G6 | S2, S3, S2/S5, S6, — |
| H. Launch readiness | H1, H2, H3 | S7, S7 (and S0B-1 rehearsal), S0B-1 |


## A. Security/payment

### A1 — Approve the P0A database containment migration

| Field | Value |
|---|---|
| DECISION ID | A1 |
| SUBJECT | Approve the P0A database containment migration |
| CURRENT STATE | anon/authenticated can EXECUTE value RPCs (live; some functions also keep the PUBLIC default); legacy client write policies live on orders, meetings, notifications, reviews |
| EVIDENCE | Live routine_privileges + pg_policies (audit doc 02 §5); risk register R-01, R-02, R-04 |
| OPTIONS | **1.** Approve narrowly scoped migration with prepared rollback, rehearsed on a Supabase branch, SITE00 smoke-tested — *Closes the exposure; small regression risk in shared DB*<br>**2.** Defer — *Exposure remains open on production* |
| OPUS RECOMMENDATION | Option 1: Approve narrowly scoped migration with prepared rollback, rehearsed on a Supabase branch, SITE00 smoke-tested |
| RATIONALE | Anyone with the public anon key can grant hairstyle-analysis credits today; containment must not wait for page-tree approval. |
| IMPACT | Database (shared with SITE00) |
| REVERSIBILITY | EASY (rollback migration restores grants/policies) |
| DEPENDENCIES | H3 (SITE00 coordination) |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-1 |
| PRIOR AUDIT IDS | FD-C1 |

### A2 — Build-A-Wig checkout until server pricing exists

| Field | Value |
|---|---|
| DECISION ID | A2 |
| SUBJECT | Build-A-Wig checkout until server pricing exists |
| CURRENT STATE | Stripe charges base + cap only for custom wigs (options dropped) |
| EVIDENCE | api/_lib/pricing/resolveQuote.ts:181-205; src/utils/checkoutQuote.ts:40-55; risk R-03 |
| OPTIONS | **1.** Concierge-confirmed custom quote: Atelier and bag stay open; custom lines become "Request my custom quote" → admin sends consult offer → customer pays the server-held quoted amount — *No undercharge; reuses consult offer system; some manual work per order*<br>**2.** Block card checkout for custom lines and route to "Book a consultation" — *Simplest; more friction*<br>**3.** Keep current behaviour — *Undercharges every custom order (not acceptable)* |
| OPUS RECOMMENDATION | Option 1: Concierge-confirmed custom quote: Atelier and bag stay open; custom lines become "Request my custom quote" → admin sends consult offer → customer pays the server-held quoted amount |
| RATIONALE | Keeps the immersive Atelier usable and revenue-safe until S1B makes server pricing authoritative. |
| IMPACT | Checkout, Meetings admin |
| REVERSIBILITY | EASY (flag) |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-2 |
| PRIOR AUDIT IDS | FD-C3 |

### A3 — Non-Stripe CONFIRM ORDER on /checkout/upgrade

| Field | Value |
|---|---|
| DECISION ID | A3 |
| SUBJECT | Non-Stripe CONFIRM ORDER on /checkout/upgrade |
| CURRENT STATE | Grants PREMIUM + welcome cash in the browser without charging |
| EVIDENCE | src/pages/checkout/page.tsx:6818-6905; risk R-06 |
| OPTIONS | **1.** Disable in production (keep for non-production demo builds only) — *Membership only via Stripe*<br>**2.** Keep — *Free premium client-side* |
| OPUS RECOMMENDATION | Option 1: Disable in production (keep for non-production demo builds only) |
| RATIONALE | Server gates already ignore it; the client grant only misleads customers and admins. |
| IMPACT | Checkout |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-2 |
| PRIOR AUDIT IDS | FD-C5 |

### A4 — Membership cancellation and saved payment methods

| Field | Value |
|---|---|
| DECISION ID | A4 |
| SUBJECT | Membership cancellation and saved payment methods |
| CURRENT STATE | CANCEL SUBSCRIPTION flips a local flag (Stripe keeps billing); /account/payment collects raw card number/CVV locally |
| EVIDENCE | membership/page.tsx:1150-1175; payment/page.tsx:215-283; risks R-15, R-14 |
| OPTIONS | **1.** Stripe Customer Portal for cancel/plan/payment methods — *Least code, PCI-safe, Stripe-hosted UI (brand-styled by Stripe settings)*<br>**2.** In-app cancel (cancel_at_period_end) + Stripe Elements for cards — *Fully on-brand; more code* |
| OPUS RECOMMENDATION | Option 1: Stripe Customer Portal for cancel/plan/payment methods |
| RATIONALE | Fastest correct fix; can move in-app later without data changes. |
| IMPACT | Rewards, Settings |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-2 |
| PRIOR AUDIT IDS | FD-C6, FD-C9 |

### A5 — Mock / demo / seed data in production

| Field | Value |
|---|---|
| DECISION ID | A5 |
| SUBJECT | Mock / demo / seed data in production |
| CURRENT STATE | Concierge injects test orders into real customers; admin dashboard falls back to fabricated data; mock clients and meetings merged |
| EVIDENCE | concierge/page.tsx:1913-2211 (reproduced); dashboard/page.tsx:405-446; risk R-08 |
| OPTIONS | **1.** Quarantine all mock paths behind ?demo=1 on non-production hosts; founder "view as client" shows real data — *Honest but initially empty screens*<br>**2.** Keep founder-only mocks — *Founder QA keeps seeing fake data; injection bug must still be fixed* |
| OPUS RECOMMENDATION | Option 1: Quarantine all mock paths behind ?demo=1 on non-production hosts; founder "view as client" shows real data |
| RATIONALE | Trust: customers must never see fabricated orders or balances. |
| IMPACT | Account + admin |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-2 |
| PRIOR AUDIT IDS | FD-C7 |

### A6 — Slay Ticket purchases

| Field | Value |
|---|---|
| DECISION ID | A6 |
| SUBJECT | Slay Ticket purchases |
| CURRENT STATE | Checkout skips Stripe; credit endpoint trusts client lines (mintable) |
| EVIDENCE | api/slay-tickets/credit-order.ts:55-89; productCheckoutPolicy.ts:77-84; risk R-05 |
| OPTIONS | **1.** Pause pack purchases until webhook-only crediting ships (in S0B-2) — *Short pause of a small revenue line*<br>**2.** Ship webhook crediting first, then re-enable — *Same end state, exploit window remains meanwhile* |
| OPUS RECOMMENDATION | Option 1: Pause pack purchases until webhook-only crediting ships (in S0B-2) |
| RATIONALE | Closes the exploit immediately. |
| IMPACT | Lounge content economy |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-2 |
| PRIOR AUDIT IDS | FD-R14 |

### A7 — Booking autopay final payments

| Field | Value |
|---|---|
| DECISION ID | A7 |
| SUBJECT | Booking autopay final payments |
| CURRENT STATE | Charges Stripe customer/payment method IDs supplied by the client; cron likely not running (GET vs POST) |
| EVIDENCE | appointment-meeting.ts:112-138; autopay-final-payment.ts:81,143-145; risk R-09 |
| OPTIONS | **1.** Keep autopay off until server-sourced IDs and amounts ship; collect final balances manually meanwhile — *Manual collection for in-flight bookings*<br>**2.** Fix and enable in the same sprint — *Faster automation, needs Stripe test pass first* |
| OPUS RECOMMENDATION | Option 1: Keep autopay off until server-sourced IDs and amounts ship; collect final balances manually meanwhile |
| RATIONALE | Never charge a card the server cannot prove belongs to the customer. |
| IMPACT | Bookings |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-2 |
| PRIOR AUDIT IDS | — |

### A8 — Remediation for customers affected by money defects

| Field | Value |
|---|---|
| DECISION ID | A8 |
| SUBJECT | Remediation for customers affected by money defects |
| CURRENT STATE | 0 server orders, 0 analysis purchase grants, 9 profiles in production (live counts) |
| EVIDENCE | audit doc 02 §5 |
| OPTIONS | **1.** Check Stripe for any 4-pack analysis or Slay Ticket or BAW payments; refund or grant manually with audit — *Likely no affected customers*<br>**2.** No action — *Unknown residual* |
| OPUS RECOMMENDATION | Option 1: Check Stripe for any 4-pack analysis or Slay Ticket or BAW payments; refund or grant manually with audit |
| RATIONALE | Cheap verification before launch. |
| IMPACT | Finance |
| REVERSIBILITY | — |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-2 |
| PRIOR AUDIT IDS | FD-C4 |

### A9 — Approve the additive schema plan (orders first)

| Field | Value |
|---|---|
| DECISION ID | A9 |
| SUBJECT | Approve the additive schema plan (orders first) |
| CURRENT STATE | No server order of record; production has 0 orders |
| EVIDENCE | doc 06; audit doc 14 §6 |
| OPTIONS | **1.** Approve S1 tables now (customer_orders, items, status events, webhook events); later tables per sprint — *Lowest-risk moment (no data to migrate)*<br>**2.** Approve all at once — *Larger review*<br>**3.** Defer — *Order pages cannot be completed* |
| OPUS RECOMMENDATION | Option 1: Approve S1 tables now (customer_orders, items, status events, webhook events); later tables per sprint |
| RATIONALE | Unblocks 14 pages; nothing to migrate today. |
| IMPACT | Database (shared with SITE00) |
| REVERSIBILITY | MODERATE (additive; drop tables if abandoned before use) |
| DEPENDENCIES | A1, H3 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S1 |
| PRIOR AUDIT IDS | FD-C2 |

## B. Customer architecture

### B1 — Approve the customer page tree (10 families, 21 routed pages, 3 new)

| Field | Value |
|---|---|
| DECISION ID | B1 |
| SUBJECT | Approve the customer page tree (10 families, 21 routed pages, 3 new) |
| CURRENT STATE | 18 core routes, no shared shell, no order detail |
| EVIDENCE | doc 01 |
| OPTIONS | **1.** Approve as proposed — *S2 proceeds*<br>**2.** Approve with amendments (note them) — *S2 adjusts* |
| OPUS RECOMMENDATION | Option 1: Approve as proposed |
| RATIONALE | Keeps all working URLs; adds only homes for tasks that have none. |
| IMPACT | Account |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S2 |
| PRIOR AUDIT IDS | FD-A1 |

### B2 — MY HAIR as its own family (profile, analyses, builds)

| Field | Value |
|---|---|
| DECISION ID | B2 |
| SUBJECT | MY HAIR as its own family (profile, analyses, builds) |
| CURRENT STATE | Analyses and saved builds have no home; no hair profile |
| EVIDENCE | doc 01, doc 09 |
| OPTIONS | **1.** Own family /account/hair with 3 tabs + analysis detail route — *Clear home; one new page*<br>**2.** Split: analyses under Rewards, builds under Wishlist — *No new page; scattered* |
| OPUS RECOMMENDATION | Option 1: Own family /account/hair with 3 tabs + analysis detail route |
| RATIONALE | Customers think "my hair", not "rewards" or "wishlist", for these things. |
| IMPACT | Account |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | E1, E3 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S5 |
| PRIOR AUDIT IDS | FD-A2 |

### B3 — Concierge scope

| Field | Value |
|---|---|
| DECISION ID | B3 |
| SUBJECT | Concierge scope |
| CURRENT STATE | Holds messages, offers, a duplicate tracking engine, Slay Challenge, quests, gifts; route open to non-premium |
| EVIDENCE | audit appendix A §2.2 |
| OPTIONS | **1.** Premium-only page: messages (with replies), offers, orders-in-progress links, gifts; tracking → order detail — *Focused white-glove page*<br>**2.** Keep as is — *Duplication persists* |
| OPUS RECOMMENDATION | Option 1: Premium-only page: messages (with replies), offers, orders-in-progress links, gifts; tracking → order detail |
| RATIONALE | One tracking engine; clear purpose. |
| IMPACT | Account |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S2 |
| PRIOR AUDIT IDS | FD-A3 |

### B4 — Where Slay Challenge lives

| Field | Value |
|---|---|
| DECISION ID | B4 |
| SUBJECT | Where Slay Challenge lives |
| CURRENT STATE | Inside Concierge |
| EVIDENCE | concierge/page.tsx:6004-6130 |
| OPTIONS | **1.** REWARDS › SLAY CHALLENGE tab — *Rewards in one place*<br>**2.** Stay in Concierge — *Premium context kept* |
| OPUS RECOMMENDATION | Option 1: REWARDS › SLAY CHALLENGE tab |
| RATIONALE | It is a rewards mechanic; its art and ledger live with Rewards. |
| IMPACT | Account |
| REVERSIBILITY | EASY |
| DEPENDENCIES | D1 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | FD-A4 |

### B5 — /account on tablet/desktop

| Field | Value |
|---|---|
| DECISION ID | B5 |
| SUBJECT | /account on tablet/desktop |
| CURRENT STATE | ≥768px redirects to the Desktop Penthouse (different numbers) despite mobile-only build target |
| EVIDENCE | AccountHubRedirect.tsx; sweep |
| OPTIONS | **1.** Keep the Penthouse redirect, but it must read /api/account/overview so numbers match — *Immersive desktop preserved*<br>**2.** Pause redirect until desktop phase; centred 720px account column — *Consistent now; Penthouse later* |
| OPUS RECOMMENDATION | Option 1: Keep the Penthouse redirect, but it must read /api/account/overview so numbers match |
| RATIONALE | Preserves the approved immersive desktop experience while fixing data truth. |
| IMPACT | Desktop |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S2 |
| PRIOR AUDIT IDS | FD-A9 |

### B6 — Mobile Mansion /mobile/* placeholder pages

| Field | Value |
|---|---|
| DECISION ID | B6 |
| SUBJECT | Mobile Mansion /mobile/* placeholder pages |
| CURRENT STATE | Placeholder slots, unguarded, broken background, off-brand Playfair Display |
| EVIDENCE | src/pages/mobile/*; V2 assets §2 |
| OPTIONS | **1.** Keep unlinked and out of the account tree until a dedicated creative sprint — *No change*<br>**2.** Remove routes — *Less clutter; loses prototype*<br>**3.** Make it the mobile home now — *Large creative scope* |
| OPUS RECOMMENDATION | Option 1: Keep unlinked and out of the account tree until a dedicated creative sprint |
| RATIONALE | Avoids scope creep; preserves the prototype. |
| IMPACT | Mobile |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | — |
| PRIOR AUDIT IDS | FD-A7 |

### B7 — Support for all members (MY REQUESTS + replies)

| Field | Value |
|---|---|
| DECISION ID | B7 |
| SUBJECT | Support for all members (MY REQUESTS + replies) |
| CURRENT STATE | Premium priority messages are one-way; standard members only have /brand/contact |
| EVIDENCE | audit appendix A §4 |
| OPTIONS | **1.** support_requests threads for everyone; premium keeps priority routing — *New feature (approval needed)*<br>**2.** Premium-only replies — *Standard members unanswered in-app* |
| OPUS RECOMMENDATION | Option 1: support_requests threads for everyone; premium keeps priority routing |
| RATIONALE | Every message deserves a visible answer. |
| IMPACT | Account + Inbox |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S6 |
| PRIOR AUDIT IDS | — |

### B8 — Navigation labels (creative)

| Field | Value |
|---|---|
| DECISION ID | B8 |
| SUBJECT | Navigation labels (creative) |
| CURRENT STATE | Proposed: OVERVIEW · ORDERS · CONCIERGE · REWARDS · MY HAIR · WISHLIST · REVIEWS & CONTENT · EARN & SHARE · ALERTS · SETTINGS |
| EVIDENCE | doc 01 |
| OPTIONS | **1.** Use proposed labels — *—*<br>**2.** Founder wording (note it) — *—* |
| OPUS RECOMMENDATION | Option 1: Use proposed labels |
| RATIONALE | Plain words customers recognise. |
| IMPACT | Copy |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S2 |
| PRIOR AUDIT IDS | — |

## C. Admin architecture

### C1 — Approve the admin page tree (15 families, 24 routed pages, 5 new, 10 folded)

| Field | Value |
|---|---|
| DECISION ID | C1 |
| SUBJECT | Approve the admin page tree (15 families, 24 routed pages, 5 new, 10 folded) |
| CURRENT STATE | 33 routes, no admin menu, 7 unreachable, Studio cards first |
| EVIDENCE | doc 02 |
| OPTIONS | **1.** Approve as proposed — *S3 proceeds*<br>**2.** Approve with amendments — *S3 adjusts* |
| OPUS RECOMMENDATION | Option 1: Approve as proposed |
| RATIONALE | Operational families; every real feature reachable; redirects keep old links. |
| IMPACT | Admin |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S3 |
| PRIOR AUDIT IDS | FD-B1 |

### C2 — Admin roles and money authority

| Field | Value |
|---|---|
| DECISION ID | C2 |
| SUBJECT | Admin roles and money authority |
| CURRENT STATE | Email allow-list in 3 places; no roles table; founder hardcoded |
| EVIDENCE | audit doc 13 §2 |
| OPTIONS | **1.** admin_roles: FOUNDER / ADMIN (STAFF later); refunds and adjustments above a threshold need FOUNDER — *Least privilege*<br>**2.** Everyone on the allow-list can do everything — *Simpler; riskier* |
| OPUS RECOMMENDATION | Option 1: admin_roles: FOUNDER / ADMIN (STAFF later); refunds and adjustments above a threshold need FOUNDER |
| RATIONALE | Money actions need accountable authority. |
| IMPACT | Admin |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S3 |
| PRIOR AUDIT IDS | FD-B2, FD-B3 |

### C3 — Command Center content

| Field | Value |
|---|---|
| DECISION ID | C3 |
| SUBJECT | Command Center content |
| CURRENT STATE | 12 link cards with fabricated metrics |
| EVIDENCE | audit doc 20 |
| OPTIONS | **1.** Queues first (forms, ready to ship, delayed, approvals, inbox, meetings, offers expiring, low stock) + system alerts + 4 metrics — *Actionable; looks empty pre-launch*<br>**2.** Keep cards, remove fake numbers — *Smaller change; not actionable* |
| OPUS RECOMMENDATION | Option 1: Queues first (forms, ready to ship, delayed, approvals, inbox, meetings, offers expiring, low stock) + system alerts + 4 metrics |
| RATIONALE | The admin home must start work. |
| IMPACT | Admin |
| REVERSIBILITY | EASY |
| DEPENDENCIES | C4 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S3 |
| PRIOR AUDIT IDS | — |

### C4 — Canonical order status vocabulary and stage SLAs

| Field | Value |
|---|---|
| DECISION ID | C4 |
| SUBJECT | Canonical order status vocabulary and stage SLAs |
| CURRENT STATE | Three conflicting stage lists; time-computed stages |
| EVIDENCE | audit appendix A §4 |
| OPTIONS | **1.** pending_payment → paid → awaiting_form → confirmed → in_production (sourcing, constructing, cleansing, customizing, finalizing) → shipped → delivered; + canceled, refunded, issue; digital: paid → processing → complete; founder supplies SLA days per stage — *One vocabulary*<br>**2.** Founder-specified list — *—* |
| OPUS RECOMMENDATION | Option 1: pending_payment → paid → awaiting_form → confirmed → in_production (sourcing, constructing, cleansing, customizing, finalizing) → shipped → delivered; + canceled, refunded, issue; digital: paid → processing → complete; founder supplies SLA days per stage |
| RATIONALE | Matches existing customer-facing stage names while making them event-driven. |
| IMPACT | Orders everywhere |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S1 |
| PRIOR AUDIT IDS | FD-C10, FD-B5 |

### C5 — Studio OS boundary

| Field | Value |
|---|---|
| DECISION ID | C5 |
| SUBJECT | Studio OS boundary |
| CURRENT STATE | HEADQUARTERS and STUDIO COMMAND CENTER are the first dashboard cards; dashboard boots Studio modules |
| EVIDENCE | audit doc 04 |
| OPTIONS | **1.** Single STUDIO link in the admin menu; no Studio/SITE00 modules in FS admin — *Clean boundary*<br>**2.** Keep cards — *Clutter* |
| OPUS RECOMMENDATION | Option 1: Single STUDIO link in the admin menu; no Studio/SITE00 modules in FS admin |
| RATIONALE | FS admin stays a business operations tool. |
| IMPACT | Admin |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S3 |
| PRIOR AUDIT IDS | — |

## D. Membership/rewards

### D1 — Slay Challenge requirement and reveal model

| Field | Value |
|---|---|
| DECISION ID | D1 |
| SUBJECT | Slay Challenge requirement and reveal model |
| CURRENT STATE | Brief: 3 requirements per reward. Repo canon (MEMORY 2026-06-19): 4 tiers 5/7, 4/7, 5/9, 6/9; 3 reveal phases; code fires phase 2 at 67%; no repo canon for full-silhouette/transparent art |
| EVIDENCE | evidence/R2_rewards_canon.md §5; doc 08 §1.5 |
| OPTIONS | **1.** Keep 4 tiers; reveal phase = share of the tier's own required count (phase 2 at ≥75%, phase 3 at 100%) — *Preserves latest repo canon and 3-phase art*<br>**2.** Adopt 3 requirements per reward (rewrite tiers to 3 tasks) — *Matches brief wording; changes reward economics*<br>**3.** Other (founder specifies) — *—* |
| OPUS RECOMMENDATION | Option 1: Keep 4 tiers; reveal phase = share of the tier's own required count (phase 2 at ≥75%, phase 3 at 100%) |
| RATIONALE | Latest documented canon; art unchanged either way. Founder confirms the existing 30 PNGs show the full silhouette with ghosted→coloured sections (not verifiable offline). |
| IMPACT | Rewards |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | FD-R1, FD-R2 |

### D2 — Benefit eligibility conflicts

| Field | Value |
|---|---|
| DECISION ID | D2 |
| SUBJECT | Benefit eligibility conflicts |
| CURRENT STATE | Special offers (12 vs 6/12), Slay Challenge (all vs 6/12), live order tracking (3 vs 6) |
| EVIDENCE | doc 08 §1.1 |
| OPTIONS | **1.** Follow the published benefit list (special offers 12; challenges all premium; live tracking 3+) — *Code gates change to match copy*<br>**2.** Follow current code gates; update copy — *Copy changes* |
| OPUS RECOMMENDATION | Option 1: Follow the published benefit list (special offers 12; challenges all premium; live tracking 3+) |
| RATIONALE | Customers bought against the published list. |
| IMPACT | Membership |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | FD-R3, FD-R5, FD-R6 |

### D3 — Welcome credits

| Field | Value |
|---|---|
| DECISION ID | D3 |
| SUBJECT | Welcome credits |
| CURRENT STATE | Premium chart $10/$20/$40/$60 vs checkout $10/$20/$40; spend-tier $10/$40/$80; both "WELCOME DISCOUNT" |
| EVIDENCE | doc 08 §1.1 |
| OPTIONS | **1.** Founder confirms amounts, once-per-tier vs per-term, and whether premium and spend-tier credits stack — *—* |
| OPUS RECOMMENDATION | Option 1: Founder confirms amounts, once-per-tier vs per-term, and whether premium and spend-tier credits stack |
| RATIONALE | Money values must come from the founder. |
| IMPACT | Wallet ledger |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | FD-R7, FD-R11 |

### D4 — Purchase points formula

| Field | Value |
|---|---|
| DECISION ID | D4 |
| SUBJECT | Purchase points formula |
| CURRENT STATE | Checkout: eligible net × multiplier; display: order total 1:1; desktop: third formula |
| EVIDENCE | doc 08 §1.3 |
| OPTIONS | **1.** Eligible net × multiplier (checkout rule) everywhere — *Matches "1 point per $1, excludes tax/shipping"*<br>**2.** Order total 1:1 — *Simpler; includes non-eligible items* |
| OPUS RECOMMENDATION | Option 1: Eligible net × multiplier (checkout rule) everywhere |
| RATIONALE | Matches the published "excludes taxes + shipping" rule. |
| IMPACT | Ledger |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | FD-R8 |

### D5 — Points expiry

| Field | Value |
|---|---|
| DECISION ID | D5 |
| SUBJECT | Points expiry |
| CURRENT STATE | No rule; expiry email template exists |
| EVIDENCE | doc 08 §1.3 |
| OPTIONS | **1.** Points never expire (retire points_expiring email) — *Simple, generous*<br>**2.** Expire after N months inactivity — *Liability control*<br>**3.** Fixed period from earn date — *—* |
| OPUS RECOMMENDATION | Option 1: Points never expire (retire points_expiring email) |
| RATIONALE | No published expiry exists; introducing one is a new rule. |
| IMPACT | Ledger |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | FD-R8 |

### D6 — Affiliate rewards and caps

| Field | Value |
|---|---|
| DECISION ID | D6 |
| SUBJECT | Affiliate rewards and caps |
| CURRENT STATE | Copy 400/600/600; caps 3,000 social per product, 5,000 per unit per 6 months; hidden 2+2 photo/video sub-cap; server writes 100 |
| EVIDENCE | doc 08 §1.4 |
| OPTIONS | **1.** Confirm copy values as canonical; caps per copy; show sub-caps; no multipliers; define Featured Creator later — *Server enforces published rules*<br>**2.** Founder edits values — *—* |
| OPUS RECOMMENDATION | Option 1: Confirm copy values as canonical; caps per copy; show sub-caps; no multipliers; define Featured Creator later |
| RATIONALE | Matches published program and historical references. |
| IMPACT | Ledger |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S6 |
| PRIOR AUDIT IDS | FD-R10 |

### D7 — Points for review content

| Field | Value |
|---|---|
| DECISION ID | D7 |
| SUBJECT | Points for review content |
| CURRENT STATE | Loyalty chart "+150 content review", "+200 tag us"; pending tally 400/600 for review media |
| EVIDENCE | audit appendix B FD-10 |
| OPTIONS | **1.** Founder sets review-content points (or none) — *—* |
| OPUS RECOMMENDATION | Option 1: Founder sets review-content points (or none) |
| RATIONALE | Conflicting copy. |
| IMPACT | Ledger |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S5 |
| PRIOR AUDIT IDS | FD-R10 |

### D8 — Referral program rules

| Field | Value |
|---|---|
| DECISION ID | D8 |
| SUBJECT | Referral program rules |
| CURRENT STATE | $20 off + $20 digital cash at confirmation; activation delivered (copy) vs shipped (code); stacking undefined; client-only |
| EVIDENCE | doc 08 §1.4 |
| OPTIONS | **1.** Confirm $20/$20; credit when the referred order is delivered; reverse on refund/cancel; no stacking with +100 earn task — *Conservative*<br>**2.** Confirm $20/$20 at confirmation (current) — *Faster reward, more reversals*<br>**3.** Different amounts — *—* |
| OPUS RECOMMENDATION | Option 1: Confirm $20/$20; credit when the referred order is delivered; reverse on refund/cancel; no stacking with +100 earn task |
| RATIONALE | Brief: do not implement $20 automatically; delivered-based credit minimises reversals. |
| IMPACT | Wallet ledger |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S6 |
| PRIOR AUDIT IDS | FD-R9 |

### D9 — Undefined perks

| Field | Value |
|---|---|
| DECISION ID | D9 |
| SUBJECT | Undefined perks |
| CURRENT STATE | Mystery rewards, Early Access, Expedited Processing, Free Shipping credit, 2X/2.5X/3X next purchase, tier welcome bonuses, Annual Consultation, Status Protection, free gift fulfilment |
| EVIDENCE | doc 08 §1.3 |
| OPTIONS | **1.** Define each (contents, trigger, fulfilment) or remove its copy — *—* |
| OPUS RECOMMENDATION | Option 1: Define each (contents, trigger, fulfilment) or remove its copy |
| RATIONALE | Copy without fulfilment is a broken promise. |
| IMPACT | Rewards copy + ledger |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | FD-R16, FD-R15 |

### D10 — Unknown premium tier default

| Field | Value |
|---|---|
| DECISION ID | D10 |
| SUBJECT | Unknown premium tier default |
| CURRENT STATE | Defaults to 12-month privileges |
| EVIDENCE | psaFeatureGates.ts:33 |
| OPTIONS | **1.** Default to 3-month privileges — *Conservative*<br>**2.** Keep 12-month — *Generous* |
| OPUS RECOMMENDATION | Option 1: Default to 3-month privileges |
| RATIONALE | Never grant more than paid for. |
| IMPACT | Gates |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | FD-R6 |

### D11 — Anniversary semantics

| Field | Value |
|---|---|
| DECISION ID | D11 |
| SUBJECT | Anniversary semantics |
| CURRENT STATE | Awarded at each completed term; renewal behaviour unclear |
| EVIDENCE | doc 08 §1.3 |
| OPTIONS | **1.** Once per completed term, including renewals — *—*<br>**2.** Once per membership year — *—*<br>**3.** First term only — *—* |
| OPUS RECOMMENDATION | Option 1: Once per completed term, including renewals |
| RATIONALE | Matches current code; founder confirms. |
| IMPACT | Ledger |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | — |

### D12 — "Hair Bestie Bonus"

| Field | Value |
|---|---|
| DECISION ID | D12 |
| SUBJECT | "Hair Bestie Bonus" |
| CURRENT STATE | Not found anywhere in the repo ("hair bestie" is a PSA voice pillar) |
| EVIDENCE | evidence/R2_rewards_canon.md §4 |
| OPTIONS | **1.** Drop the term — *—*<br>**2.** Define amount, trigger, eligibility — *New rule* |
| OPUS RECOMMENDATION | Option 1: Drop the term |
| RATIONALE | No evidence it exists; defining it is a new business rule. |
| IMPACT | Rewards |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | — |

### D13 — Birthday gift

| Field | Value |
|---|---|
| DECISION ID | D13 |
| SUBJECT | Birthday gift |
| CURRENT STATE | $20 gift card or 200 points; premium (chart) vs VIP/affiliate (copy); eligibility unused; never fulfilled |
| EVIDENCE | doc 08 §1.3 |
| OPTIONS | **1.** Premium only; claim window around birthday; fulfilled via ledger — *—*<br>**2.** Premium + affiliates — *—* |
| OPUS RECOMMENDATION | Option 1: Premium only; claim window around birthday; fulfilled via ledger |
| RATIONALE | Matches the chart. |
| IMPACT | Rewards |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S4 |
| PRIOR AUDIT IDS | FD-R17 |

## E. Hair Analysis/Build-A-Wig

### E1 — Hair Analysis eligibility and bonus credits

| Field | Value |
|---|---|
| DECISION ID | E1 |
| SUBJECT | Hair Analysis eligibility and bonus credits |
| CURRENT STATE | Subscribers only (BLACK excluded); non-subscribers can buy credits but get 403; bonus credit has no grant path |
| EVIDENCE | doc 08 §1.2 |
| OPTIONS | **1.** Subscribers + anyone who buys credits may use purchased credits; BLACK gets no free monthly; bonus credit = one paid-credit grant — *Purchases always usable*<br>**2.** Subscribers only; disable purchase for others — *—*<br>**3.** Also give BLACK the monthly free analysis — *—* |
| OPUS RECOMMENDATION | Option 1: Subscribers + anyone who buys credits may use purchased credits; BLACK gets no free monthly; bonus credit = one paid-credit grant |
| RATIONALE | A customer who pays must be able to use what they bought. |
| IMPACT | Hair analysis |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S5 |
| PRIOR AUDIT IDS | FD-R7 |

### E2 — /tools/hairstyle-analysis harness

| Field | Value |
|---|---|
| DECISION ID | E2 |
| SUBJECT | /tools/hairstyle-analysis harness |
| CURRENT STATE | Customer-reachable admin harness with demo identity; consumes a real credit |
| EVIDENCE | HairstyleAnalysisDemo.tsx:7-14 |
| OPTIONS | **1.** Admin-only; customers redirect to MY HAIR › ANALYSES — *—*<br>**2.** Keep — *Credits wasted on demo output* |
| OPUS RECOMMENDATION | Option 1: Admin-only; customers redirect to MY HAIR › ANALYSES |
| RATIONALE | Prevents wasted credits and demo identity exposure. |
| IMPACT | Tools |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-2 |
| PRIOR AUDIT IDS | FD-A6 |

### E3 — Selfie consent, retention and deletion

| Field | Value |
|---|---|
| DECISION ID | E3 |
| SUBJECT | Selfie consent, retention and deletion |
| CURRENT STATE | No consent; selfies sent to Fal/OpenAI and stored in local cart/order JSON |
| EVIDENCE | doc 09 §1 |
| OPTIONS | **1.** Founder-approved consent text; private storage; retention N days (founder sets); delete on request and account deletion — *—* |
| OPUS RECOMMENDATION | Option 1: Founder-approved consent text; private storage; retention N days (founder sets); delete on request and account deletion |
| RATIONALE | Policy wording belongs to the founder. |
| IMPACT | Privacy |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S5 |
| PRIOR AUDIT IDS | FD-C8 |

### E4 — Edit-from-cart gate

| Field | Value |
|---|---|
| DECISION ID | E4 |
| SUBJECT | Edit-from-cart gate |
| CURRENT STATE | Premium only (code) vs sign-in only (canon) |
| EVIDENCE | BuildWigCustomizeEditAccessGate.tsx:49-52; CORE.md:50 |
| OPTIONS | **1.** Sign-in only (canon); premium-only options stay gated — *Standard members can edit their own lines*<br>**2.** Premium only — *—* |
| OPUS RECOMMENDATION | Option 1: Sign-in only (canon); premium-only options stay gated |
| RATIONALE | Matches documented canon. |
| IMPACT | Atelier |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S1B |
| PRIOR AUDIT IDS | FD-A8 |

### E5 — Build-A-Wig price catalogue ownership

| Field | Value |
|---|---|
| DECISION ID | E5 |
| SUBJECT | Build-A-Wig price catalogue ownership |
| CURRENT STATE | 6+ hand-synced price tables; no admin editor |
| EVIDENCE | doc 09 §2 |
| OPTIONS | **1.** Code-defined single catalogue with an admin read view; changes by release — *Safest, fastest*<br>**2.** Admin-editable catalogue table (founder approves price changes) — *Flexible; more build* |
| OPUS RECOMMENDATION | Option 1: Code-defined single catalogue with an admin read view; changes by release |
| RATIONALE | Pricing correctness first; editing UI can follow. |
| IMPACT | Checkout |
| REVERSIBILITY | MODERATE |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S1B |
| PRIOR AUDIT IDS | — |

### E6 — Asynchronous deliverables (PSA picks, consult add-on)

| Field | Value |
|---|---|
| DECISION ID | E6 |
| SUBJECT | Asynchronous deliverables (PSA picks, consult add-on) |
| CURRENT STATE | PSA promises 24h, delivers nothing; paid consult add-on unfulfilled |
| EVIDENCE | doc 09 §1 |
| OPTIONS | **1.** Store and deliver automatically (PSA picks immediately; consult add-on generated and reviewed by admin before release within 24h) — *—*<br>**2.** Remove the 24h promise / add-on until built — *—* |
| OPUS RECOMMENDATION | Option 1: Store and deliver automatically (PSA picks immediately; consult add-on generated and reviewed by admin before release within 24h) |
| RATIONALE | Customers paid or were promised. |
| IMPACT | Hair analysis, Meetings |
| REVERSIBILITY | EASY |
| DEPENDENCIES | E3 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S5 |
| PRIOR AUDIT IDS | — |

## F. Community/affiliate

### F1 — Fabricated Slay Cam stats and testimonials

| Field | Value |
|---|---|
| DECISION ID | F1 |
| SUBJECT | Fabricated Slay Cam stats and testimonials |
| CURRENT STATE | "42K LOOK SAVES", named fictional posts shown as community |
| EVIDENCE | slay-cam/page.tsx:75-214 |
| OPTIONS | **1.** Remove stats; label posts as curated editorial until real submissions exist — *Copy-only change; page design kept*<br>**2.** Keep — *Misleading* |
| OPUS RECOMMENDATION | Option 1: Remove stats; label posts as curated editorial until real submissions exist |
| RATIONALE | Trust. |
| IMPACT | Public page |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-2 |
| PRIOR AUDIT IDS | FD-C11 |

### F2 — UGC consent, usage rights and retention wording

| Field | Value |
|---|---|
| DECISION ID | F2 |
| SUBJECT | UGC consent, usage rights and retention wording |
| CURRENT STATE | None |
| EVIDENCE | doc 10 §2 |
| OPTIONS | **1.** Founder supplies wording (or approves a drafted version reviewed by counsel) — *—* |
| OPUS RECOMMENDATION | Option 1: Founder supplies wording (or approves a drafted version reviewed by counsel) |
| RATIONALE | Legal/policy text is the founder's. |
| IMPACT | Reviews, affiliate, Slay Cam |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S5 |
| PRIOR AUDIT IDS | FD-C8 |

### F3 — Public review display

| Field | Value |
|---|---|
| DECISION ID | F3 |
| SUBJECT | Public review display |
| CURRENT STATE | Published reviews appear nowhere public |
| EVIDENCE | audit doc 17 |
| OPTIONS | **1.** Show approved, consented reviews on product pages and /brand/reviews — *—*<br>**2.** Keep private — *—* |
| OPUS RECOMMENDATION | Option 1: Show approved, consented reviews on product pages and /brand/reviews |
| RATIONALE | The PDP already promises it. |
| IMPACT | Shop |
| REVERSIBILITY | EASY |
| DEPENDENCIES | F2 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S5 |
| PRIOR AUDIT IDS | — |

### F4 — Slay MVP selection and reward

| Field | Value |
|---|---|
| DECISION ID | F4 |
| SUBJECT | Slay MVP selection and reward |
| CURRENT STATE | Hardcoded first post |
| EVIDENCE | slay-cam/page.tsx:296 |
| OPTIONS | **1.** Admin picks MVP per period; reward defined by founder — *—*<br>**2.** No MVP — *—* |
| OPUS RECOMMENDATION | Option 1: Admin picks MVP per period; reward defined by founder |
| RATIONALE | Existing concept; needs a rule. |
| IMPACT | Community |
| REVERSIBILITY | EASY |
| DEPENDENCIES | F2 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S5 |
| PRIOR AUDIT IDS | — |

### F5 — Lounge comment moderation

| Field | Value |
|---|---|
| DECISION ID | F5 |
| SUBJECT | Lounge comment moderation |
| CURRENT STATE | Live posting; reports increment a counter; no queue |
| EVIDENCE | loungeEngagement.ts:363-386 |
| OPTIONS | **1.** Keep live posting; auto-hide at N unique reports (founder sets N); admin queue — *—*<br>**2.** Pre-moderate all comments — *Slower community* |
| OPUS RECOMMENDATION | Option 1: Keep live posting; auto-hide at N unique reports (founder sets N); admin queue |
| RATIONALE | Balances openness and safety. |
| IMPACT | Lounge |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S5 |
| PRIOR AUDIT IDS | — |

## G. Visual/responsive

### G1 — Account desktop column widths

| Field | Value |
|---|---|
| DECISION ID | G1 |
| SUBJECT | Account desktop column widths |
| CURRENT STATE | Pages stretch edge to edge at 1440/2560 |
| EVIDENCE | audit doc 19 |
| OPTIONS | **1.** Centred 720px (forms) / 960px (lists) column on marble; optional side rail later — *Phone unchanged*<br>**2.** Founder-specified widths — *—* |
| OPUS RECOMMENDATION | Option 1: Centred 720px (forms) / 960px (lists) column on marble; optional side rail later |
| RATIONALE | Readable and luxurious; no restyle. |
| IMPACT | Account desktop |
| REVERSIBILITY | EASY |
| DEPENDENCIES | B5 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S2 |
| PRIOR AUDIT IDS | — |

### G2 — Admin menu drawer

| Field | Value |
|---|---|
| DECISION ID | G2 |
| SUBJECT | Admin menu drawer |
| CURRENT STATE | No admin navigation besides dashboard cards |
| EVIDENCE | audit doc 04 |
| OPTIONS | **1.** Hamburger drawer in AdminHeader using the existing menu-toggle card pattern — *—*<br>**2.** Persistent side rail ≥1024px — *Bigger visual change* |
| OPUS RECOMMENDATION | Option 1: Hamburger drawer in AdminHeader using the existing menu-toggle card pattern |
| RATIONALE | Uses an approved pattern. |
| IMPACT | Admin |
| REVERSIBILITY | EASY |
| DEPENDENCIES | C1 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S3 |
| PRIOR AUDIT IDS | — |

### G3 — Admin wide shell and Command Center layout

| Field | Value |
|---|---|
| DECISION ID | G3 |
| SUBJECT | Admin wide shell and Command Center layout |
| CURRENT STATE | 448px column on every device |
| EVIDENCE | audit doc 19 |
| OPTIONS | **1.** 448 phone · 720 tablet · 1280 desktop shell on marble, glass panels — *—*<br>**2.** Keep 448 everywhere — *Cramped tables* |
| OPUS RECOMMENDATION | Option 1: 448 phone · 720 tablet · 1280 desktop shell on marble, glass panels |
| RATIONALE | Operational density without changing the look. |
| IMPACT | Admin |
| REVERSIBILITY | EASY |
| DEPENDENCIES | C3 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S3 |
| PRIOR AUDIT IDS | FD-B4 |

### G4 — Account Overview status panels and MY HAIR page visuals

| Field | Value |
|---|---|
| DECISION ID | G4 |
| SUBJECT | Account Overview status panels and MY HAIR page visuals |
| CURRENT STATE | Card grid only |
| EVIDENCE | audit doc 21 |
| OPTIONS | **1.** Approve panels in the existing glass card language (screenshot review in S2) — *—* |
| OPUS RECOMMENDATION | Option 1: Approve panels in the existing glass card language (screenshot review in S2) |
| RATIONALE | Visible change needs founder eyes. |
| IMPACT | Account |
| REVERSIBILITY | EASY |
| DEPENDENCIES | B1, B2 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S2/S5 |
| PRIOR AUDIT IDS | — |

### G5 — Trend Desk and PSA Broadcast re-skin

| Field | Value |
|---|---|
| DECISION ID | G5 |
| SUBJECT | Trend Desk and PSA Broadcast re-skin |
| CURRENT STATE | Black SaaS screens |
| EVIDENCE | audit doc 19 sweep |
| OPTIONS | **1.** Re-skin onto marble/glass admin shell — *—*<br>**2.** Keep dark (intentional studio look) — *—* |
| OPUS RECOMMENDATION | Option 1: Re-skin onto marble/glass admin shell |
| RATIONALE | Brand consistency in admin. |
| IMPACT | Admin |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S6 |
| PRIOR AUDIT IDS | — |

### G6 — Certification collectible art

| Field | Value |
|---|---|
| DECISION ID | G6 |
| SUBJECT | Certification collectible art |
| CURRENT STATE | CSS placeholder (only genuinely missing asset) |
| EVIDENCE | evidence/V2_assets_components.md §2 |
| OPTIONS | **1.** Commission art in the existing collectible style — *New asset (founder creative)*<br>**2.** Keep placeholder — *—* |
| OPUS RECOMMENDATION | Option 2: Keep placeholder |
| RATIONALE | Not launch-blocking; founder may commission later. |
| IMPACT | Collectibles |
| REVERSIBILITY | EASY |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | — |
| PRIOR AUDIT IDS | — |

## H. Launch readiness

### H1 — Launch definition

| Field | Value |
|---|---|
| DECISION ID | H1 |
| SUBJECT | Launch definition |
| CURRENT STATE | No page verified; 0 production orders |
| EVIDENCE | doc 19 |
| OPTIONS | **1.** Launch-critical = P0A + P0B + S2 + S3 + S4 at H (verified) with doc 19 launch rows passing; S5/S6 may follow — *Earliest safe launch*<br>**2.** Everything through S6 verified — *Later launch* |
| OPUS RECOMMENDATION | Option 1: Launch-critical = P0A + P0B + S2 + S3 + S4 at H (verified) with doc 19 launch rows passing; S5/S6 may follow |
| RATIONALE | Money, orders, accounts and rewards must be true at launch; extended experiences can follow. |
| IMPACT | Launch |
| REVERSIBILITY | — |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S7 |
| PRIOR AUDIT IDS | — |

### H2 — Staging environment for signed-in verification

| Field | Value |
|---|---|
| DECISION ID | H2 |
| SUBJECT | Staging environment for signed-in verification |
| CURRENT STATE | No staging; E2E targets production by default |
| EVIDENCE | playwright.config.ts |
| OPTIONS | **1.** Supabase branch + Stripe test mode + seeded test accounts (customer standard/premium, admin, founder) — *Enables verification*<br>**2.** Separate staging project — *More isolation, more cost* |
| OPUS RECOMMENDATION | Option 1: Supabase branch + Stripe test mode + seeded test accounts (customer standard/premium, admin, founder) |
| RATIONALE | Pages cannot reach H without signed-in backend tests. |
| IMPACT | QA |
| REVERSIBILITY | EASY |
| DEPENDENCIES | H3 |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S7 (and S0B-1 rehearsal) |
| PRIOR AUDIT IDS | — |

### H3 — SITE00 shares the Supabase project

| Field | Value |
|---|---|
| DECISION ID | H3 |
| SUBJECT | SITE00 shares the Supabase project |
| CURRENT STATE | Shared auth, profiles trigger and public functions |
| EVIDENCE | doc 11 R-17 |
| OPTIONS | **1.** Coordinate every FS migration with a SITE00 impact check now; plan SITE00 move to its own project — *—*<br>**2.** Coordinate only — *Shared-DB risk persists* |
| OPUS RECOMMENDATION | Option 1: Coordinate every FS migration with a SITE00 impact check now; plan SITE00 move to its own project |
| RATIONALE | Never assume a database change is isolated. |
| IMPACT | Both products |
| REVERSIBILITY | — |
| DEPENDENCIES | — |
| FOUNDER SELECTION | — (pending) |
| IMPLEMENTATION GATE | S0B-1 |
| PRIOR AUDIT IDS | — |

## Engineering decisions not escalated

These are taken by engineering inside the approved architecture. They change no business rule, price, reward value or visual design, and they are listed so the founder can object.

| ID | Decision | Why it is not a founder decision |
|---|---|---|
| ENG-01 | Order numbers come from a database sequence | Fixes duplicate numbers (BW-22); no visible format change beyond uniqueness |
| ENG-02 | Every Stripe call carries an idempotency key; webhook events are stored and deduplicated by event id | Correctness only |
| ENG-03 | Containment migration uses `REVOKE EXECUTE … FROM PUBLIC, anon, authenticated` then `GRANT … TO service_role`, with a fresh timestamp unused by both repos | Required for the revoke to work (X2 §2); procedure within decision A1 |
| ENG-04 | Cached balances on `profiles` stay as columns, maintained by triggers from the ledgers (no column drops) | SITE00 `api/profile.ts` upserts these columns on every sign-in (X2 §1a) |
| ENG-05 | Redirects are client `<Navigate replace>` that preserve query and hash | Saved and email links keep working |
| ENG-06 | One `StatusTimeline`, `OrderRow`, `LedgerHistory`, `AlertRow` component extracted from existing markup | Reuse without redesign (doc 18) |
| ENG-07 | Mock data gated behind a non-production build flag | Implements A5 mechanically |
| ENG-08 | Fix the autopay cron mismatch (GET vs POST, secret name) only after A7 is decided | Today the mismatch keeps autopay off; fixing it first would switch on a risky path |
| ENG-09 | `membership_payment_failures` gets a unique key on the Stripe invoice id | Stops duplicate rows on webhook retries |
| ENG-10 | Webhook records the charge currency and the USD amount separately | Today a non-USD charge is recorded as USD (X2 §3b) |
