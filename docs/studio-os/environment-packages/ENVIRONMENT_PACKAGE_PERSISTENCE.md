# Environment Package Persistence

## Tables

- `studio_environment_asset_packages`
- `studio_environment_package_outputs`
- `studio_environment_package_readiness`
- `studio_environment_package_generation_jobs`
- `studio_environment_package_approvals`
- `studio_environment_package_audit_events`
- `studio_environment_package_cds_handoffs`
- `studio_environment_package_cache_entries`

Migration: `supabase/migrations/20260714140000_environment_asset_packages.sql`

## Production source of truth

Server uses `api/_lib/environmentPackage/persistence.ts`. In-memory `EnvironmentPackageRepository` is **tests only**; production fails closed when persistence is unavailable.

## Storage path

`studio-world/environment-packages/{departmentId}/{environmentId}/{variantId}/r{revision}/{outputType}/{filename}`

Bucket: `live-preview` (Studio Builder stack).
