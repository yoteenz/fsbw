# 13 — Page Definition of Done

A page is **done** only when every applicable dimension below is **evidenced**, not merely implemented. Rendering, a passing build or a source read never counts as evidence of D5–D12.

**Today every page is NOT DONE.** Nothing has been verified with a signed-in backend run. The highest possible status from code reading is **G (complete but unverified)**.

## The 16 dimensions

| # | Dimension | Evidence required | Who signs |
|---|---|---|---|
| D1 | Route loads | Playwright visit at 390 and 1440 returns the page with no page error | CI |
| D2 | Authentication works | Signed-out visit redirects to `/sign-in?returnTo=` (hash preserved); signed-in visit renders without a per-hop "Loading…" | CI (staging) |
| D3 | Authorization works | A non-owner or non-admin gets 403 from **every API the page calls** (API test), not only a client redirect | API tests |
| D4 | Responsive layout passes | 390 / 768 / 1440 / 2560: no horizontal overflow; content column within its max width (doc 12); tap targets ≥44×44 | CI + design review |
| D5 | All controls functional | Every control in the page's control inventory (audit doc 11 rows for that page) has a test or a recorded manual check. Zero DEAD, PLACEHOLDER or FAKE-SUCCESS rows remain. | QA |
| D6 | Data is authoritative | Every value shown comes from a server record named in doc 06. No `localStorage` read for business data. | Code review + test |
| D7 | Customer/admin sync | For each mirror row (doc 04 CSV) touching the page: an admin action is visible to the customer, and a customer action is visible to the admin, **across two separate browser contexts** | E2E |
| D8 | Empty / loading / error states | All three render using the alert-row canon; the error state has RETRY; no mock fallback | Visual check |
| D9 | No fake production data | Grep gate: no `mock`, `seed`, `demo`, `DEFAULT_*` data path reachable without `?demo=1` on a non-production host | CI grep + review |
| D10 | Payments reconcile | Where money moves: Stripe test-mode run; order, refund and ledger rows match Stripe; reconciliation job reports 0 diffs | E2E (Stripe test) |
| D11 | Notifications | Required emails and in-app alerts fire once (idempotent), respect customer preferences, and link to the canonical route | E2E + email capture |
| D12 | Audit events | Every admin mutation writes `audit_log` with actor, before and after | API test |
| D13 | Accessibility | axe: 0 serious/critical; all interactive elements are buttons or links (or have role + tabIndex + key handling); visible focus | CI (axe) |
| D14 | Unit / integration tests | Logic modules (pricing, ledger, status transitions, entitlement) ≥ the agreed coverage; API handlers tested for auth and happy/failure paths | CI |
| D15 | E2E workflow passes | The workflow rows in doc 19 that involve the page pass on staging | CI (staging) |
| D16 | Visual authority preserved | Side-by-side screenshot review against the approved baseline: marble, glass, typography, colours, assets unchanged except approved design gates | Founder (for gated changes) / design review |

## Status ladder

`D` missing → `C` partial → `A`/`B` one side done → `G` all applicable dimensions implemented but not evidenced → **`H` verified**: all applicable dimensions evidenced on staging and recorded in doc 19's matrix.

## Applicability by page

✓ = applies · — = not applicable.

| Page | D1–D6, D8, D9, D13, D14, D16 | D7 sync | D10 money | D11 notify | D12 audit | D15 E2E |
|---|---|---|---|---|---|---|
| `/account` | ✓ | ✓ (orders, ledger) | — | — | — | ✓ |
| `/account/orders` + detail + review | ✓ | ✓ | ✓ (refund display) | ✓ | — | ✓ |
| `/account/concierge` | ✓ | ✓ (messages, offers) | ✓ (offer price) | ✓ | — | ✓ |
| `/account/rewards` (+ load card, collectibles) | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `/checkout/upgrade` | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `/account/hair` (+ analysis detail) | ✓ | ✓ (credits, grants) | ✓ (credit purchase) | ✓ | — | ✓ |
| `/wishlist` (+ lists, shared) | ✓ | — | — | — | — | ✓ |
| `/account/reviews` | ✓ | ✓ | — | ✓ | — | ✓ |
| `/account/affiliate`, `/account/referrals` | ✓ | ✓ | ✓ (wallet) | ✓ | — | ✓ |
| `/account/alerts` | ✓ | ✓ | — | ✓ | — | ✓ |
| `/account/settings` (+ addresses, payment) | ✓ | — | ✓ (payment methods) | ✓ | ✓ (profile.update exists) | ✓ |
| Admin Command Center | ✓ | ✓ | — | — | — | ✓ |
| Admin Orders + detail | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Admin Approvals + reviews | ✓ | ✓ | ✓ (rewards posted) | ✓ | ✓ | ✓ |
| Admin Customers + detail + deleted | ✓ | ✓ | ✓ (adjustments) | ✓ | ✓ | ✓ |
| Admin Membership & Rewards | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Admin Meetings (+ schedule) | ✓ | ✓ | ✓ (autopay) | ✓ | ✓ | ✓ |
| Admin Inbox | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| Admin Inventory | ✓ | ✓ (storefront stock) | — | ✓ (waitlist) | ✓ | ✓ |
| Admin Marketing (+ copy editors) | ✓ | ✓ | ✓ (offer price) | ✓ | ✓ | ✓ |
| Admin Finance (+ accounting, fraud) | ✓ | — | ✓ | — | ✓ (export) | ✓ |
| Admin Brand, Content Studio, Team, System | ✓ | — | — | — | ✓ | ✓ |

## Reporting rule

A sprint reports a page as **H (verified)** only with a link to the passing staging run (doc 19 row IDs). Everything else stays G at best, and pages without signed-in backend verification are **UNVERIFIED**. No sprint may report "100% complete" from source inspection or build success.
