# All In One Enterprises Inc. — Master Product Blueprint

**Company:** ALL IN ONE ENTERPRISES INC.  
**Positioning:** The business office behind the truck.  
**Status:** Sprint 04 — Production data foundation + auth (debug prototype; backend activation pending dedicated Supabase project).

---

## Sprint 04 — Identity & Persistence Architecture

### Data modes

| Mode | Config | Behavior |
|------|--------|----------|
| **Demo** | `VITE_AIO_DATA_MODE=demo` (default) | Local seed store, reset, demo office entry |
| **Backend** | `VITE_AIO_DATA_MODE=backend` + AIO Supabase credentials | Real auth, RLS, persistent data |

### Core identity model

```
User (auth.users + aio_profiles)
  ↓
Organization Membership (aio_organization_memberships)
  ↓
Organization (aio_organizations)
  ↓
Business data (requests, roadmap, documents, …)
```

Internal staff: `aio_internal_staff` row + role — separate from customer memberships.

### Repository layer

UI accesses data through `useAioRepositories()` — not localStorage directly.

Implementations: `Demo*Repository` | `Supabase*Repository`

### Auth routes

- `/all-in-one/login`, `/sign-up`, `/forgot-password`, `/reset-password`
- Portal protected in backend mode; demo portal entry in demo mode
- Office requires internal staff role in backend mode; demo office in demo mode

See: `SECURITY_FOUNDATION.md`, `AUTHORIZATION_MATRIX.md`, `BACKEND_SETUP.md`

---

## ALL IN ONE OFFICE (Sprint 03)

Internal operating system at `/all-in-one/office/*`:

- CRM (clients, Client 360)
- Service request operations + workflows
- Tasks, deadlines, documents, messages
- Division queues (permitting, insurance, dispatch, factoring, brokerage)
- Dispatch load ops + factoring handoff
- Team, reports, billing preview
- Shared demo store with customer portal

Entry: debug banner **Internal Office →** only (not public homepage).

Production: dedicated auth, Supabase, server-side RBAC — see `FUTURE_ROLE_MODEL.md`.

---

### Smart Intake architecture

- Single configurable engine at `src/all-in-one/intake/`
- Entry: `/all-in-one/get-started` with optional `?goal=` pre-selection
- Progressive disclosure: goal → journey → business → operating → assets → pain points → branch questions → contact
- Shipper branch bypasses carrier compliance questions
- No SSN, EIN, or sensitive identifiers collected

### Road Ready architecture (Sprint 05 — core product)

- **Persistent business-readiness profile** — not a signup wizard; continues after onboarding in monitoring mode
- Module: `src/all-in-one/road-ready/` (config, types, rules, scoring, priority)
- Customer routes: `/all-in-one/portal/onboarding`, `/portal/road-ready`, `/portal/fleet`
- Office routes: `/all-in-one/office/road-ready`, `/office/clients/:id/road-ready`
- Dual progress: **Setup Progress** vs **Verified Progress** (prevents false confidence)
- Status + verificationStatus + source on every item; staff verification audited
- Operate & Grow (dispatch, factoring, brokerage) excluded from compliance scoring
- Shipper accounts use shipper dashboard — not carrier Road Ready %
- Canon: `docs/all-in-one/ROAD_READY_SYSTEM.md`

### Roadmap recommendation architecture

- Mock engine at `src/all-in-one/roadmap/` — **not** a regulatory rules engine
- Language: Preliminary Roadmap, Recommended, Needs Review, May Be Needed
- Explainable items with acronym microcopy (IRP, IFTA, BOC-3, USDOT, MC)
- Separate compliance progress from optional business services (factoring, dispatch)

### Service marketplace + plan + request lifecycle

- Marketplace by division + service bundles
- Config-driven detail pages from `data/services.ts`
- My Service Plan (local, not shopping cart)
- Mock request submission → portal Active Requests → request detail with config-driven timeline
- Preliminary document checklists (upload coming in future sprint)

### Local demo persistence + future backend

