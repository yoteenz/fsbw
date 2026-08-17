# FleetCare Product Architecture

**Product:** AIO FleetCare Network  
**Domain:** Maintenance & repair marketplace inside All In One Enterprises Inc.  
**Date:** 2026-08-17

---

## Product purpose

FleetCare connects **AIO trucking clients** with **independent maintenance and repair businesses**. AIO operates as a **technology marketplace and referral/service-coordination platform** — not as the repair provider.

AIO facilitates:

- Discovery and matching
- Ticket coordination and communication
- Recordkeeping and vehicle maintenance history
- Referral attribution and platform economics
- Provider portal and compliance tooling

Independent **network providers** perform repairs. Clients own vehicles and authorize work.

---

## Customer model

### Who is the customer?

- AIO client organizations (carriers, owner-operators, fleet operators)
- Scoped via existing `organization_id` / portal client context

### Client subscription tiers (configurable)

| Plan | Target pricing | Purpose |
|------|----------------|---------|
| **FleetCare Free** | $0 | Request service, matching, basic history |
| **FleetCare+** | $19/mo per company | Schedules, reminders, vault integration |
| **FleetCare Pro** | $39/mo + $5/vehicle | Fleet views, analytics, priority coordination |

**Important:** Client subscription pays for **maintenance-management technology** — not the repair itself. Repair is a separate provider transaction.

Configuration: `all-in-one-enterprises/src/fleetcare/fleetcareConfig.ts` → `FLEETCARE_PRICING_CONFIG.clientPlans`

---

## Provider model

### Who is the provider?

- Independent repair **businesses** (e.g. Smith Mobile Diesel LLC)
- Primary account = business entity, not individual gig worker
- Internal roles: owner, manager, technician, dispatcher (via `aio_service_provider_users`)

### Provider subscription tiers (configurable)

| Plan | Target pricing | Notes |
|------|----------------|-------|
| **Founding FleetCare Provider** | $0/mo + configurable referral fee | Launch period; no hardcoded expiration |
| **FleetCare Provider** | $49/mo per location + fee | Standard network access |
| **FleetCare Provider Pro** | $99/mo per location + fee | Multi-user, analytics, expanded territories |

Subscription pays for **portal and network access** — not guaranteed leads or income.

Configuration: `FLEETCARE_PRICING_CONFIG.providerPlans`

### Verification states

`unverified` → `pending_review` → `aio_verified` | `suspended` | `expired_documents_required` | `rejected`

**AIO Verified** = eligibility review completed — not workmanship guarantee or AIO employment.

---

## Ticket lifecycle

```
DRAFT → SUBMITTED → SEARCHING → (MATCHED) → PROVIDER REVIEWING
  → PROVIDER ACCEPTED | PROVIDER DECLINED
  → AWAITING ESTIMATE → ESTIMATE SENT
  → AWAITING CUSTOMER AUTHORIZATION → AUTHORIZED
  → SCHEDULED → IN SERVICE → COMPLETED → CUSTOMER CONFIRMED → CLOSED
```

Side states: `AWAITING PARTS`, `ON HOLD`, `CANCELLED`, `DISPUTED`

### Emergency / roadside language rules

| State | Client-facing copy |
|-------|-------------------|
| Before provider acceptance | **Searching for available FleetCare providers** |
| After acceptance | **Provider confirmed** |

Never show “help is on the way” before acceptance.

### Demo implementation

- `fleetcareActions.ts` — submit, match, accept, estimate, authorize, complete
- `matchingService.ts` — eligibility pool (works with one or many providers)

---

## Data-access model

### Privacy tiers

| Phase | Provider sees |
|-------|---------------|
| Pre-match / lead | Service type, vehicle type, approximate area, urgency, drivable status, limited issue detail |
| Post-acceptance / authorized | Job-scoped vehicle info, VIN if needed, mileage, location, authorized contact |
| Post-completion | Records for that job only — not full client vault |

### Job-scoped data room

Providers access only what the ticket/job authorizes. Completing a repair does **not** grant permanent vault access.

### Pre-existing customer relationships

Structured model when provider serviced client before AIO:

- `provider_id`, `client_organization_id`, declared dates, evidence notes
- `review_status`: declared → pending_review → approved | rejected | disputed
- Approved pre-existing → **no automatic AIO referral fee** on that relationship

---

## Matching model

**Foundation:** `matchingService.ts`

Criteria (extensible):

- Distance / service area
- Service category capability
- Provider active + verified status
- Insurance/credential eligibility (config hooks)
- Mobile vs shop requirement
- Vehicle type, urgency, emergency availability

