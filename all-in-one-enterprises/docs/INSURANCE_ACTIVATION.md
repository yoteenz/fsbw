# All In One — Insurance Activation

**Sprint:** 11 · **Last updated:** 2026-08-15

---

## Purpose

Checklist and gates for moving insurance from **`demo`** capability to production **`assistance`** / **`partner`** modes. Separates **software readiness** (features built) from **business readiness** (legal authorization, partners, disclosures).

**Critical rule:** Completing this software checklist does **not** authorize All In One to sell, solicit, or bind insurance. Attorney and licensing review required independently.

---

## Software readiness (Sprint 11 — COMPLETE)

| Item | Status | Evidence |
|------|--------|----------|
| Core module (`insurance/`) | ✅ | types, config, rules, calculations, partner adapter stub |
| Capability + operating mode state | ✅ | `insuranceCapability` in demo store v11 |
| Customer portal routes | ✅ | `/portal/insurance/*` |
| Office Command Center routes | ✅ | `/office/insurance/*` |
| Request status machine | ✅ | `canTransitionRequestStatus()` + unit tests |
| Partner manual referral | ✅ | `manualInsurancePartnerAdapter`, `recordPartnerReferral()` |
| Quote records with source attribution | ✅ | `InsuranceQuoteSource`, office UI disclosure |
| Policy intake + staff activation | ✅ | `addExistingPolicy()`, `activatePolicyFromEvidence()` |
| COI request workflow | ✅ | `requestCertificate()` — no customer issuance |
| Road Ready sync | ✅ | `syncInsuranceToRoadReady()` on migration + policy updates |
| Brokerage carrier insurance read | ✅ | `getBrokerageCarrierInsurance()` |
| Notifications (insurance category) | ✅ | event types in `notificationTypes.ts` |
| Demo seed scenarios A–I | ✅ | `insuranceSeed.ts` |
| Unit tests | ✅ | `insuranceCalculations.test.ts`, invariant tests |
| Documentation | ✅ | `INSURANCE_*.md`, updated canon docs |

Demo store version: **v11** (migration from v10). Reset restores full seed.

---

## Business readiness checklist

Stored in `insuranceCapability.readinessItems[]` — seeded from `INSURANCE_READINESS_CHECKLIST` in `insuranceConfig.ts`. Demo seed: all **`missing`** except **`direct_disabled`** → **`complete`**.

| Key | Label | Demo status | Production gate |
|-----|-------|-------------|-----------------|
| `operating_model` | Operating Model Selected | missing | Executive + counsel approve `assistance` / `referral` / `partner` — not `direct_future` unless licensed |
| `licensed_partner` | Licensed Partner Established | missing | Executed referral/coordination agreement with licensed agency(ies) |
| `staff_roles` | Staff Roles Defined | missing | Insurance Specialist staffing + **`AUTHORIZATION_MATRIX.md`** enforcement |
| `customer_disclosures` | Approved Customer Disclosures | missing | Attorney-approved `INSURANCE_DISCLOSURE` + portal/onboarding copy |
| `referral_language` | Approved Referral Language | missing | Referral emails/scripts — no producer misrepresentation |
| `partner_handoff` | Approved Partner Handoff | missing | SOP for manual referral + future API security review |
| `document_policies` | Insurance Document Policies | missing | Vault retention, COI storage, rejection reasons |
| `data_security` | Data Security | missing | RLS policies, policy number masking verified in backend |
| `privacy_review` | Privacy Review | missing | Privacy policy update for insurance data categories |
| `billing_model` | Billing Model (Service Fees Only) | missing | Confirm assistance fees on Sprint 07 invoices only — premiums excluded |
| `renewal_process` | Renewal Process | missing | Renewal Center + insurance request SOP |
| `coi_process` | COI Process | missing | Who may mark `issued`; partner vs staff; shipper/broker holder rules |
| `legal_review` | Legal / Regulatory Review | missing | State licensing analysis — **no legal conclusions in product docs** |
| `direct_disabled` | Direct Insurance Disabled | **complete** | `DIRECT_INSURANCE_ENABLED = false` enforced in code |

Office UI: `/office/insurance/readiness` displays checklist with note: *"Software readiness ≠ legal authorization to sell or bind insurance."*

---

## Capability progression

| From | To | Requirements |
|------|-----|--------------|
| `disabled` | `demo` | Development / internal preview (current default path) |
| `demo` | `assistance` | Software ✅ + business checklist substantially complete + counsel sign-off on assistance model |
| `assistance` | `partner` | Executed partner agreements + partner-reported quote SOP + staff training |
| any | `direct_disabled` | Remains blocked until **`DIRECT_INSURANCE_ENABLED`** explicitly enabled with licensing — **out of Sprint 11 scope** |

Operating mode (`operatingMode`) should align with capability — default **`assistance`**.

---

## Software vs business ready

| Dimension | Software ready (Sprint 11) | Business ready (production) |
|-----------|---------------------------|------------------------------|
| UI workflows | Built and demo-tested | Staff SOPs, training, escalation paths |
| Premium display | Shown with source + non-revenue disclaimer | Counsel-approved quote presentation |
| Policy verification | Staff `activatePolicyFromEvidence()` | Evidence standards documented; Vault verification required |
| COI | Request + status tracking | Issuance authority defined; fraud controls |
| Partner referral | Manual adapter + external reference | Live partner contracts + secure data exchange |
| Billing | Service fee path via Sprint 07 | Priced assistance SKUs; no premium invoicing |
| Data | Demo localStorage | AIO Supabase RLS + audit logging |
| Road Ready | Sync hook implemented | Staff verification policy aligned with insurance records |

---

## Backend activation dependencies

When `VITE_AIO_DATA_MODE=backend`:

1. Apply insurance migrations to dedicated AIO Supabase project (`hyycomvcaqxxvyrfupes` or successor AIO project — **not** Frontal Slayer)
2. RLS on all insurance tables per org membership
3. Staff mutations server-side or via RLS-protected RPC
4. Vault bucket for policy/COI documents
5. Notification delivery beyond in-app (optional)

Until then, **demo store v11** is source of truth for Sprint 11 review.

---

## Pre-launch verification

Before setting capability to `assistance` or `partner` in production:

- [ ] Counsel review complete — operating mode documented
- [ ] All readiness items `complete` or `not_applicable` with notes
- [ ] Customer cannot verify policy or issue COI (regression test on rules)
- [ ] Premium never appears on Sprint 07 checkout
- [ ] Quote source always populated on new quote records
- [ ] Policy numbers masked in customer portal
- [ ] `DIRECT_INSURANCE_ENABLED` remains `false`
- [ ] Demo label removed or replaced with production disclosure
- [ ] Insurance Specialist role enforced in backend auth

---

## What Sprint 11 intentionally defers

- Live partner API (`future_api` quote source only as placeholder)
- Automated underwriting or binding
- Premium payment collection
- Producer license credential management UI (`InsuranceCredential` type only)
- OCR on policy documents
- State-specific filing integrations
- Email/SMS notifications for insurance events (in-app only)

---

## Related docs

- **`INSURANCE_SYSTEM.md`** — feature reference
- **`INSURANCE_REGULATORY_BOUNDARIES.md`** — legal/product boundaries
- **`INSURANCE_DATA_SECURITY.md`** — data handling
- **`SPRINT_STATUS.md`** — Sprint 11 completion record
- **`BACKEND_SETUP.md`** — AIO Supabase activation