- localStorage via repository abstractions (`IntakeRepository`, `RoadmapRepository`, `ServicePlanRepository`, `ServiceRequestRepository`)
- Future: swap `LocalDemo*` for `Supabase*` without rewriting UI

---

## Vision

All In One Enterprises Inc. is a transportation business-services company helping trucking entrepreneurs, owner-operators, carriers, fleets, and shippers manage administrative and operational services surrounding transportation.

The ecosystem spans compliance, formation, insurance assistance, dispatch support, **factoring**, brokerage, document management, and a future customer command center.

---

## Operational Lifecycle

```
START → Business Formation
LEGALIZE → Permitting, Authorities, Tags, Taxes & Compliance
PROTECT → Trucking Insurance
OPERATE → Dispatching
GET PAID → Factoring
GROW → Brokerage, Fleet Expansion, Additional Services
```

Factoring is a natural continuation of the carrier workflow — not a disconnected financial product.

---

## Service Divisions (six primary)

| Division | Customer focus | Sprint 01 |
|----------|----------------|-----------|
| Permitting & Compliance | Carriers — tags, IRP, IFTA, authority, renewals | Shell + homepage messaging |
| Business Formation | New trucking businesses — LLC, corp, EIN guidance | Shell |
| Trucking Insurance | Coverage inquiries — liability, cargo, physical damage | Shell (compliant language) |
| Dispatching | Carriers — load coordination, dispatch support | Sprint 08 ops + Sprint 09 factoring handoff |
| **Factoring** | Carriers — receivables assistance, partner submission | Sprint 09 module + portal/office |
| **Brokerage** | Shippers — freight quotes, coverage, shipper billing | Sprint 10 module + `/shipper` + `/office/brokerage` |
| **Brokerage** | Shippers — freight quotes, coverage, shipper billing | Sprint 10 module + `/shipper` + `/office/brokerage` |

**Language rules:** No legal guarantees. No unverified licensing claims. Factoring = solutions / review / subject to approval — All In One does not directly purchase receivables or advance funds until a real partner structure exists.

---

## FACTORING DIVISION (Sprint 09)

### Purpose

Help eligible carriers organize completed-load documentation, create **freight invoices**, and track **partner factoring submissions** — faster path to working capital through external providers.

All In One does **not** purchase receivables or advance funds in Sprint 09 (`directFactoringEnabled = false`).

### Target users

- Owner-operators and small carriers waiting on broker payment terms
- Growing fleets managing cash flow between loads
- Carriers with existing factors (assistance + document organization)

### Partner-first business model (implemented workflow, manual handoff)

```
Carrier → All In One Portal → Freight Invoice + Document Package
  → Factoring Specialist Review → External Factoring Provider (manual)
  → Provider-reported status/funding → Carrier visibility in portal
```

### Service modes

| Mode | Sprint 09 |
|------|-----------|
| `factoring_assistance` | Active |
| `partner_factoring` | Active (demo partner) |
| `direct_factoring_future` | Disabled |

### Relationships

| System | Relationship |
|--------|--------------|
| Dispatch | Completed load → handoff `ready` → freight invoice |
| Billing (Sprint 07) | **Separate** — service fees only; see `FREIGHT_RECEIVABLES_DOMAIN.md` |
| Brokerage | Distinct — brokerage serves shippers; factoring serves carriers |
| Vault | Rate con, BOL, POD referenced on load + freight invoice + submission package |

### Implemented workflow (Sprint 09)

1. Load complete + POD + rate rules → `factoringHandoffStatus: ready`
2. Freight invoice created (`HF-*`) from load
3. Specialist builds submission package → manual provider submit
4. Status lifecycle through `funded` with **reported** advance/reserve (staff entry)
5. Issues + notifications for carrier action

### Status model

Centralized in `factoringTypes.ts`: enrollment statuses, submission statuses (`draft` → `funded` → `closed`), issue types.

### Partner abstraction

- `factoringProviderAdapter.ts` — future API interface (Sprint 09 stub)
- `services/factoring/factoringProvider.ts` — legacy Sprint 01 interface

### Document requirements

Rate Confirmation, POD, BOL (optional), freight invoice, broker/debtor — Vault references, not duplicates.

