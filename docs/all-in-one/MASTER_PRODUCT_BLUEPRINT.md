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
| Dispatching | Carriers — load coordination, dispatch support | Preview UI + load→factoring link |
| **Factoring** | Carriers — invoice funding options, cash flow | Public page + portal prototype (mock) |
| Brokerage | Shippers — freight quotes, tracking | Preview UI only |

**Language rules:** No legal guarantees. No unverified licensing claims. Factoring = solutions / review / subject to approval — All In One does not directly purchase receivables or advance funds until a real partner structure exists.

---

## FACTORING DIVISION

### Purpose

Help eligible carriers turn approved freight invoices into faster access to working capital through a future **embedded factoring partner model**.

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
6. **Brokerage platform** — shipper quotes and freight movement
7. **Shipper portal** — shipment status, BOL/POD/invoice
8. **Internal employee system** — future ops/admin
9. **Compliance / document system** — deadlines, filings, storage

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
