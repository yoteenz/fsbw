# DriverLink Data Model

**Migration:** `20260817200000_aio_driverlink.sql`  
**Demo store:** v25

## Tables

| Table | Purpose |
|-------|---------|
| `aio_driverlink_network_settings` | Policy/pricing JSON |
| `aio_driver_profiles` | Driver marketplace profiles |
| `aio_driver_credentials` | Vault-linked credentials |
| `aio_driver_job_opportunities` | Carrier job postings |
| `aio_driver_job_matches` | Bidirectional match records |
| `aio_driver_applications` | Application pipeline |
| `aio_driver_consent_records` | Data release audit |
| `aio_driverlink_company_subscriptions` | Company plan hooks |

## Enums
- `aio_driver_marketplace_status`
- `aio_driver_application_status`
- `aio_job_opportunity_status`

## RLS
- Drivers: own profile/credentials via `user_id = auth.uid()`
- Carriers: org-scoped jobs/applications via `aio_user_org_ids()`
- Published jobs: public read for matching

## Indexes
- `idx_aio_driver_profiles_user`, `idx_aio_driver_profiles_status`
- `idx_aio_driver_jobs_org`
- Unique `(driver_profile_id, opportunity_id)` on matches

## Extensions
- `aio_user_profiles.preferred_language` for i18n