**Rules:**

- No hardcoded “send to Provider ID 1” — normal eligibility for pool of N providers (N=1 today)
- Paid tier affects **features**, not silent “best match” labeling
- Future: organic vs sponsored placement distinction in `match_reason` JSON

---

## Estimate & authorization model

1. Provider submits structured estimate (labor, parts, fees, tax)
2. Client: **Approve** | **Decline** | **Request clarification**
3. Change orders: new finding → revision estimate → re-authorization required
4. Authorized amount and estimate version stored in `aio_fleetcare_customer_authorizations`

Demo: `submitEstimate`, `authorizeEstimate` in `fleetcareActions.ts`

---

## Repair history

Completed jobs create `aio_fleetcare_repair_records` linked to:

- `vehicle_id`
- `organization_id`
- `provider_id`
- `job_id`

Client portal: vehicle history page at `/portal/fleetcare/vehicles/:vehicleId/history`

Preventive maintenance fields prepared on vehicles (mileage intervals) — **no invented OEM schedules**.

---

## Document model

Repair documents integrate with **Digital Records Vault**:

- Record types: invoice, estimate, diagnostic, inspection, warranty, photos
- `document_ids` on repair records
- Job-scoped provider upload access
- Production: `aio_documents` with `related_entity_type = 'fleetcare_job'`

---

## Fee & referral model

### When fee applies

Only on **AIO-originated** work per attribution rules — not all provider customers globally.

### Configuration (not hardcoded in UI)

- `marketplaceFeeRate` — default 10%, centralized in `fleetcareConfig.ts`
- `leadAttributionWindowDays` — null until legal sets duration
- `feeEarnedPolicy` — e.g. `completed_confirmed_service`

### Referral transaction fields

`aio_fleetcare_referral_transactions`: ticket, job, provider, client, lead_source, aio_originated, preexisting_relationship, gross value, fee_rate, fee_amount, fee_status

Demo: `referralService.ts` → `calculateReferralFee`

### Payment architecture (Phase 1)

- Customer pays provider **directly**
- Provider records final amount
- AIO invoices provider separately for platform fee
- **No custodial wallet** in this sprint

---

## Subscriptions

Separate tracks:

- `aio_fleetcare_client_subscriptions` — org-scoped plans
- `aio_fleetcare_provider_subscriptions` — provider/location-scoped plans

Both use configurable `plan_code` referencing `FLEETCARE_PRICING_CONFIG`.

---

## Provider verification, insurance, credentials

- **Credentials:** jurisdiction-aware (`credential_type`, `jurisdiction`, expiration)
- **Insurance:** multiple coverage records; expiration hooks for eligibility
- **Compliance portal:** `/provider/fleetcare/compliance`
- **Requirement matrix:** architecture supports future policy config — not activated until legal approval

---

## Surfaces

| Surface | Path prefix | Purpose |
|---------|-------------|---------|
| Public landing | `/services/fleetcare` | Marketing, request CTA |
| Public plans | `/services/fleetcare/plans` | Client tiers |
| Provider join | `/fleetcare/providers/join` | Provider recruitment |
| Provider apply | `/fleetcare/providers/apply` | Application form |
| Client portal | `/portal/fleetcare/*` | Request, tickets, history |
| Provider portal | `/provider/fleetcare/*` | Leads, jobs, earnings |
| AIO Office | `/office/fleetcare/*` | Admin, compliance, referrals |

Navigation:

- Public: **Run My Operation** → Truck Maintenance & Repair
- Portal mobile: **OPS** section
- Office sidebar: FleetCare Network

---

## Legal positioning (implementation)

Reusable disclosures in `FleetCareDisclosures.tsx` + `FLEETCARE_LEGAL_DISCLOSURES`:

- Independent provider
- Referral economic disclosure
- Verified badge scope

Full legal gates: `docs/fleetcare/FLEETCARE_LEGAL_REVIEW_GATES.md`

---

## Demo mode

Demo store v24 includes:

- Smith Mobile Diesel LLC (verified founding provider)
- Sample tickets: routine, brake repair, roadside, estimate pending, completed
- Synthetic data only

Seed: `fleetcareSeed.ts`, actions: `fleetcareActions.ts`

---

## Future marketplace evolution

Prepared but not activated:

- Marketplace payment processor (customer pays platform)
- Nationwide multi-state compliance rules
- Real-time provider availability
- Sponsored placement with disclosure
- Enterprise multi-location provider admin
- Telematics-driven PM intervals
