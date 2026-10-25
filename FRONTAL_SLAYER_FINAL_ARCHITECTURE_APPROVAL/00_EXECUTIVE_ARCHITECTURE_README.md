# FRONTAL SLAYER: Account and Admin Final Architecture (Approval Package)

**Sprint:** `P0.FRONTAL-SLAYER.OPUS.ACCOUNT-ADMIN-FINAL-ARCHITECTURE-AND-FOUNDER-APPROVAL-PACKAGE.V1`
**Status:** PLANNING / AUDIT REFINEMENT ONLY · **PENDING FOUNDER APPROVAL**
**Built from:** the initial audit in `FRONTAL_SLAYER_ACCOUNT_ADMIN_AUDIT/` (commit `4863456`), which this package preserves unchanged.

> Nothing in this package is approved and nothing authorizes implementation. Every founder decision has `founderSelection: null`. Recommendations are recommendations. No application code, database, Stripe setting, deployment or SITE00 file was changed.

## 1. The answer in one page

**Customer account: 10 families, 21 routed pages, 3 new.**
OVERVIEW · ORDERS (with order detail and an APPOINTMENTS tab) · CONCIERGE · REWARDS (membership, points, wallet, Slay Challenge, collectibles) · **MY HAIR** (new: profile, analyses, saved builds) · WISHLIST · REVIEWS & CONTENT · EARN & SHARE · ALERTS · SETTINGS.
New routes: `/account/orders/:orderId`, `/account/hair`, `/account/hair/analyses/:analysisId`. One route redirects (`/account/consult-offer`); `/tools/hairstyle-analysis` becomes admin-only; the `/mobile/*` placeholders wait on decision B6. Existing URLs for addresses and payment stay. Docs 01, 05.

**Admin: 15 families, 24 routed pages, 5 new, 10 old URLs folded into tabs.**
COMMAND CENTER · **ORDERS** (new, with order detail) · APPROVALS · CUSTOMERS (new customer detail) · **MEMBERSHIP & REWARDS** (new) · MEETINGS · INBOX · **CATALOG & INVENTORY** (new) · MARKETING · FINANCE · BRAND · CONTENT STUDIO · TEAM · SYSTEM · STUDIO (boundary link only). No working route is deleted without a redirect. Docs 02, 05.

**One source of truth.** The database is the record for orders, memberships, ledgers, content and support. Stripe confirms money. The server prices everything. The browser only displays. Docs 06, 07, 08.

**What must happen first does not wait for the page trees.** Six CRITICAL risks are open today. Two are LIVE-CONFIRMED: anyone holding the public anon key can mint hair-analysis credits, and the $60 four-pack grants nothing. The others are confirmed in code: free Slay Tickets, cancelled memberships that keep billing, undercharged Build-A-Wig orders, and no server order of record. Containment (S0B-1 database, S0B-2 application) is planned with rollbacks and needs only the A-group decisions plus H3. Doc 11.

**The database is shared with SITE00 and JURNL.** Every signup in all three products runs FRONTAL SLAYER's profile trigger. SITE00 writes FRONTAL SLAYER's profile columns on every sign-in. The two repos collide on six migration version numbers. Every database sprint therefore follows the rules in doc 11 R-17: no column drops, no-throw triggers, fresh timestamps, branch rehearsal, SITE00 smoke test.

## 2. Package contents

