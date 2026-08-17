# FleetCare Data Model

**Migration:** `all-in-one-enterprises/supabase/migrations/20260817190000_aio_fleetcare_network.sql`  
**Apply to:** Dedicated AIO Supabase project only (NOT Frontal Slayer `hyycomvcaqxxvyrfupes`)  
**Demo parity:** `demoTypes.ts` v24 + `fleetcareSeed.ts`

---

## Entity relationship overview

```
aio_organizations (client)
  ├── aio_fleet_vehicles
  ├── aio_fleetcare_client_subscriptions
  └── aio_fleetcare_tickets
        ├── aio_fleetcare_ticket_events
        ├── aio_fleetcare_ticket_matches
        ├── aio_fleetcare_ticket_assignments
        ├── aio_fleetcare_estimates → aio_fleetcare_estimate_line_items
        ├── aio_fleetcare_customer_authorizations
        ├── aio_fleetcare_service_jobs
        │     ├── aio_fleetcare_repair_records
        │     ├── aio_fleetcare_provider_reviews
        │     └── aio_fleetcare_referral_transactions
        └── aio_fleetcare_disputes

aio_service_providers (independent business)
  ├── aio_service_provider_locations
  ├── aio_service_provider_users → auth.users
  ├── aio_service_provider_services → aio_fleetcare_service_categories
  ├── aio_service_provider_service_areas
  ├── aio_service_provider_credentials → aio_documents
  ├── aio_service_provider_insurance → aio_documents
  ├── aio_fleetcare_provider_subscriptions
  └── aio_fleetcare_preexisting_relationships → aio_organizations
```

---

## Enums

| Enum | Values |
|------|--------|
| `aio_fleetcare_ticket_status` | draft, submitted, searching, matched, provider_reviewing, provider_accepted, provider_declined, awaiting_estimate, estimate_sent, awaiting_customer_authorization, authorized, scheduled, in_service, awaiting_parts, on_hold, completed, customer_confirmed, cancelled, disputed, closed |
| `aio_fleetcare_urgency` | routine, soon, today, roadside_urgent |
| `aio_fleetcare_drivable_status` | yes, no, unknown |
| `aio_fleetcare_lead_source` | aio_marketplace, provider_direct, preexisting_relationship, manual_assignment |
| `aio_fleetcare_provider_verification` | unverified, pending_review, aio_verified, suspended, expired_documents_required, rejected |
| `aio_fleetcare_fee_status` | pending, calculated, invoiced, paid, waived, disputed, refunded |
| `aio_fleetcare_relationship_review` | declared, pending_review, approved, rejected, disputed |

---

## Core tables

### Configuration

| Table | Purpose |
|-------|---------|
| `aio_fleetcare_network_settings` | Key/value JSON policy (fees, attribution windows, feature flags) |
| `aio_fleetcare_service_categories` | Service taxonomy; `enabled` gate per category |

### Fleet (client)

| Table | Key columns |
|-------|-------------|
| `aio_fleet_vehicles` | `organization_id`, unit_number, vin, year/make/model, vehicle_type, current_mileage |

### Providers

| Table | Key columns |
|-------|-------------|
| `aio_service_providers` | business_name, verification_status, provider_tier, mobile/shop flags, agreement_* |
| `aio_service_provider_locations` | address, lat/lng, is_primary |
| `aio_service_provider_users` | provider_id, user_id, role (owner/manager/technician) |
| `aio_service_provider_services` | provider_id, category_code, enabled |
| `aio_service_provider_service_areas` | radius, state, city, postal, metadata for future polygons |
| `aio_service_provider_credentials` | jurisdiction-aware credential records |
| `aio_service_provider_insurance` | coverage_type, expiration, document_id |

### Subscriptions

| Table | Scope |
|-------|-------|
| `aio_fleetcare_client_subscriptions` | organization_id, plan_code, per_vehicle_count |
| `aio_fleetcare_provider_subscriptions` | provider_id, plan_code, location_id |

### Pre-existing relationships

| Table | Key columns |
|-------|-------------|
| `aio_fleetcare_preexisting_relationships` | provider_id, client_organization_id, review_status, approved_by, dispute_status |

Unique on `(provider_id, client_organization_id)`.

### Tickets & workflow

