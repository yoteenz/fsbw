# All In One — Authorization Matrix

**Status:** Sprint 10 brokerage permissions added. Enforced via Supabase RLS when backend mode is active.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✓ | Full access |
| R | Read only |
| — | No access |
| A | Assign / coordinate (not full admin) |

---

## Internal roles

| Domain | Super Admin | Administrator | Permitting | Compliance | Insurance | Dispatcher | Factoring | Brokerage | Support |
|--------|-------------|---------------|------------|------------|-----------|------------|-----------|-----------|---------|
| Clients (orgs) | ✓ | ✓ | R/A | R/A | R | R | R | R | R |
| Requests | ✓ | ✓ | A | A | A | A | A | A | R |
| Documents | ✓ | ✓ | A | A | A | A | A | A | R |
| Tasks | ✓ | ✓ | A | A | A | A | A | A | R |
| Messages | ✓ | ✓ | A | A | A | A | A | A | ✓ |
| Dispatch | ✓ | ✓ | — | — | — | ✓ | R | — | R |
| Factoring | ✓ | ✓ | — | — | — | R | ✓ | — | R |
| Brokerage | ✓ | ✓ | — | — | — | — | — | ✓ | R |
| Billing | ✓ | ✓ | R | R | R | R | R | R | — |
| Reports | ✓ | ✓ | R | R | R | R | R | R | R |
| **Road Ready verify** | ✓ | ✓ | A | A | A* | — | — | — | — |
| Staff | ✓ | A | — | — | — | — | — | — | — |
| Settings | ✓ | ✓ | — | — | — | — | — | — | — |
| Internal notes | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Customer roles

| Domain | Org Owner | Org Admin | Org Member | Shipper User |
|--------|-----------|-----------|------------|--------------|
| Own organization | ✓ | ✓ | R | ✓ |
| Own requests | ✓ | ✓ | R | ✓ (brokerage-focused) |
| Own documents | ✓ | ✓ | R | ✓ |
| Own roadmap | ✓ | ✓ | R | ✓ |
| **Road Ready profile** | ✓ | ✓ | R | — (shipper) |
| **Road Ready self-report** | ✓ | ✓ | ✓ | — |
| **Road Ready staff verify** | — | — | — | — |
| Portal messages | ✓ | ✓ | ✓ | ✓ |
| **Quotes (own org)** | ✓ accept/decline | ✓ | R | — |
| **Invoices / pay / receipts** | ✓ | ✓ | R | — |
| Office | — | — | — | — |
| Internal notes | — | — | — | — |
| Other organizations | — | — | — | — |

*Insurance Specialist may verify insurance-related Road Ready items only.

---

## Billing permissions (Sprint 07)

| Permission | Super Admin | Administrator | Permitting | Others |
|------------|-------------|---------------|------------|--------|
| `quotes.read` | ✓ | ✓ | ✓ | R where relevant |
| `quotes.create` / `quotes.manage` | ✓ | ✓ | A | — |
| `invoices.read` | ✓ | ✓ | R | R |
| `invoices.create` / `invoices.manage` | ✓ | ✓ | A | — |
| `pricing.read` | ✓ | ✓ | R | — |
| `pricing.manage` | ✓ | ✓ | — | — |
| `payments.read` | ✓ | ✓ | R | — |
| `credits.create` | ✓ | ✓ | — | — |
| `refunds.request` / `refunds.approve` | ✓ | A | — | — |
| `financial_reports.read` | ✓ | ✓ | R | — |

Customers may view/accept quotes and pay invoices for their organization only. Customers cannot edit amounts, apply credits, or mark invoices paid.

Internal pricing notes on quote versions are staff-only (`visibility: internal`).

---

## Factoring permissions (Sprint 09)