### Roadmap distinction

**Factoring is optional / Operate & Grow** — does NOT reduce Road Ready compliance %.

### Compliance / security

See **`FACTORING_SECURITY.md`**. No bank accounts, routing numbers, or ACH in Sprint 09.

### Deferred (post Sprint 09)

Live partner API, webhooks, underwriting engine, UCC, direct funding ledger — see **`DIRECT_FACTORING_FUTURE.md`**.

### Canonical docs

- `FACTORING_SYSTEM.md`
- `FREIGHT_RECEIVABLES_DOMAIN.md`
- `FACTORING_SECURITY.md`
- `DIRECT_FACTORING_FUTURE.md`

---

## BROKERAGE DIVISION (Sprint 10)

### Purpose

Arrange freight between **shippers** and **carriers** — shipment requests, quotes, coverage, booking, and brokerage-side A/R and A/P tracking. Default capability **`demo`** — not licensed production brokerage until activation checklist complete.

**Dispatch ≠ Brokerage:** Dispatch serves enrolled carriers; brokerage serves shippers and network carriers on `sourceType: 'brokerage'` loads.

### Target users

- Manufacturers and distributors needing truckload coverage
- Shippers seeking managed freight quotes and status visibility
- Network carriers receiving offers via `/portal/brokerage` (distinct from dispatch enrollment)

### Workflow (demo)

```
Shipper → Shipment Request → Broker Quote → Accept → Canonical Load
  → Coverage / Carrier Offer → Rate Confirmation → Booked → POD
  → Shipper Invoice (BSI-*) / Carrier Payable
```

### Capability gate

`disabled` | `demo` | `prelaunch` | `active` — see **`BROKERAGE_ACTIVATION.md`**.

### Financial model

| Concept | Document |
|---------|----------|
| Shipper freight charge | `BrokerageFreightQuote` / `BSI-*` |
| Carrier pay | `CarrierOffer` / `CarrierPayable` |
| Gross margin | `BrokerageLoadFinancials` (office only) |
| Service fees | Sprint 07 `AIO-*` only when explicitly billed |

See **`BROKERAGE_FINANCIAL_DOMAIN.md`**.

### Relationships

| System | Relationship |
|--------|--------------|
| Dispatch | Shared `Load` entity — separate queues and revenue |
| Factoring | Carrier `HF-*` on completed haul; payable may have factoring assignment flag |
| Billing (Sprint 07) | **Separate** — no freight charges through service invoices |
| Vault | BOL, POD, rate con on brokerage loads |

### Routes

- Shipper: `/all-in-one/shipper/*`
- Carrier: `/all-in-one/portal/brokerage/*`
- Office: `/all-in-one/office/brokerage/*`

### Compliance / security

See **`BROKERAGE_SECURITY.md`**. No bank storage, dev rate con template, role-filtered financial visibility.

### Canonical docs

- `BROKERAGE_SYSTEM.md`
- `BROKERAGE_FINANCIAL_DOMAIN.md`
- `BROKERAGE_SECURITY.md`
- `BROKERAGE_ACTIVATION.md`

---

## FACTORING DIVISION (Sprint 01 — historical)

### Target users

- Owner-operators and small carriers waiting on broker payment terms
- Growing fleets managing cash flow between loads

### Partner-first business model

```
Carrier → All In One App → Submit Eligible Invoice → Factoring Partner
→ Underwriting / Verification / Funding → Status returned to All In One
```

All In One owns the customer-facing experience; a future qualified partner handles underlying financial transactions. No specific partner is hard-coded in Sprint 01.

### Relationships

| System | Relationship |
|--------|--------------|
| Dispatch | Delivered load → invoice → factoring eligibility |
| Invoices | FactoringSubmission associates with carrier invoice |
| Brokerage | Distinct — brokerage serves shippers; factoring serves carriers |
| Documents | Reuse rate con, BOL, POD, invoice from load record |

### Future eligibility workflow

1. Load completed, POD uploaded
2. Invoice generated
3. Invoice + debtor reviewed for eligibility
4. Broker/debtor credit concept (Approved · Review Required · Not Approved · Credit Limit Reached)
5. Submit for partner review
6. Funding per applicable agreement (not automatic)

