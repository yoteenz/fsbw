# All In One — Data Classification

**Sprint 19** · Canonical model in `src/all-in-one/security/dataClassification.ts`

---

## Levels

| Level | Summary |
|-------|---------|
| **PUBLIC** | Marketing, public service descriptions, legitimately public regulatory sources |
| **INTERNAL** | Staff workflows, templates, internal notes — not customer-visible by default |
| **CONFIDENTIAL** | Customer PII, business records, invoices, dispatch, communications, uploads |
| **RESTRICTED** | Tax/bank identifiers, integration secrets, auth secrets, highly sensitive ID docs |

---

## Handling rules

Each level defines: who may view/edit, export permission, logging, external sharing, retention, audit, and masking requirements. See `CLASSIFICATION_HANDLING` in code.

---

## Field-level foundation

Examples (extend in Sprint 20 schema):

- `customer.email` → CONFIDENTIAL  
- `invoice.amount` → CONFIDENTIAL  
- `integration.api_secret` → RESTRICTED  
- `business.usdot` → CONFIDENTIAL (public source; relationship context is not public)

---

## Data minimization (Sprint 19 review)

**Not collected in current flows:** SSN, full bank credentials, CVV, EIN storage (Road Ready uses yes/no only), unnecessary identity documents.

Collect sensitive fields only when a defined business process requires them.
