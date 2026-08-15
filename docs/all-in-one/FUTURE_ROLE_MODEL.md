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
| Factoring Specialist | Invoice review, partner handoff | Factoring cases only |
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
