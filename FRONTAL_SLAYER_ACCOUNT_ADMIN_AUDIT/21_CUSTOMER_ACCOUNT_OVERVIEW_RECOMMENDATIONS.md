# 21 — Customer Account Overview Recommendations

## 1. Current `/account` verdict

The hub is a **beautiful navigation page with one identity card**: photo, name, email, member label, vouchers, slay tickets, digital cash and LOAD GIFT CARD, followed by 12 nav cards. It answers "who am I signed in as?" and little else.

Problems:
- The voucher count is always 0 for real customers.
- The digital-cash figure is client-side.
- At ≥768px it redirects to the Desktop Penthouse, a different dashboard with a different points formula.

| Question the overview should answer | Today |
|---|---|
| Who am I signed in as? | ✔ |
| What is happening with my orders? | ✘ (must open Orders; data is local or stub) |
| What membership do I have? | Partial (a "STANDARD/PREMIUM REWARDS MEMBER" label) |
| How many loyalty points do I have? | ✘ on the hub (on Rewards, client-computed) |
| Do I have an available hairstyle analysis? | ✘ |
| Are rewards waiting for me? | ✘ |
| Do I have an unfinished action? | ✘ (badges only) |
| Where should I go next? | ✘ |

## 2. Proposed hierarchy (same marble, glass cards, typography)

```
ACCOUNT > OVERVIEW
┌─ IDENTITY CARD (existing card, unchanged layout) ─────────────────────────────┐
│ photo · NAME (Covered By Your Grace) · email · MEMBERSHIP BADGE               │
│ (e.g. "6-MONTH PREMIUM · RENEWS MAR 14" / "STANDARD MEMBER — UPGRADE")       │
└──────────────────────────────────────────────────────────────────────────────┘
┌─ ACTION NEEDED (only if non-empty; red-labelled rows, max 3) ────────────────┐
│ SIGN YOUR ORDER FORM — ORDER #014        → /tools/order-form?orderId=…      │
│ YOUR PAYMENT FAILED — UPDATE CARD         → Stripe portal                    │
│ REVIEW YOUR NOIR — DELIVERED 3 DAYS AGO   → /account/orders/:id/review       │
│ FINISH YOUR SAVED BUILD                   → /account/hair?tab=builds         │
└──────────────────────────────────────────────────────────────────────────────┘
┌─ ORDERS IN MOTION (latest 2 active orders; stage name + progress bar) ───────┐
│ → ORDER DETAIL · "VIEW ALL ORDERS"                                            │
└──────────────────────────────────────────────────────────────────────────────┘
┌─ MY WALLET (4 compact figures in one glass card) ────────────────────────────┐
│ POINTS 1,240 · DIGITAL CASH $20 · VOUCHERS 1 · SLAY TICKETS 3   → /account/rewards │
└──────────────────────────────────────────────────────────────────────────────┘
┌─ MY HAIR (one line) ─────────────────────────────────────────────────────────┐
│ 1 ANALYSIS AVAILABLE THIS MONTH  → START                                      │
└──────────────────────────────────────────────────────────────────────────────┘
┌─ NEXT BEST ACTION (one card; rule-based, see below) ─────────────────────────┐
└──────────────────────────────────────────────────────────────────────────────┘
  Existing nav-card grid (unchanged visual; labels per doc 05)
  TAKE THE MANSION TOUR · SIGN OUT
```

## 3. Rules (keep the overview uncluttered)

- **At most 5 panels above the nav grid.** Panels with nothing to say are hidden (no empty "0" panels), except MY WALLET, which always shows.
- **Action Needed** is ordered by consequence: payment failure → order form → review → unfinished build. Show at most 3.
- **Next Best Action** is chosen from a fixed list, using existing state only and no invented promotions:
  1. no hair profile → "SET UP MY HAIR PROFILE"
  2. analysis available → "USE THIS MONTH'S ANALYSIS"
  3. standard member with ≥1 order → "SEE PREMIUM BENEFITS"
  4. else → "EXPLORE THE ATELIER" (Build-A-Wig)
- **Every figure comes from the server** (doc 14 S1/S4/S9). Until the ledgers exist, hide the POINTS figure rather than show a client-computed one.
- **Founder "VIEW AS CLIENT"** must show the real client experience with **no mock data**. Mock seeding moves behind an explicit `?demo=1` flag on non-production builds only.

## 4. Data required

| Panel | Endpoint (proposed) | Depends on |
|---|---|---|
| Identity + membership | `GET /api/profile` (exists) | — |
| Action needed | `GET /api/account/overview` (new aggregate) | S1, S11, `membership_payment_failures` |
| Orders in motion | same | S1, S2 |
| Wallet | same | S4 (+ `slay_ticket_balance` exists) |
| My Hair | `GET /api/hairstyle-analysis-usage` (exists) | — (available now) |

## 5. Acceptance criteria

- The overview renders in one request after the shared account guard (no per-page re-sync).
- Every panel has loading, empty and error states using the alert-row typography canon.
- 390px: single column, all tap targets ≥ 44×44 (the current 9px CHANGE/RESET links fail this).
- 768px+: decide with the founder whether `/account` keeps redirecting to the Desktop Penthouse (FD-A9). If it does, the Penthouse tiles must read the same aggregate endpoint so the numbers match.
