# All In One — Insurance Data Security

**Sprint:** 11 · **Last updated:** 2026-08-15

---

## Purpose

Security and privacy boundaries for **insurance domain data** in demo store v11 and future backend. Complements **`SECURITY_FOUNDATION.md`** and **`INSURANCE_REGULATORY_BOUNDARIES.md`**.

Sprint 11: **demo store only** — patterns define production requirements when AIO Supabase is activated.

---

## Data classification

| Classification | Insurance examples | Sprint 11 handling |
|----------------|-------------------|-------------------|
| **BUSINESS CONFIDENTIAL** | Policy records, coverage limits, fleet schedule on requests, partner handoff notes | Org-scoped in demo store; no cross-org reads |
| **IDENTIFIER — RESTRICTED DISPLAY** | Policy numbers | Masked for customers; full for coordinator/admin |
| **THIRD-PARTY FINANCIAL (NOT AIO)** | Reported premiums, down payments on quotes | Display only; never payment processor targets |
| **HIGHLY SENSITIVE** | SSN, full bank details, producer license credentials (future) | **Not collected** in Sprint 11 customer flows |

Future **`InsuranceCredential`** (staff license tracking) is **internal-only** — not customer-facing.

---

## Organization isolation

All insurance collections are keyed by **`organizationId`**:

- `insurancePolicies`, `insuranceRequests`, `insuranceCertificates`, `insuranceIssues`
- `insurancePolicyVehicles` duplicate `organizationId` for query safety
- Portal pages filter by `getOrganizationId(store)` / request `organizationId` match
- Office lists are staff-global in demo; **production RLS** must scope staff views by assignment or role policy

**Rules:**

- Never trust client-supplied `organizationId` without membership check (backend mode)
- Customer portal request detail rejects requests where `r.organizationId !== orgId`
- Quote selection requires matching org on request

Demo store does not enforce auth — treat as **UX preview only**.

---

## Policy number handling

| Role | Access | Implementation |
|------|--------|----------------|
| Customer | Last 4 digits only | `maskPolicyNumber()` → `•••• {last4}` |
| Coordinator / Admin | Full number | `canViewFullPolicyNumber(role)` → true |
| Support (future) | Policy-specific RLS | Read masked by default unless role grants full |

**Logging:** Do not log full policy numbers in client console, activity metadata, or notification bodies.

Policy numbers in seed data (e.g. `DMI-8844821`) are **fictional**.

---

## Driver & personnel data boundaries

Insurance requests may reference **power units** from fleet (`selectedPowerUnitIds`) — not individual driver PII beyond what fleet profile already stores.

| Data | Insurance module access |
|------|-------------------------|
| Power unit id, nickname, year/make/model | **Yes** — fleet schedule for coverage requests |
| VIN | Via fleet entity — follow Road Ready masking rules in summaries |
| Driver name, CDL, SSN | **Not** collected in insurance forms Sprint 11 |
| USDOT / MC | Prefilled from Road Ready profile — **unverified** until staff confirmation |

Workers' comp and occupational accident **coverage types** are category labels only — no payroll or employee roster in Sprint 11.

---

## Quote & premium data

- `premiumMinor`, `downPaymentMinor` stored as integer minor units (consistent with `billing/money.ts`)
- No card capture, ACH, or premium payment routes
- Quote records include **`source`** for audit — required attribution (see regulatory doc)
- Internal notes on requests (`internalNotes`) — staff-only visibility in production (`visibility: internal`)

---

## Certificate (COI) data

| Field | Sensitivity |
|-------|-------------|
| Certificate holder name/address/email | Business contact — org-scoped holder records |
| `documentId` (issued COI) | Vault blob — org-isolated storage paths in production |
| `instructions` | Customer request text — may include load/shipper names |

Customers see COI **status** only — cannot set `issued` or attach fraudulent issued docs as verified without staff workflow.

---

## Partner handoff data

`InsurancePartnerHandoff` may store:

- `externalReference` (manual referral id)
- `notes` (staff coordination)

**Not stored:** Partner portal credentials, carrier underwriting API keys, producer login tokens.

`manualInsurancePartnerAdapter.createReferral()` generates reference locally — no outbound PII transmission in demo.

---

## Vault integration

Policy `documentIds[]` and certificate `documentId` reference Vault documents:

- Category **`insurance`** in Vault taxonomy
- Verification workflow required before `document_supported` policy state
- Demo: data URLs in store — production: private bucket + signed URLs (see **`DOCUMENT_VAULT_SYSTEM.md`**)

---

## Road Ready sync data

`syncInsuranceToRoadReady()` writes to org profile:

- `carrierName`, `expirationDate`, `hasInsurance` flag
- Does **not** copy full policy number to Road Ready profile summary
- `verificationStatus` on item reflects policy `verificationState` mapping — not upgraded to `verified` without staff review rules

---

## Brokerage read-only insurance summary

`getBrokerageCarrierInsurance(orgId)` returns aggregated flags for carrier network UI:

- `hasPolicy`, `autoLiability`, `cargo`, `expirationDate`, `verificationState`, `reviewNeeded`
- **No** policy number exposed on brokerage carrier card
- Not a shipper COI substitute

---

## Production RLS (planned)

Future tables (see **`FUTURE_DATA_MODEL.md`**):

- Customer policies: `organization_id IN aio_user_org_ids()`
- Staff write on requests, quotes, activation: `aio_is_internal_user()` + role
- Partner directory: staff read; customer sees assigned partner on own request only
- Reported premiums: customer read on own quotes; write staff-only

---

## Demo mode caveats

1. No authentication — org switching via `portalClientId` only
2. All data in localStorage (`aio_debug_store`) — not encrypted beyond browser storage
3. Fictional carriers, partners, and premiums throughout
4. Reset Demo Data restores v11 seed — clears local insurance mutations

---

## Related docs

- **`SECURITY_FOUNDATION.md`** — auth, RLS, classification
- **`AUTHORIZATION_MATRIX.md`** — Insurance Specialist role
- **`INSURANCE_SYSTEM.md`** — entity reference
- **`PAYMENT_SECURITY.md`** — why premiums bypass payment provider
