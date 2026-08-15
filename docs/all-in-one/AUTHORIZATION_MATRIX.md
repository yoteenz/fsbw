# All In One — Authorization Matrix

**Status:** Sprint 07 billing permissions added. Enforced via Supabase RLS when backend mode is active.

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

1. **Supabase RLS** — primary enforcement (backend mode)
2. **Route guards** — UX layer; not sufficient alone
3. **Visibility column** — `internal` | `customer` | `system` on events, documents, messages
4. **Separate tables** — `aio_internal_notes` never exposed to customer policies

---

## Demo mode

Demo mode bypasses auth and uses local seed data. **Reset Demo Data** is available only when `VITE_AIO_DATA_MODE=demo`.
