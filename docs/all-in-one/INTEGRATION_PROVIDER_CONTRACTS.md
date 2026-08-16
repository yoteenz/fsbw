# Integration Provider Contracts

See `src/all-in-one/integrations/integrationAdapter.ts` for TypeScript contracts.

## Base: IntegrationAdapter

All adapters implement verify, capabilities, execute, optional sync/disconnect.

## RegulatoryDataAdapter

- `lookupCarrier({ identifierType, identifier })`
- Returns provenance — does not overwrite canonical customer records
- FMCSA live adapter: **not implemented** until official API verified

## PaymentProviderAdapter

- Checkout, verify, refund, webhook processing
- Money validation via integer minor units + ISO currency

## EmailProviderAdapter / SmsProviderAdapter

- Sprint 16 comm safety (consent, suppression) remains authoritative
- Bridge: `communicationProviders.ts` uses integration-aligned demo providers

## MapsRoutingAdapter

- Route estimates labeled **ESTIMATED** — not authoritative IFTA mileage

## LoadBoardAdapter

- Search returns **external candidates** — import creates canonical Load with external ID

## FactoringProviderAdapter / InsurancePartnerAdapter

- Submission requires authorization + document policy
- Provider status mapped to canonical states; raw status retained for audit

## AccountingProviderAdapter

- Export idempotent via operation + external ID
- Missing mapping blocks export

## Boundaries only (no live provider)

- IdentityVerificationAdapter, BusinessVerificationAdapter, ESignatureAdapter, TelematicsAdapter — interface + demo/research state