| # | Document | What it decides or shows |
|---|---|---|
| 00 | This README | Summary, counts, validation, next step |
| 01 | Customer final page tree | 10 families, per-family spec, placement answers |
| 02 | Admin final page tree | 15 families, roles, per-family operating spec |
| 03 | Page responsibility matrix (CSV) | 64 rows: every page and retired route with disposition, condition A–H, marker, owner, mirror, backend readiness, visual rule, risks, decisions, sprint |
| 04 | Customer ↔ admin workflow matrix (CSV) | 35 workflows × the 12 required columns, with prior defects, risks, decisions |
| 05 | Route migration and redirect plan (CSV) | 72 rows: dispositions, consumers (in-app, email, stored links, PSA, Stripe), redirect strategy, auth, saved/email link impact, regression test |
| 06 | Shared source-of-truth architecture | Authority per domain; idempotency, reversal, reconciliation, expiry; allowed localStorage |
| 07 | Order, payment and Stripe authority | Current Stripe surface, flow-by-flow target, order of record, refunds |
| 08 | Membership, rewards and ledger | Rules classified CONFIRMED / CONFLICTING / UNVERIFIED / FOUNDER DECISION; ledger design |
| 09 | Hair Analysis and Build-A-Wig | Analysis model, BAW ownership and price authority, interim custom-quote path |
| 10 | Community, affiliate and content | One content pipeline, server rules, Slay Cam, referral, support |
| 11 | Security and money risk register | R-01…R-20 with every required field, banded P0A → P2 |
| 12 | Visual preservation and responsive plan | What is preserved, targeted corrections, gates G1–G5 |
| 13 | Page Definition of Done | 16 dimensions, status ladder |
| 14 | Implementation dependency graph | Bands, hard/soft dependencies, critical path |
| 15 | Sprint roadmap and acceptance gates | S0A … S7 |
| 16 | Founder decision board V2 | 55 decisions in groups A–H, plus 10 engineering decisions not escalated |
| 17 | Conflicts and unverified assumptions | K-01…K-20, U-01…U-16 |
| 18 | Asset and component reuse map | Everything needed already exists except the certification collectible art (G6) |
| 19 | Release readiness and E2E matrix | Environment, gates, 35 workflow tests, suites. All NOT RUN |
| 20 | Approval manifest (JSON) | Trees, decisions (all null/PENDING), approval requirements per sprint |
| 21 | Interactive founder board V2 | https://claude.ai/artifact/CpzJCzVGRK5HpEDzz91r82 (owner-only recording; see its README) |
| — | `evidence/` | Research behind docs 07, 08, 11, 18 and the validation output |
| — | `exports/` | Small and full handoff zips |

## 3. Counts

| Item | Count |
|---|---|
| Customer families / routed pages | 10 / 21 (20 page rows; the wishlist lists row holds two URLs) |
| Admin families / routed pages | 15 / 24 |
| New pages | 9 (customer 4 rows incl. the APPOINTMENTS tab; admin 5) |
| Admin URLs consolidated into tabs | 10 |
| Retired or restricted routes | 5 rows (`/account/consult-offer`, `/tools/hairstyle-analysis`, `/mobile/*`, Slay Tickets routes (blocked), `/admin/clients/account`) |
| Workflows mirrored | 35 (covers all 25 audit broken workflows) |
| Risks | 20 (6 CRITICAL, 11 HIGH, 3 MEDIUM) |
| Founder decisions | 55, all PENDING; 2 (B6, G6) gate no sprint |

## 4. Recommended next sprint

**S0B-1 — P0A database containment**, in parallel with **S0A** (founder records decisions on board V2).
S0B-1 can start as soon as **A1** (approve the containment migration), **H3** (SITE00 coordination) and **H2** (branch rehearsal) are recorded, and the service-role key is confirmed in both production deployments (U-01). S0B-2 follows on A2–A8, E2, F1. Page-tree work (S2, S3) waits for B1 and C1.

## 5. Validation (run at packaging time)

The checklist below is produced by a script over the package files (`evidence/VALIDATION_RESULTS.txt`). Checks marked "process" are statements about this sprint's actions.

| Check | Result |
|---|---|
| Every discovered page (audit CSV 09, 10) appears in a disposition matrix | PASS |
| Every missing page has a destination | PASS |
| All 25 broken workflows mapped to a workflow and test | PASS |
| Every critical blocker CB-1…CB-9 has a containment or remediation plan | PASS |
| Every page has a responsibility, a mirror (if live), a visual rule | PASS |
| Every financial workflow names a server-side authoritative record | PASS |
| Every route row has a disposition and regression test | PASS |
| Cross-references resolve (decision, risk, workflow, conflict, assumption ids) | PASS |
| All decisions `founderSelection: null`, `PENDING` | PASS |
| Dependencies realistic | Process: doc 14 critical path; containment decoupled from page-tree approval |
| SITE00 untouched | PASS (`git status` clean) |
| Initial audit preserved | PASS (folder unmodified) |
| No database mutations | Process: no database call of any kind was made in this sprint (session log checked). Live facts are reused from the audit's read-only checks |
| No deployment, no merge, no PR | Process: commit and push to `claude/frontal-slayer-audit-vclp3w` only |

## 6. What this package does not claim

- No test was run in this sprint. Every test in doc 19 is NOT RUN.
- No page is verified (status H). The highest status any page holds is G (complete, unverified). Doc 13.
- No business value was invented. Reward values, eligibility and the $20 referral incentive stay with decisions D1–D13; the referral incentive is not implemented or scheduled.
- No artwork was generated or regenerated.
- The board's decision store was empty at publication: 0 of 55 recorded.