| Table | Key columns |
|-------|-------------|
| `aio_fleetcare_tickets` | ticket_number (FC-######), client_organization_id, vehicle_id, status, provider_id, lead_source, aio_originated, customer_contact_released |
| `aio_fleetcare_ticket_events` | Audit trail per ticket (event_type, from/to status, actor) |
| `aio_fleetcare_ticket_matches` | Eligibility/match scores per provider |
| `aio_fleetcare_ticket_assignments` | Active assignment on acceptance |

Sequence: `aio_fleetcare_ticket_number_seq` → `aio_next_fleetcare_ticket_number()`

### Estimates & authorization

| Table | Key columns |
|-------|-------------|
| `aio_fleetcare_estimates` | version, subtotal/tax/total minor, is_change_order, parent_estimate_id |
| `aio_fleetcare_estimate_line_items` | line_type, quantity, unit_amount_minor |
| `aio_fleetcare_customer_authorizations` | decision, authorized_amount_minor, estimate_id |

### Jobs & records

| Table | Key columns |
|-------|-------------|
| `aio_fleetcare_service_jobs` | ticket_id (unique), scheduled/completed timestamps, final_amount_minor |
| `aio_fleetcare_repair_records` | vehicle_id, summary, mileage, document_ids[] |
| `aio_fleetcare_referral_transactions` | fee_rate, fee_amount_minor, fee_status, aio_originated |
| `aio_fleetcare_provider_reviews` | job_id (unique), rating 1-5, moderation_state |
| `aio_fleetcare_disputes` | dispute_type, status |

---

## RLS

### Helper function

```sql
aio_user_provider_ids() → setof uuid
-- Returns provider_ids for auth.uid() from aio_service_provider_users where status = 'active'
```

### Policy summary

| Resource | Client org member | Provider user | Internal staff |
|----------|-------------------|---------------|----------------|
| `aio_fleet_vehicles` | Full CRUD own org | — | Full |
| `aio_fleetcare_tickets` | Select/insert/update own org | Select/update assigned | Full |
| `aio_service_providers` | Read active (public profile) | Read own | Full CRUD |
| `aio_service_provider_users` | — | Read self | Full |
| `aio_fleetcare_referral_transactions` | Read own org | Read own provider | Full |
| `aio_fleetcare_service_categories` | Read enabled | Read enabled | Full |

**Job-scoped client data release** enforced in application layer via `customer_contact_released` and ticket status checks (see `referralService.clientContactMayBeReleased`).

All FleetCare tables have RLS enabled.

---

## Indexes

- `idx_aio_fleet_vehicles_org` on `aio_fleet_vehicles(organization_id)`
- Unique constraints: ticket_number, (ticket_id, provider_id) on matches, (provider_id, client_organization_id) on preexisting

Additional indexes recommended before production scale (not in MVP migration):

- `aio_fleetcare_tickets(status, client_organization_id)`
- `aio_fleetcare_tickets(provider_id, status)`
- `aio_service_provider_service_areas(state_code, postal_code)`

---

## Storage relationships

| Document type | Storage |
|---------------|---------|
| Provider credentials | `aio_service_provider_credentials.document_id` → `aio_documents` |
| Provider insurance | `aio_service_provider_insurance.document_id` → `aio_documents` |
| Repair job docs | `aio_fleetcare_repair_records.document_ids[]` → `aio_documents` |

Vault categories for FleetCare: repair invoice, estimate, diagnostic, inspection, warranty, photos.

---

## Audit behavior

Ticket events table captures state transitions. Reuse platform audit:

- `aio_activity_events` / `aio_audit_events` for cross-domain actions (future wiring)
- Demo: `fleetcareTicketEvents` in demo store

Events to audit: ticket created, matched, accepted, estimate submitted/approved, job completed, fee calculated, provider verified, insurance updated.

---

## Demo store fields (v24)

```typescript
fleetcareProviders, fleetcareProviderLocations, fleetcareProviderUsers
fleetcareTickets, fleetcareTicketEvents, fleetcareTicketMatches
fleetcareEstimates, fleetcareRepairRecords, fleetcareReferralTransactions
fleetcarePreexistingRelationships, fleetcareCounters, fleetcareDemoContext
```

---

## Future extensions

- `aio_fleetcare_provider_performance_metrics` — aggregated stats
- `aio_fleetcare_provider_suspensions` — compliance enforcement
- `aio_fleetcare_cancellation_policies` — configurable fees
- Geo polygon service areas (PostGIS)
- Marketplace payment ledger tables
- Provider team invitations / multi-location enterprise org tree
