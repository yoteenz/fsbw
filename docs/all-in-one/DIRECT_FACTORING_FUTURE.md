# All In One — Direct Factoring (Future)

**Sprint:** 09 · **Last updated:** 2026-08-15

---

## Status

**Not implemented.** `directFactoringEnabled = false` in `factoringConfig.ts`.

Sprint 09 ships **factoring assistance** and **partner factoring** only — manual handoff to external providers, reported funding fields, no bank storage, no direct advances.

This document is a **checklist of remaining work** for a future direct-factoring model. It does **not** provide legal, regulatory, or tax conclusions. Engage qualified counsel and licensed partners before any direct funding product.

---

## Product gate

| Item | Sprint 09 |
|------|-----------|
| `FactoringServiceMode.direct_factoring_future` | Type exists; UI may reference label |
| `directFactoringEnabled` | `false` — hard disable |
| Direct advance to carrier | Not built |
| All In One as factor of record | Not built |
| Customer bank disbursement | Not built |

---

## Legal & regulatory (unimplemented)

- [ ] Entity structure for factoring / lending activity (factor, broker, agent, or partnership)
- [ ] State licensing requirements mapped to operating footprint
- [ ] Uniform Commercial Code (UCC) filing process and perfection workflow
- [ ] Debtor notification / verification of assignment (jurisdiction-specific)
- [ ] Truth-in-lending / disclosure requirements if applicable to product shape
- [ ] Collections and recourse policy documentation
- [ ] Customer agreements: factoring purchase, recourse, fees, termination
- [ ] Privacy policy updates for financial data collection
- [ ] Regulatory examination readiness (if applicable)

**No legal conclusions in this repo.** Checklist for planning only.

---

## Capital & treasury (unimplemented)

- [ ] Source of advance capital (balance sheet, credit facility, partner warehouse line)
- [ ] Reserve hold accounting model
- [ ] Chargeback / recourse reserve funding
- [ ] Concentration limits (debtor, carrier, industry)
- [ ] Daily funding caps and operational controls
- [ ] Reconciliation between funded submissions and bank outflows

---

## Banking & payments (unimplemented)

- [ ] FBO / segregated accounts for carrier remittances (structure TBD with counsel)
- [ ] ACH origination for advances and collections
- [ ] Wire capability and fraud controls
- [ ] Bank partner selection and compliance onboarding
- [ ] Remittance lockbox or virtual account per carrier/debtor
- [ ] No commingling with All In One **service fee** Stripe/billing accounts

Sprint 09 explicitly stores **no** bank account or routing numbers.

---

## Underwriting & credit (unimplemented)

- [ ] Carrier onboarding credit policy (KYC/KYB)
- [ ] Debtor creditworthiness workflow (not demo `DebtorAccount` only)
- [ ] Credit limits and exposure tracking per debtor
- [ ] Invoice eligibility rules engine (beyond load complete + docs)
- [ ] Fraud detection (duplicate invoice across factors, altered POD)
- [ ] Concentration and slow-pay monitoring

---

## Operations & UCC (unimplemented)

- [ ] UCC-1 filing generation and lifecycle
- [ ] Lien search before funding
- [ ] Amendment / continuation tracking
- [ ] Release on invoice paid or buyback
- [ ] Dispute and chargeback operations playbook

---

## Technology (unimplemented)

- [ ] Direct funding ledger (separate from Sprint 07 billing)
- [ ] Immutable funding transaction log
- [ ] `directFactoringEnabled` guardrails in API layer (not UI-only)
- [ ] Real-time bank balance / webhook reconciliation
- [ ] Partner API vs direct ledger dual-write prevention
- [ ] Production `FactoringProviderAdapter` for owned factor engine (if any)

Current adapter: `factoringProviderAdapter.ts` — interface stub for **external** partners only.

---

## Security & compliance tech (unimplemented)

- [ ] Field-level encryption for banking tokens
- [ ] MFA + dual control on funding approval
- [ ] SOC2 / financial audit trail export
- [ ] Penetration test on funding endpoints
- [ ] AML/sanctions screening integration (if required)

See **`FACTORING_SECURITY.md`** for Sprint 09 baseline and future requirements outline.

---

## Customer experience (unimplemented)

- [ ] Direct factor enrollment path distinct from assistance
- [ ] Real-time funding ETA (not staff-reported demo fields)
- [ ] Statements with legal required disclosures
- [ ] Buyback / recourse invoice handling in portal
- [ ] Debtor payment status visibility (without exposing other carriers)

---

## What Sprint 09 provides as foundation

| Deliverable | Enables future direct model |
|-------------|----------------------------|
| Canonical load + handoff | Eligibility input |
| Freight invoice entity | Receivable document |
| Submission lifecycle + status machine | Workflow shell |
| Duplicate submission protection | Funding safety pattern |
| Reported funding fields | Placeholder for real ledger sync |
| Org isolation + role matrix | Access control baseline |
| `direct_factoring_future` mode in types | Explicit product separation |

---

## Recommended sequence (technical, not legal)

1. Partner factoring with live API + webhooks (still external factor)
2. Dedicated factoring ledger tables + reconciliation
3. Banking integration with tokenized accounts only
4. Underwriting engine + UCC ops (with counsel)
5. Flip `directFactoringEnabled` only after independent compliance sign-off

---

## Related documentation

- **`FACTORING_SYSTEM.md`** — Sprint 09 implemented scope
- **`FACTORING_SECURITY.md`** — Data boundaries
- **`FREIGHT_RECEIVABLES_DOMAIN.md`** — Financial entity separation
