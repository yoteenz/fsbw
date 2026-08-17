# DriverLink Product Architecture

**Domain:** AIO DriverLink — driver hiring marketplace inside AIO  
**Date:** 2026-08-17

## Purpose

Connect **drivers** with **motor carriers** via a technology marketplace + recruiting platform. AIO facilitates discovery, matching, credentials, applications, and hiring workflow — **not employment decisions or legal qualification**.

## Models

### Driver profile
Independent driver account (`aio_driver_profiles`) linked to `auth.users`. Fields: CDL, endorsements, experience, preferences, marketplace status, `preferred_language`.

### Company / carrier
Existing `aio_organizations` post `aio_driver_job_opportunities`.

### Matching
`matchingService.ts` — professional criteria only (CDL, endorsements, equipment, region, route, experience). Explainable match factors + score. **No protected traits.**

### Applications
Pipeline statuses from `matched` → `application_submitted` → `under_review` → `employer_compliance` → `hired`.

### Credential access
Consent-scoped release via `consent_scope` + `employer_access_level`. Levels: profile_only → application_data → selected_credentials → employer_compliance → active_driver_access.

### DQ / Clearinghouse hooks
Credential types include `dq_documents`, `clearinghouse`. States: `not_started`, `employer_action_required`, etc. **No fake completion.**

### Hiring transition
`markDriverHired()` updates application + driver marketplace status; preserves profile history. Future: link to org membership + Road Ready driver scope.

## Pricing (configurable, mostly inactive)
`driverlinkConfig.ts` — driver free; company plans inactive pending legal review. No placement fees activated.

## Surfaces
| Surface | Path |
|---------|------|
| Public | `/services/driverlink` |
| Driver portal | `/driver/driverlink/*` |
| Company portal | `/portal/driverlink/*` |
| Office | `/office/driverlink/*` |

## i18n
Driver UI fully keyed under `driverLink` namespace. Driver may use Spanish while company uses English — **same underlying records**, localized status labels only.

## Demo
María González (`es-US` preference) + Heartland Freight regional reefer job + submitted application.
