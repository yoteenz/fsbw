# AIO Spanish Translation QA

**Date:** 2026-08-17  
**Locales:** en-US, es-US

## Coverage by domain

| Domain | Status | Notes |
|--------|--------|-------|
| Homepage hero | ✅ Translated | `homepage.json` |
| Auth login transition | ✅ Translated | `auth.json` |
| Public nav labels | ⚠️ Partial | Mega-menu still English in `publicNavigation.ts` |
| DriverLink public | ✅ Translated | Full `driverLink.json` |
| Driver portal | ✅ Translated | Uses `driverLink` namespace |
| Company DriverLink portal | ✅ Translated | |
| FleetCare public keys | ✅ Partial | `fleetCare.json` status labels |
| Client portal nav | ⚠️ Partial | English labels in `AIOPortalLayout` |
| Road Ready | ❌ Not migrated | Still in `roadReadyConfig.ts` |
| Office | English default | By design for staff |

## Terminology requiring review
- CDL, Clearinghouse, DQ — acronyms kept canonical
- "Employer compliance" — verify Spanish labor terminology
- FleetCare independent provider disclosure

## Screens tested
- `/services/driverlink` EN + ES
- `/driver/driverlink` ES driver portal
- `/portal/driverlink` company view
- `/office/driverlink` overview
- Homepage language toggle

## Missing keys process
Dev console warns `[i18n] Missing translation`. Production falls back to English fragment (not raw key path).
