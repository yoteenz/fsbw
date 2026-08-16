# Bookkeeping Pricing

## Public starting prices

| SKU | Starting price |
|-----|----------------|
| Bookkeeping Essentials | $249/mo · $2,490/yr |
| Bookkeeping Plus | $449/mo · $4,490/yr |
| All In One Bookkeeping | $749/mo · $7,490/yr |
| Books Rescue | $749 one-time |

All customer-facing prices use **`starting_at`** pricing mode in `src/billing/servicePricingConfig.ts`.

## Complexity factors (no public surcharge amounts)

Final pricing may depend on:

- Truck count, bank/credit-card accounts, transaction volume
- Factoring, driver settlements, A/R, A/P, payroll reconciliation
- Books cleanup backlog, entities, missing documentation

When thresholds in `BOOKKEEPING_RECOMMENDATION_THRESHOLDS` are exceeded → **custom staff pricing review** before service begins.

## Annual billing

Displayed as billed annually (e.g. $2,490/year). Approx. two months savings vs monthly list where applicable.

## Admin

Configure via Office pricing settings (`/office/settings/pricing`) when production pricing admin is active. Base amounts seeded in billing config; overrides follow existing AIO pricing architecture.
