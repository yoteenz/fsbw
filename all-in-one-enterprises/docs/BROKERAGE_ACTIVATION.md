# All In One — Brokerage Activation Readiness

**Sprint:** 10 · **Last updated:** 2026-08-15

---

## Purpose

Checklist of **operational and technical readiness** before changing `brokerageCapability` from `demo` to `prelaunch` or `active`. This document is **not legal advice** and does not conclude whether All In One may act as a licensed broker in any jurisdiction — founder and qualified counsel must make that determination separately.

Default today: **`demo`** — fictional companies, development rate confirmation template, no freight payment collection.

Office surface: `/all-in-one/office/brokerage/readiness` mirrors `BROKERAGE_READINESS_CHECKLIST` in `brokerageConfig.ts`.

---

## Readiness checklist

| Key | Item | Demo status | Before `active` |
|-----|------|-------------|-----------------|
| `broker_authority` | FMCSA broker authority (MC) active for operating entity | `missing` | Founder confirms authority status with counsel |
| `boc3` | BOC-3 process agent filing current | `missing` | Filed and verified |
| `bond_trust` | Surety bond or trust fund per FMCSA requirements | `missing` | Bond/trust in place; proof on file |
| `business_entity` | Operating entity matches customer-facing broker name | `missing` | Entity docs aligned with invoices/rate cons |
| `insurance` | Contingent cargo / general liability as applicable | `missing` | Certificates on file |
| `shipper_agreement` | Executed shipper contract template | `missing` | Attorney-approved template + e-sign or wet sign process |
| `carrier_agreement` | Executed carrier contract template | `missing` | Attorney-approved template |
| `rate_confirmation_template` | Production rate confirmation PDF/HTML | `pending` (dev template in demo) | Replace `RATE_CONFIRMATION_DEV_TEMPLATE` |
| `payment_accounting` | A/R, A/P, and margin recognition process | `missing` | GL mapping for BSI/AP; **no** commingling with service billing |
| `claims_procedures` | Cargo claim and dispute workflow | `missing` | Documented SOP + staff training |
| `fraud_procedures` | Payment instruction change control, double-brokering prevention | `missing` | See **`BROKERAGE_SECURITY.md`** |
| `privacy_security` | RLS, audit, data retention for brokerage entities | `missing` | Backend migrations applied to AIO Supabase |
| `legal_review` | Counsel review of brokerage product scope | `missing` | Written sign-off recorded internally |

Statuses per item: `missing` · `pending` · `complete` · `not_applicable`

---

## Technical readiness

| Area | Demo (Sprint 10) | Production gate |
|------|------------------|-----------------|
| Data store | Demo store v9 | Dedicated AIO Supabase + RLS |
| Auth | Optional demo portal | Supabase auth + org membership for shippers and carriers |
| Capability flag | `demo` default | Explicit `active` only after checklist |
| Payments | None for BSI/AP | Separate decision: shipper collections & carrier disbursements |
| Notifications | In-app only | Email/SMS policies approved |
| Documents | Vault references | Encrypted storage + retention policy |
| Rate confirmations | Dev template label | Production template from counsel |
| Monitoring | Debug banner | Error tracking, audit log review |

---

## Capability progression

```
disabled  →  demo  →  prelaunch  →  active
```

| Mode | Intended use |
|------|--------------|
| `disabled` | Code deployed but brokerage UI blocked |
| `demo` | **Current default** — sales, UX review, training |
| `prelaunch` | Limited pilot with named shippers/carriers under counsel guidance |
| `active` | General availability — all checklist items `complete` or `not_applicable` with sign-off |

Only **Super Admin / Administrator** should update capability in production (see **`AUTHORIZATION_MATRIX.md`**).

---

## Dispatch and factoring coordination

Before `active`, confirm operational boundaries are documented and staff-trained:

- [ ] Dispatch team knows **`sourceType: 'brokerage'`** loads do not generate dispatch fees automatically
- [ ] Factoring team knows **`BSI-*`** ≠ **`HF-*`** and carrier payables with `paymentDestinationProtected`
- [ ] Billing team knows brokerage margin ≠ Sprint 07 service invoice unless explicitly billed as a **service**

---

## Shipper / carrier portal readiness

| Portal | Route | Gate |
|--------|-------|------|
| Shipper | `/shipper/*` | Shipper org membership + active shipper profile |
| Carrier (brokerage) | `/portal/brokerage/*` | Carrier network profile linked to org |
| Office | `/office/brokerage/*` | Internal staff + Brokerage role |

Demo: shipper org `client-e` pre-seeded; carrier orgs `client-b`, `client-c`, etc. linked in network profiles.

---

## What Sprint 10 intentionally defers

- Live shipper payment collection on `BSI-*` invoices
- Live carrier disbursement / ACH
- FMCSA integration or automated authority verification
- Load board ingestion (`load_board_future`)
- Automated credit checks on shippers
- Production attorney-approved PDF generation

These are **not** blockers for remaining in `demo` mode.

---

## Activation procedure (recommended)

1. Complete checklist items in `/office/brokerage/readiness`
2. Founder + counsel confirm broker authority and agreements
3. Apply brokerage backend migrations to **AIO Supabase** (when available) — not Frontal Slayer project
4. Verify RLS policies for shipper, carrier, and staff roles
5. Run pilot under `prelaunch` with fictional or contracted pilot partners
6. Set `capability: 'active'` only after written internal sign-off
7. Remove or replace demo banners; ensure `DEMO_BROKERAGE_LABEL` not shown in production

---

## Related docs

- **`BROKERAGE_SYSTEM.md`** — feature scope
- **`BROKERAGE_SECURITY.md`** — fraud and visibility controls
- **`SPRINT_STATUS.md`** — sprint delivery status
- **`BACKEND_SETUP.md`** — AIO Supabase activation
