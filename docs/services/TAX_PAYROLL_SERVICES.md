# Tax & Payroll Services — All In One Enterprises

## Payroll Services (`payroll-services`)

- Distinct from **payroll reconciliation** in All In One Bookkeeping tier
- Fulfillment: direct, AIO-managed, or partner — `fulfillmentType: null` until configured
- Do not build payroll processor or move funds in custom code
- Workflow: `payroll-onboarding`

## Tax Preparation (`tax-preparation`)

- Provider models: AIO_DIRECT, AIO_MANAGED, PARTNER_PROVIDED (configured per entry)
- Bookkeeping handoff: year-end books, P&L, GL export with customer authorization
- Do not build custom tax calculation or filing logic
- Strict access controls for tax documents; private storage; audit sensitive access

## Bookkeeping integration

When customer has Payroll Service + All In One Bookkeeping, payroll reports may reconcile automatically where integration supports — no duplicate payroll entries.

## Factoring

Unchanged partner/referral model.

## Code

- Catalog entries in `src/services/catalog/serviceCatalog.ts`
- Partner slots: `serviceProviderRegistry.ts` (payroll, tax_preparation types)
