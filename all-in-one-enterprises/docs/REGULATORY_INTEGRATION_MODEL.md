# Regulatory Integration Model

## FMCSA boundary

**No fabricated endpoints.** Sprint 18 ships:

- `RegulatoryDataAdapter` interface
- `DemoRegulatoryAdapter` (USDOT 1234567 demo data)
- `IntegrationResearchRecord` for FMCSA (apiVerified: false)
- Official portal links in `integrationRegistry.ts` (`OFFICIAL_PORTAL_LINKS`)

## Carrier verification

`CarrierExternalVerification` — prefer labels:

- **FMCSA RECORD FOUND** / **EXTERNAL RECORD CONFIRMED**
- Not **VERIFIED CARRIER** unless business definition is explicit

## Road Ready consumption

Staff Road Ready review shows external authority, BOC-3, insurance **public status** where available — informational only, not legal certification.

## Government submission boundary

Filings (authority, IRP, IFTA, permits, BOC-3) are:

- MANUAL, PARTNER, OFFICIAL_API, or UNKNOWN per `StateCapabilityEntry`
- No browser automation or credential storage for government portals

## BOC-3

Architecture supports PARTNER / EXTERNAL_PORTAL / API — All In One does not imply direct filing without legal arrangement.

## Refresh policy

CHECK AGAIN with idempotency + rate limits; display LAST CHECKED; stale data labeled CURRENT | STALE | UNKNOWN
