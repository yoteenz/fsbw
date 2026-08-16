# Bookkeeping Recommendation Engine

Transparent rules in `recommendBookkeepingPlan()` — **not** an opaque AI model.

## Inputs

Assessment captures: trucks, accounts, transaction band, factoring, driver structure, A/R, A/P, payroll reconciliation, IFTA support, truck profitability, monthly review, books currentness.

## Logic summary

1. **Books Rescue first** if books currentness is 3–6, 7–12, or 12+ months behind (`BOOKKEEPING_RECOMMENDATION_THRESHOLDS.booksRescueBehind`).
2. **Custom review** if trucks ≥8, bank accounts ≥5, credit cards ≥5, or transaction band `400_plus`.
3. **Plan score** — weighted points for fleet size, factoring, settlements, A/R, A/P, payroll, profitability, monthly review → Essentials / Plus / All In One.

## Outputs

- `recommendedPlan`, `reasons[]`, `booksRescueRequired`, `afterRescuePlan`, `customReviewRequired`
- Session persistence: `aio_bookkeeping_assessment_v1`, `aio_bookkeeping_recommendation_v1`

## Road Ready

Bookkeeping appears as optional **operate** item (weight 0). Recommendation may surface under **Recommended Services** on Road Ready — does **not** affect compliance percentage.

## Tests

`src/bookkeeping/bookkeepingRecommendation.test.ts`
