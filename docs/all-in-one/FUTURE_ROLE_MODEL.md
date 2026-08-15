# All In One — Future Role Model

**Status:** Sprint 04 foundation implemented in migrations + RLS. Demo mode uses mock staff ids.

---

## Production role implementation

- Customer roles stored in `aio_organization_memberships.role`
- Internal roles stored in `aio_internal_staff.role`
- RLS policies enforce tenant isolation and internal-only tables
- Route guards supplement UX — not authorization alone

---

## Internal roles

| Role | Responsibilities | Access boundary |
|------|------------------|-----------------|
| Owner / Super Admin | Full platform, billing, team | All tenants (future) |
| Administrator | Operations oversight, assignments | All clients, all divisions |
| Permitting Specialist | Tags, IRP, IFTA, authority, permits | Permitting requests + related clients |
| Compliance Specialist | Renewals, deadlines, filings | Compliance queue + deadlines |
| Insurance Specialist | Quote intake, partner coordination | Insurance division only |
| Dispatcher | Loads, carrier coordination | Dispatch + related clients |
| Factoring Specialist | Invoice package review, provider handoff, reported funding entry, issues | Factoring queue + assigned clients; read dispatch loads for handoff |
| Brokerage Specialist | Quotes, shipments, shipper accounts | Brokerage division only |
| Support | Messages, general assistance | Read-most, limited status updates |

---

## Customer roles

| Role | Access |
|------|--------|
| Owner Operator / Carrier / Fleet Customer | Own portal: roadmap, requests, documents, messages, dispatch/factoring views |
| Shipper Customer | Brokerage-focused portal path |

Customers never access Office routes or internal notes.

---

## Separation principles

1. **Customer/internal data split** — enforced in API layer
2. **Least privilege** — specialists see division queues + assigned clients
3. **No shared Frontal Slayer auth** — All In One will use dedicated identity when extracted
4. **Audit** — privileged actions logged

---

## Prototype behavior

Sprint 03 Office has no login. Debug entry via banner link `/all-in-one/office`. All staff actions use mock staff ids (e.g. `staff-2`).

Production will require session management, role claims, and row-level security per client.

---

## Factoring specialist role (Sprint 09)

Demo staff id **`staff-6`** owns factoring seed submissions.

| Capability | Factoring Specialist | Dispatcher | Support |
|------------|---------------------|------------|---------|
| View factoring command center | ✓ | R (handoff only) | R |
| Create/edit submissions | ✓ | — | — |
| Submit to provider (manual) | ✓ | — | — |
| Record reported funding | ✓ | — | — |
| Create/resolve issues | ✓ | — | — |
| Edit enrollment profile | ✓ | — | — |
| Manage provider directory | ✓ (read); Admin write | — | — |
| View freight invoices | ✓ | R on assigned loads | R |

Customers: view own profile, submissions, issues requiring action; create freight invoice from ready load; cannot change submission status or reported funding.
