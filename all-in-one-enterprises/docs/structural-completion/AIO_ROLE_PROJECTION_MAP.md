# AIO Role Projection Map

Role projections are **not** separate visual families. They are authenticated views of the shared product graph.

| Projection | Route prefix | Guard (current) | Shared logic |
|------------|--------------|-----------------|--------------|
| **Customer (carrier/OO)** | `portal/*` | `CustomerRouteGuard` | Demo store + partial Supabase |
| **Shipper** | `shipper/*` | `CustomerRouteGuard` | `src/shipper/*`, brokerage intake |
| **Driver** | `driver/driverlink/*` | **None** (gap) | Demo store |
| **FleetCare provider** | `provider/fleetcare/*` | **None** (gap) | Demo store |
| **AIO Office** | `office/*` | `OfficeRouteGuard` (internal staff) | Demo + office modules |

## Internal staff roles (Supabase)

From migrations / RLS helpers: `aio_internal_role`, `aio_membership_role`, `aio_is_internal_user()`, org memberships.

Office specialist surfaces map to divisions (permitting, compliance, insurance, dispatch, factoring, brokerage, etc.) via queue pages and command centers—not separate customer families.

## Financial privacy

- Shipper projections must not expose carrier pay / margin (enforced in `projectCarrierLoadResult`, RLS, live tests).
- Carrier load board uses publication projection without shipper rate fields.

## Recommended actions

1. Add provider/driver guards mirroring customer guard + role claims.
2. Model projections in canonical graph `role_projection` field (see JSON).
3. Do **not** merge shipper and carrier UX into one portal.