### Future funding workflow

Statuses (centralized): `eligible`, `not_eligible`, `not_submitted`, `submitted`, `verification`, `additional_documents_required`, `approved`, `funding_processing`, `funded`, `rejected`, `closed`

### Partner abstraction

`src/all-in-one/services/factoring/factoringProvider.ts` — interfaces only. Future methods: `checkInvoiceEligibility`, `checkDebtorEligibility`, `submitInvoice`, `getSubmissionStatus`, `getFundingStatus`, `getFactoringHistory`.

### Future statements

Monthly/period statements — view/download placeholders in portal prototype.

### Document requirements

Rate Confirmation, Invoice, POD, Carrier Information, BOL, broker/debtor details — reuse from load when on file.

### Roadmap distinction

**Factoring is optional / available** — does NOT reduce Road Ready compliance %. Separate **Operate & Grow** pathway after startup steps (Dispatch · Factor · Scale).

### Compliance / security (future)

Financial data sensitivity — no bank accounts, routing numbers, SSNs, or ACH auth in Sprint 01 prototype.

### Deferred (not Sprint 01)

Underwriting, ACH, Plaid, vendor APIs, broker credit APIs, UCC, collections, reserves, KYC/KYB, real fee calculators, production agreements, ledger, accounting integration.

---

## Future conceptual entities (no production DB yet)

`FactoringAccount`, `FactoringInvoice`, `FactoringSubmission`, `FactoringDocument`, `FactoringDebtor`, `FactoringFunding`, `FactoringFee`, `FactoringStatement`, `FactoringProvider`

### Relationship model

```
Carrier → Load → Invoice → FactoringSubmission
  ├── Documents
  ├── DebtorReview
  ├── FundingStatus
  └── Statement
```

---

## Customer Types

- Trucking entrepreneurs (startup)
- Owner-operators
- Small and growing carriers / fleets
- Shippers (brokerage)

---

## Future Product Ecosystem

1. **Public website** — marketing, intent-based discovery, trust
2. **Roadmap system** — onboarding + compliance progress (factoring optional)
3. **Customer command center** — dashboard, factoring, documents, renewals
4. **Dispatch platform** — carrier load operations → payment/factoring options
5. **Factoring platform** — invoice review, partner submission, funding status
6. **Brokerage platform** — shipper quotes, coverage, shipper/carrier portals (Sprint 10 demo)
7. **Shipper portal** — `/shipper` — shipment status, quotes, BSI billing
8. **Internal employee system** — Office at `/office/*`
9. **Compliance / document system** — Vault, deadlines, renewals

---

## Architectural Boundaries (mandatory)

- **Isolated codebase:** `src/all-in-one/` — extraction-first
- **Debug route only:** `/debug/all-in-one/*` — not in Frontal Slayer nav
- **No shared Supabase customer data** with Frontal Slayer
- **Mock data layer** for all factoring UI in Sprint 01

---

## Phases Still to Build

| Phase | Scope |
|-------|--------|
| Sprint 01 ✅ | Website shell, factoring prototype, mock data, docs |
| Sprint 09 ✅ | Factoring module, freight invoices, submissions, office command center, demo v8 |
| Sprint 10 ✅ | Brokerage module, shipper portal, carrier offers, coverage, finance, demo v9 |
| Sprint 02+ | Service content, intake forms, lead capture |
| Future | Factoring partner integration, real eligibility engine |
| Future | Production auth, customer portal backend |
| Extraction | Standalone repo, domain, Supabase project |

---

## Canonical reads for future agents

1. This file — product vision + **Factoring Division**
2. `docs/all-in-one/DEBUG_ARCHITECTURE.md`
3. `docs/all-in-one/EXTRACTION_PLAN.md`
4. `docs/all-in-one/SPRINT_STATUS.md`
5. `src/all-in-one/config/appConfig.ts`
6. `src/all-in-one/data/mockFactoring.ts`
7. `src/all-in-one/services/factoring/`
