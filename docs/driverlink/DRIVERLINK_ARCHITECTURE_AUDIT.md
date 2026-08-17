# DriverLink Architecture Audit (Phase 0)

**Project:** All In One Enterprises Inc. / AIO DriverLink  
**Date:** 2026-08-17  
**Scope:** Existing AIO standalone (`all-in-one-enterprises/`)

---

## Executive summary

**DriverLink does not exist** in the codebase prior to this sprint. Driver-related data is limited to **`DriverPlaceholder`** in Road Ready demo seed, a **`driver` portal member role** (money/nav restrictions), and service catalog references (DQ files, Clearinghouse). FleetCare (2026-08-17) provides the **vertical slice template** for marketplace domains.

---

## 1. Authentication & roles

| Item | Location |
|------|----------|
| Auth provider | `src/auth/AIOAuthProvider.tsx`, `authService.ts` |
| Guards | `src/auth/guards/RouteGuards.tsx` |
| Demo portal roles | `PortalMemberRole`: `owner \| admin \| operations \| driver \| accounting \| viewer` |
| Office RBAC | `src/office-core/officeContext.ts` — `OfficeStaffRole`, `ROLE_PERMISSIONS` |
| Supabase membership | `aio_membership_role` enum — no dedicated `driver` membership yet |

**Driver role today:** Hides Money Center, restricts command-center actions — **no dedicated driver portal**.

**DriverLink implication:** Add driver-facing surface at `/driver/driverlink/*` + carrier recruiting at `/portal/driverlink/*`. Extend with `aio_driver_profiles.user_id` linked to auth.users. Demo: `driverlinkDemoContext.activeDriverProfileId`.

---

## 2. Existing driver records

| Layer | Status |
|-------|--------|
| Demo | `DriverPlaceholder` in `roadReadyTypes.ts` — id, orgId, name, phone, email, assignedUnitId |
| Seed | `roadReadySeed.ts` — 3 demo drivers |
| UI | `FleetPage.tsx` — read-only list under Fleet |
| Postgres | **No driver tables** in migrations |

**DriverLink:** New `aio_driver_profiles` table + demo parity. Post-hire links to org membership / existing `DriverPlaceholder`.

---

## 3. Organization / client model

- Client orgs: `aio_organizations`, demo `client-a`, `client-b`
- Carriers post opportunities scoped to `organization_id`
- Drivers are individuals until hired → org association

---

## 4. Client Portal / Office patterns

**FleetCare template (clone for DriverLink):**

| Layer | FleetCare path | DriverLink equivalent |
|-------|----------------|----------------------|
| Types | `src/fleetcare/fleetcareTypes.ts` | `src/driverlink/driverlinkTypes.ts` |
| Config | `fleetcareConfig.ts` | `driverlinkConfig.ts` |
| Matching | `matchingService.ts` | `matchingService.ts` |
| Demo | `fleetcareSeed.ts`, `fleetcareActions.ts` | `driverlinkSeed.ts`, `driverlinkActions.ts` |
| Portal | `pages/portal/fleetcare/*` | `pages/portal/driverlink/*` (carrier) |
| Third surface | `pages/provider/*` | `pages/driver/*` (driver portal) |
| Office | `pages/office/FleetCareOfficePages.tsx` | `DriverLinkOfficePages.tsx` |
| Migration | `20260817190000_aio_fleetcare_network.sql` | `20260817200000_aio_driverlink.sql` |

---

## 5. Digital Records Vault

- Taxonomy includes **Driver License** (`vaultTaxonomy.ts`)
- Driver credentials → `aio_driver_credentials.document_id` → `aio_documents`
- Job-scoped employer access via consent records — not full vault browse

---

## 6. DQ / Clearinghouse / Road Ready

- Service catalog: DQ files, Clearinghouse (`services.ts`)
- Road Ready: `REQUIREMENT_DEFINITIONS`, driver-scoped `scopeType: 'driver'`
- **Do not duplicate DQ system** — DriverLink hooks to existing DQ workflow states

---

## 7. Notifications / messaging / scheduling

- `notificationTypes.ts` — extend with DriverLink events
- `communicationTypes.ts` — add `driverlink` conversation type
- Appointments: reuse `appointmentActions.ts` for interview scheduling hooks

---

## 8. Billing / subscriptions

- Pattern: `fleetcareConfig.ts` → `DRIVERLINK_PRICING_CONFIG`
- Driver free tier default; company plans configurable, not activated until legal review

---

## 9. Supabase / RLS

- Apply migrations to **dedicated AIO Supabase only** (NOT Frontal Slayer)
- RLS: `aio_user_org_ids()` for carriers; driver profiles via `user_id = auth.uid()`

---

## 10. Demo mode

- Current store version: **24** (FleetCare)
- Upgrade to **25** with DriverLink seed (Spanish-speaking driver + English carrier scenario)

---

## 11. i18n (cross-cutting)

See `docs/i18n/AIO_I18N_ARCHITECTURE_AUDIT.md` — greenfield; no existing i18n library.

---

## Recommendations

1. Implement DriverLink as FleetCare-pattern vertical inside AIO
2. Separate driver portal route tree from carrier portal
3. Centralize status labels in `driverlinkConfig.ts` + i18n keys
4. Matching on professional criteria only — no protected traits
5. Consent-scoped credential release to employers
