# All In One — Authorization Matrix

**Status:** Sprint 04 foundation. Enforced via Supabase RLS when backend mode is active.

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
| Portal messages | ✓ | ✓ | ✓ | ✓ |
| Office | — | — | — | — |
| Internal notes | — | — | — | — |
| Other organizations | — | — | — | — |

---

## Enforcement layers

1. **Supabase RLS** — primary enforcement (backend mode)
2. **Route guards** — UX layer; not sufficient alone
3. **Visibility column** — `internal` | `customer` | `system` on events, documents, messages
4. **Separate tables** — `aio_internal_notes` never exposed to customer policies

---

## Demo mode

Demo mode bypasses auth and uses local seed data. **Reset Demo Data** is available only when `VITE_AIO_DATA_MODE=demo`.
