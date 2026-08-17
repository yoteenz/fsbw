# FleetCare Architecture Audit (Phase 0)

**Project:** All In One Enterprises Inc. / AIO FleetCare Network  
**Date:** 2026-08-17  
**Scope:** Existing AIO standalone (`all-in-one-enterprises/`)

---

## Executive summary

FleetCare is **net-new** inside AIO. No prior `FleetCare` module exists. The platform has strong foundations for **auth/orgs**, **service requests**, **vault/documents**, **billing/subscriptions** (bookkeeping pattern), **office RBAC**, **notifications**, and **audit** — but **fleet vehicles exist only in demo memory** (`PowerUnit`, `Trailer`) with no Postgres fleet tables yet.

FleetCare should **extend** — not duplicate — these patterns.

---

## 1. Authentication

| Item | Location |
|------|----------|
| Provider | `src/auth/AIOAuthProvider.tsx` |
| Service | `src/auth/authService.ts` |
| Supabase client | `src/data/supabase/client.ts` (`storageKey: aio-auth-token`) |
| Guards | `src/auth/guards/RouteGuards.tsx` — demo bypass; supabase requires auth |
| Session | `AioAuthSession`: profile, organization, `membershipRole`, `internalRole`, `isInternal` |

**FleetCare implication:** Add `service_provider` membership on provider orgs via `aio_service_provider_users` + app-level role checks. Providers must not receive `aio_internal_staff` or unrelated client org membership.

---

## 2. Organization / client model

**Postgres:** `aio_organizations`, `aio_organization_memberships`, `aio_customers`, `aio_customer_organizations`  
**Demo:** `Client` in `demoTypes.ts`; `clientId === organizationId` convention  
**Org types:** includes `'fleet'`, `'carrier'`, `'owner_operator'`

**FleetCare:** Client tickets scoped to `organization_id`. Provider businesses are separate `aio_service_providers` linked to optional `aio_organizations` row (provider's own org).

---

## 3. Fleet / vehicles

| Layer | Status |
|-------|--------|
| Demo | `PowerUnit`, `Trailer`, `DriverPlaceholder` — `roadReadyTypes.ts`, `demoStore.powerUnits` |
| Postgres | **None** — Road Ready SQL tables exist but UI uses demo store |
| UI | `FleetPage.tsx`, `VehicleDetailPage.tsx` |

**FleetCare:** New `aio_fleet_vehicles` table + demo parity. Tickets reference `vehicle_id`.

---

## 4. Roles & permissions

**Postgres enums:** `aio_membership_role`, `aio_internal_role`; RBAC tables `aio_roles`, `aio_permissions`, `aio_user_roles` (no seed)  
**Demo office:** `OfficeStaffRole`, `ROLE_PERMISSIONS` in `officeContext.ts`  
**RLS helpers:** `aio_is_internal_user()`, `aio_user_org_ids()`

**FleetCare:** New role code `service_provider` (scope: provider org). Office permissions: `fleetcare.*` (demo map). No provider access to unrelated client data.

---

## 5. Supabase migrations (existing)

Path: `all-in-one-enterprises/supabase/migrations/`  
**Apply ONLY to dedicated AIO Supabase** — NOT Frontal Slayer (`hyycomvcaqxxvyrfupes`).

Reusable tables for FleetCare:
- `aio_service_requests` — pattern for ticket numbering/history
- `aio_documents` — vault integration (extended in vault sprint)
- `aio_activity_events`, `aio_audit_events` — audit
- `aio_notifications` — alerts
- `aio_invoices`, `aio_payments` — future provider fee billing

---

## 6. Storage / Digital Records Vault

- Types: `src/vault/vaultTypes.ts` — `vehicleId`, categories include `fleet`
- Demo uploads: data URLs; production buckets planned
- FleetCare repair docs → `aio_documents` with `related_entity_type = 'fleetcare_job'`

---

## 7. RLS patterns

Standard org scope:
```sql
organization_id in (select public.aio_user_org_ids()) or public.aio_is_internal_user()
```

Provider scope (new):
```sql
provider_id in (select public.aio_user_provider_ids())
```

Job-scoped client release enforced in app layer + ticket status checks.

---

## 8. Client Portal

Router: `AllInOneRoutes.tsx` → `AIOPortalLayout`  
OPS section: dispatch, brokerage, requests — **FleetCare belongs under OPS**  
Mobile bottom nav: Ops → `/portal/operations` (FleetCare linked from operations + fleet vehicle pages)

---

## 9. AIO Office

Router: `office/routes/OfficeRoutes.tsx` — grouped sidebar  
Similar domains: Insurance, Factoring, Dispatch command centers  
**FleetCare admin:** new `/office/fleetcare/*` group

---

## 10. Billing / subscriptions

**Pattern:** `bookkeepingPlans.ts` + `aio_bookkeeping_subscriptions` migration  
**FleetCare:** Central config in `fleetcarePricing.ts`; separate client vs provider subscriptions; marketplace fee via `referralService` — **not hardcoded 0.10 in UI**

---

## 11. Service requests

Existing `aio_service_requests` + demo `ServiceRequest` — FleetCare uses **dedicated** `aio_fleetcare_tickets` (maintenance-specific lifecycle). May cross-link to generic service request later.

---

## 12. Audit & notifications

- Demo: `activity: ActivityEvent[]` with rich `ActivityKind`
- Postgres: `aio_audit_events` (immutable), `aio_activity_events`
- Notifications: `notificationTypes.ts` — extend with FleetCare event types

---

## 13. Demo mode

Default `VITE_AIO_DATA_MODE=demo` — FleetCare demo seed with synthetic provider, tickets, estimates, referral rows. Never real PII.

---

## 14. Duplication risk — avoided

| Do NOT duplicate | Reuse |
|------------------|-------|
| Auth system | AIOAuthProvider |
| Org membership | aio_organizations + memberships |
| Document storage model | aio_documents / vault |
| Subscription config pattern | bookkeepingPlans |
| Office layout | AIOOfficeLayout |
| Page system | page-system templates for public pages |

---

## 15. Gaps addressed this sprint

1. `aio_fleet_vehicles` + FleetCare domain tables + RLS  
2. Provider portal routes (`/provider/*`)  
3. Client maintenance workflow (`/portal/fleetcare/*`)  
4. Office FleetCare admin  
5. Public FleetCare + provider join pages  
6. Configurable pricing/fees/attribution windows  
7. Pre-existing customer relationship model  
8. Job-scoped data access in services  

---

## Root cause summary

FleetCare requires a **new bounded context** inside AIO with provider-side identity, ticket state machine, and referral economics — while reusing auth, vault, office shell, and subscription configuration patterns from bookkeeping/insurance/dispatch domains.