| Permission | Super Admin | Administrator | Factoring Specialist | Dispatcher | Support | Customer (org owner/admin) |
|------------|-------------|---------------|----------------------|------------|---------|----------------------------|
| `factoring.read` | ✓ | ✓ | ✓ | R | R | ✓ (own org) |
| `factoring.enrollment.manage` | ✓ | ✓ | ✓ | — | — | ✓ (application only) |
| `factoring.profiles.manage` | ✓ | ✓ | ✓ | — | — | — |
| `factoring.freight_invoices.create` | ✓ | ✓ | ✓ | — | — | ✓ (from ready load) |
| `factoring.submissions.create` | ✓ | ✓ | ✓ | — | — | — |
| `factoring.submissions.submit` | ✓ | ✓ | ✓ | — | — | — |
| `factoring.submissions.status` | ✓ | ✓ | ✓ | — | — | — |
| `factoring.funding.report` | ✓ | ✓ | ✓ | — | — | — |
| `factoring.issues.manage` | ✓ | ✓ | ✓ | — | — | R (action-required only) |
| `factoring.providers.manage` | ✓ | ✓ | R | — | — | — |
| `factoring.providers.read` | ✓ | ✓ | ✓ | R | R | R (assigned provider name) |

Rules:

- All factoring queries scoped by `organizationId`
- Reported funding fields (`reportedAdvanceMinor`, etc.) — staff write only
- Submission status transitions after `funded` — financial fields locked
- `direct_factoring_future` operations — **denied** while `directFactoringEnabled = false`

See **`FACTORING_SECURITY.md`**.

---

## Brokerage permissions (Sprint 10)

| Permission | Super Admin | Administrator | Brokerage Specialist | Dispatcher | Factoring | Support | Shipper | Carrier (portal) |
|------------|-------------|---------------|----------------------|------------|-----------|---------|---------|------------------|
| `brokerage.read` | ✓ | ✓ | ✓ | — | R | R | ✓ (own org) | ✓ (offers/loads) |
| `brokerage.capability.manage` | ✓ | ✓ | — | — | — | — | — | — |
| `brokerage.shippers.manage` | ✓ | ✓ | ✓ | — | — | R | — | — |
| `brokerage.requests.manage` | ✓ | ✓ | ✓ | — | — | — | ✓ (create own) | — |
| `brokerage.quotes.manage` | ✓ | ✓ | ✓ | — | — | — | ✓ (accept/decline own) | — |
| `brokerage.coverage.manage` | ✓ | ✓ | ✓ | — | — | — | — | — |
| `brokerage.offers.manage` | ✓ | ✓ | ✓ | — | — | — | — | ✓ (respond own) |
| `brokerage.financials.read` | ✓ | ✓ | ✓ | — | R | — | R (shipper charge only) | R (carrier pay only) |
| `brokerage.margin.read` | ✓ | ✓ | ✓ | — | — | — | — | — |
| `brokerage.shipper_invoices.manage` | ✓ | ✓ | ✓ | — | — | — | R (own) | — |
| `brokerage.carrier_payables.manage` | ✓ | ✓ | ✓ | — | R | — | — | R (own status) |
| `brokerage.carriers.manage` | ✓ | ✓ | ✓ | — | — | R | — | — |

Rules:

- All brokerage queries scoped by `organizationId` (shipper, carrier, or broker staff context)
- **`canViewGrossMargin()`** — broker finance/ops only
- Default **`brokerageCapability: demo`** — production `active` requires readiness checklist
- Dispatch role has **no write** on brokerage loads by default

See **`BROKERAGE_SECURITY.md`**.

---

1. **Supabase RLS** — primary enforcement (backend mode)
2. **Route guards** — UX layer; not sufficient alone
3. **Visibility column** — `internal` | `customer` | `system` on events, documents, messages
4. **Separate tables** — `aio_internal_notes` never exposed to customer policies

---

## Demo mode

Demo mode bypasses auth and uses local seed data. **Reset Demo Data** is available only when `VITE_AIO_DATA_MODE=demo`.
