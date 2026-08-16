# Bookkeeping Service — All In One Enterprises Inc.

## Positioning

**Bookkeeping built for trucking** — not generic small-business bookkeeping. Organized around carrier operations: fuel, tolls, permits, factoring fees, dispatch fees, truck payments, driver expenses, load revenue, and related categories.

All In One is **not** a CPA firm, tax preparer, payroll processor, bank, lender, or factor.

## Plans (starting at)

| Plan | Monthly | Annual |
|------|---------|--------|
| Bookkeeping Essentials | $249 | $2,490 |
| Bookkeeping Plus | $449 | $4,490 |
| All In One Bookkeeping | $749 | $7,490 |

**Books Rescue** (one-time): starting at **$499** — not a fourth recurring tier.

## Service boundaries

- No automatic tax return preparation
- IFTA bookkeeping support ≠ IFTA filing (separate service)
- Payroll bookkeeping/reconciliation ≠ payroll processing
- Factoring reconciliation ≠ factoring / funding
- No bank or accounting passwords collected in forms

## Public routes

- `/services/bookkeeping` — sales page
- `/services/bookkeeping/assessment` — questionnaire
- `/services/bookkeeping/recommendation` — transparent result

## Portal & Office

- Portal: `/portal/bookkeeping`
- Office: `/office/bookkeeping` (+ subscriptions, books-rescue, leads queues)

## Code

- Plans: `src/bookkeeping/bookkeepingPlans.ts`
- Recommendation: `src/bookkeeping/bookkeepingRecommendation.ts`
- Demo data: `src/demo/bookkeepingSeed.ts`
