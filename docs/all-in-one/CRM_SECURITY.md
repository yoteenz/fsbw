# All In One — CRM Security

---

## PII protection

Lead phone, email, business info, internal notes, quote pricing, and referral relationships are **staff-only** in demo mode (Office route guard).

Internal notes never appear on public quote view.

---

## Public endpoints

| Route | Scope |
|-------|-------|
| `/contact`, `/request-callback` | Create lead only — no enumeration |
| `/quote/:secureToken` | Single quote by opaque token |

Anonymous users cannot list leads or guess quote tokens (`qt_` prefix + UUID).

---

## Permissions (least privilege)

| Role | CRM access |
|------|------------|
| Owner / Admin / Manager | Full CRM including merge, convert, settings |
| Customer Support | Leads + activities + follow-ups |
| Billing | Read leads/opportunities + prepare quotes |
| Broker | Sales pipeline (shipper) |
| Dispatcher / Permitting | No CRM by default |

Enforced via `hasOfficePermission` on sensitive UI actions.

---

## Conversion

`crm.convert` required for customer creation. Idempotency prevents duplicate downstream records.

---

## Do Not Contact

`do_not_contact` status suppresses future outreach flags on consent fields. History retained.

---

## Financial boundaries

CRM displays quotes; billing owns invoices and payment. External/government fees labeled separately on public quote view.

---

## Exports

CRM export foundation — authorized staff only; exclude DNC/consent-restricted fields (future production).
