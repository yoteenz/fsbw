# 24 — Founder Decision Board

Each decision lists the options, the audit's recommendation and the evidence. **Nothing below has been implemented.** Decisions are grouped so they can be answered in one sitting.

Legend: ★ = recommended option.

---

## C. Security, money and data (answer first; these gate Phase 0B)

| ID | Decision | Options | Recommendation | Evidence |
|---|---|---|---|---|
| **FD-C1** | Approve a **security and money hotfix sprint**, including a production migration (revoke RPC grants, drop legacy policies, SQL count fix, zero balances on INSERT) | ★ Approve now · Defer | ★ Approve now. Anyone with the public anon key can call the credit RPCs today. | doc 13 C1, C2, H1, H3 |
| **FD-C2** | Approve the **additive schema plan** (doc 14 S1–S15), starting with orders (S1/S2) | ★ Approve S1/S2 now and others per phase · Approve all · Defer | ★ S1/S2 now (0 live orders, so lowest-risk moment) | doc 14 §6 |
| **FD-C3** | Build-A-Wig checkout until server pricing exists | ★ Block card checkout for custom BAW lines and show "WE'LL CONFIRM YOUR CUSTOM QUOTE" (manual) · Keep charging base price (current bug) · Ship server pricing first (slower) | ★ Block + manual quote, or ship server pricing within Phase 0B if the catalogue can be finalised | BW-04 |
| FD-C4 | Remediation for 4-comparison analysis buyers | Grant manually · Refund | Live data shows **0 purchase grants**, so likely nobody is affected. Verify in Stripe and refund any 4-pack PIs. | BW-08 |
| **FD-C5** | Non-Stripe **CONFIRM ORDER** on `/checkout/upgrade` | ★ Disable in production (keep for founder demo builds only) · Keep | ★ Disable | BW-05 |
| **FD-C6** | Membership cancellation UX | ★ Stripe Customer Portal · In-app `cancel_at_period_end` · Remove button | ★ Stripe Portal (least code, PCI-safe) | BW-06 |
| **FD-C7** | Mock / demo data | ★ Quarantine behind `?demo=1` on non-production only; founder "view as client" shows real data · Keep founder mocks | ★ Quarantine. Founder QA currently sees fake orders, vouchers and clients. | doc 14 §4; BW-25 |
| **FD-C8** | Consent and usage-rights wording for UGC (reviews, affiliate, Slay Cam) and selfie retention | Founder supplies wording · Use a standard template | Founder supplies; the audit will not invent legal text | doc 17 |
| **FD-C9** | `/account/payment` | ★ Replace with Stripe-saved methods (portal / SetupIntent) · Remove page | ★ Replace (stop collecting raw PAN/CVV in React inputs) | DC-26 |
| **FD-C10** | Canonical **order status vocabulary** | Proposed: `pending_payment → paid → awaiting_form → confirmed → in_production (sourcing, constructing, cleansing, customizing, finalizing) → shipped → delivered`, plus `canceled`, `refunded`, `issue`; digital orders: `paid → processing → complete` | Approve or edit. **Stage durations/SLAs come from the founder**, not the code (current offsets contradict each other). | doc 14 §6; appendix A §4 |
| **FD-C11** | Slay Cam fabricated stats and testimonials ("42K LOOK SAVES", named posts) | ★ Remove stats; label posts as curated/editorial · Keep | ★ Remove or label now (copy only) | doc 17 |

## A. Customer account information architecture

| ID | Decision | Recommendation |
|---|---|---|
| **FD-A1** | Approve the **customer page tree** in doc 05 (20 routed pages; 2 new; consult-offer retired) | Approve |
| **FD-A2** | New **MY HAIR** page (`/account/hair`: PROFILE / ANALYSES / SAVED BUILDS), with an opt-in hair profile reused across Analysis, BAW and consult | Approve. Analyses and saved builds have no home today. |
| FD-A3 | Concierge order tracking → link to the new order detail (one tracking engine) | Approve |
| FD-A4 | Move **Slay Challenge** from Concierge to Rewards › SLAY CHALLENGE | Approve (it is a rewards feature; Concierge stays the white-glove channel) |
| FD-A5 | **Slay Quests** (hardcoded progress) | Hide until real progress exists |
| FD-A6 | `/tools/hairstyle-analysis` | Admin-only; customer entry via MY HAIR › ANALYSES |
| FD-A7 | **Mobile Mansion** `/mobile/*` placeholder pages | Keep outside the account tree; decide later whether the Mansion becomes the mobile home |
| FD-A8 | BAW **edit-from-cart** gate | Canon says sign-in only; code says premium only. Recommend sign-in only (per canon), with premium-only *options* still gated. |
| FD-A9 | `/account` at ≥768px redirects to the Desktop Penthouse, despite "mobile-only" | Keep the redirect but make the Penthouse read the same server overview data, **or** pause the redirect until the desktop phase |

