# AIO Canonical Identity Model (Wave 1)

**Project:** `nnnljnhtmseagotvgxxt`  
**Principle:** Auth user, profile, organization, membership, portal projection, internal staff role, and resource ownership are **distinct**.

## Entities

| Entity | Table / source | Purpose |
|--------|----------------|---------|
| Auth user | `auth.users` | Supabase authentication identity |
| Profile | `aio_profiles` | Human-facing profile (name, email, phone) |
| Organization | `aio_organizations` | Tenant boundary (`organization_type`: carrier, fleet, shipper, etc.) |
| Membership | `aio_organization_memberships` | `user_id` + `organization_id` + `role` + `status` |
| Internal staff | `aio_internal_staff` | AIO office access; `internal_role` |
| Provider link | `aio_service_provider_users` | Maps user → FleetCare provider |
| Driver profile | `aio_driver_profiles` | Driver-owned record |
| Shipper scope | Shipper org membership + freight tables scoped by `shipper_organization_id` |

## Relationships

- One auth user may have **multiple** organization memberships (switch active org in session — DB membership is source of truth).
- Portal projection (CUSTOMER / SHIPPER / DRIVER / FLEETCARE_PROVIDER / AIO_OFFICE) is derived in `src/security/sessionContract.ts` from session fields — not a separate auth provider.
- Cross-org access must **never** rely on client-passed `organization_id` alone; RLS uses `aio_user_org_ids()` and domain helpers.

## Runtime alignment

Wave 0 role projections (4 configured) match guard expectations in `src/auth/guards/RouteGuards.tsx`. Wave 1 proves backend RLS matches those boundaries where policies exist.
