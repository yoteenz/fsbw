# Bookkeeping Pricing v2

Refinement 04A — approved recurring prices unchanged; Books Rescue updated.

## Recurring plans (starting at)

| Plan | Monthly | Annual |
|------|---------|--------|
| Bookkeeping Essentials | $249 | $2,490 |
| Bookkeeping Plus | $449 | $4,490 |
| All In One Bookkeeping | $749 | $7,490 |

## Books Rescue (one-time)

**Starting at $749** — not unlimited historical cleanup. Final quote depends on months behind, accounts, transactions, entities, trucks, documentation, reconciliation state, and accounting software.

## Complexity drivers

Truck count, financial accounts, transaction volume, entities, factoring, driver/contractor count, A/R, A/P, payroll reconciliation, driver settlements, historical cleanup, accounting platform complexity.

## Guardrails

- `BOOKKEEPING_RECOMMENDATION_THRESHOLDS` in `bookkeepingConfig.ts`
- Plan escalation when Essentials insufficient (`plan_escalation` recommendation kind)
- Custom review for high complexity
- Staff price review with audit trail (office workflow)

## Code references

- `BOOKS_RESCUE_STARTING_PRICE_MINOR` → 74900 ($749)
- `servicePricingConfig.ts` → books-rescue base fee
- Assessment → `recommendBookkeepingPlan()`