## B. Admin information architecture and operations

| ID | Decision | Recommendation |
|---|---|---|
| **FD-B1** | Approve the **admin page tree** in doc 06 (24 routed pages; 5 new; 10 URLs folded into tabs; Studio as a single link) | Approve |
| FD-B2 | Roles | No staff roles yet. Add `admin_roles` (`founder`, `admin`, later `staff`) to replace 3 duplicated email lists. |
| FD-B3 | Who may perform **money actions** (refund, points/wallet adjustment, comp membership) | Founder + admin, always audited; consider founder-only for refunds over a threshold |
| FD-B4 | Admin width on desktop | Allow a wider glass shell at ≥1024px; keep the 448px column on phones |
| FD-B5 | Order stage **SLAs** for the "delayed" queue | Founder provides target days per stage |

## R. Membership and rewards business rules (gate Phase 4/6; detail in doc 15 / appendix B §13)

| ID | Conflict | Needs |
|---|---|---|
| FD-R1 | **Slay Challenge structure:** config 4 tiers (5/7, 4/7, 5/9, 6/9) vs engine (7 booleans; 3 booleans) vs reveal (3 requirements / 3 phases) | Choose the canonical structure and the phase-to-requirement mapping |
| FD-R2 | Reward reveal art: 3 pre-rendered PNGs per reward vs requested runtime full-object reveal with ghosted sections (no 3D files exist) | Confirm the existing PNGs already depict ghosted→coloured sections (not verified by the audit); **do not regenerate** |
| FD-R3 | Slay Challenge eligibility: 6/12-month only (code) vs listed for 3-month (benefits copy) | Pick one |
| FD-R4 | Challenge selection window (last 3 days of a cycle; starts next cycle) and per-device random reward options | Confirm timing; make options per user on the server |
| FD-R5 | (= FD-C5) | — |
| FD-R6 | Unknown premium tier is treated as 12-month (2x points, Slay access) | Intended? |
| FD-R7 | Hair-analysis eligibility excludes BLACK-only; paid credits unusable by non-subscribers; paid tiers 1/4 vs 1/3/6 | Confirm 1/$20 and 4/$60 and who may buy and use |
| FD-R8 | Points formula (display 1:1 vs checkout net × multiplier vs desktop), expiry, voucher validity | Choose one formula and expiry rule |
| FD-R9 | Referral reward ($20 cash at confirm vs "complete & delivered"; +100 pts; 250 pts/$10/$25 quests) and revocation | Choose amounts and timing |
| FD-R10 | Affiliate points (400/600/600 with caps 2,000/3,000/5,000 per unit per 6 months vs server default 100; Featured Creator up to 1,500) | Confirm 400/600 as canonical (matches copy) |
| FD-R11 | Spend-tier welcome cash ($10/$40/$80) vs premium welcome ($10/$20/$40): do they stack? | Decide |
| FD-R12 | Vouchers wiped for real customers today | Confirm vouchers should be issued (and by which events) once the ledger exists |
| FD-R13 | (= FD-C6) | — |
| FD-R14 | Slay Ticket purchases require Stripe payment proof | Approve (part of FD-C1) |

---

### Approvals the brief requires (checklist)

| Required approval | Where |
|---|---|
| Final CUSTOMER ACCOUNT page tree | FD-A1 |
| Final ADMIN DASHBOARD page tree | FD-B1 |
| Navigation consolidation | FD-A1, FD-B1 (doc 07 lists every fold and redirect) |
| Removal of existing pages | `/account/consult-offer` (FD-A1); 10 admin URLs folded (FD-B1); none deleted outright |
| Major workflow reconstruction | Orders (FD-C2/C10), rewards ledger (FD-C2/R*), BAW checkout (FD-C3) |
| New business rules | None proposed; only conflicts surfaced (FD-R*) |
| Visually substantial changes | Design gates in doc 18 §4 (overview panels, Command Center, admin menu, admin width, re-skins, MY HAIR) |
| Permission model changes | FD-B2, FD-B3 |
| Database migrations | FD-C1, FD-C2 |
| New customer-facing features | MY HAIR (FD-A2); order detail route (FD-A1); support request history (FD-A1) |
