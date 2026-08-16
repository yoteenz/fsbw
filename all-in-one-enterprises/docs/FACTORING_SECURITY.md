# All In One — Factoring Security

**Sprint:** 09 · **Last updated:** 2026-08-15

---

## Scope

Security rules for the **factoring assistance workflow** — enrollment, freight invoices, submissions, provider handoff, and reported funding fields. Complements **`SECURITY_FOUNDATION.md`**.

Sprint 09: **demo store only** for factoring mutations. Production RLS policies are planned, not yet applied to factoring tables.

---

## Sensitive data boundaries

### Collected in Sprint 09 (demo)

| Data | Classification | Handling |
|------|----------------|----------|
| Broker/debtor name on load & freight invoice | Business confidential | Org-scoped; customer + assigned staff |
| Submission amounts (`submittedAmountMinor`, reported fields) | Financial sensitive | Staff entry; customer read own org |
| Provider contact info (demo partners) | Internal reference | Office staff; fictional in demo |
| Package document ids | Business confidential | Vault references; org-scoped |
| Enrollment application answers | Business confidential | Profile fields; no SSN/bank |

### Not collected (mandatory)

| Data | Status |
|------|--------|
| Bank account numbers | **Not stored** |
| Routing numbers | **Not stored** |
| ACH authorization | **Not stored** |
| SSN / EIN (factoring application) | **Not stored** — use existing Road Ready boundaries |
| Plaid / open banking tokens | **Not stored** |
| Provider API secrets | **Not stored** — future server-side vault |

`directFactoringEnabled = false` — no direct funding implies no custodial money movement in Sprint 09.

---

## Protected fields

Fields requiring **staff role** to write in production:

| Entity | Field | Customer |
|--------|-------|----------|
| `FactoringSubmission` | `status` (post-submit transitions) | Read only |
| `FactoringSubmission` | `reportedAdvanceMinor`, `reportedReserveMinor`, `reportedFeeMinor` | Read only |
| `FactoringSubmission` | `approvedAmountMinor`, `externalReference` | Read only |
| `FactoringSubmission` | `assignedSpecialistStaffId` | Hidden |
| `FactoringIssue` | create/resolve (staff-initiated) | Read own; respond when `customerActionRequired` |
| `FactoringProfile` | `enrollmentStatus` (staff approval paths) | Limited self-service on application |
| `FactoringProvider` | all write | No access |

After `funded` or `closed`: **`canEditSubmissionFinancials()` returns false** — financial fields immutable in demo rules; enforce in production API.

---

## Remittance risks

Factoring involves **who gets paid when a broker pays**. Sprint 09 avoids remittance entirely by not collecting bank data or issuing payment instructions.

### Risk controls (current)

1. No ACH/wire fields in forms or store
2. No "remit to All In One" language on freight invoices
3. Reported funding labeled **provider-reported** — not platform-confirmed
4. Freight invoice print view shows carrier as biller (from org context), not All In One

### Future controls (when partner API exists)

- No commingling of carrier and platform funds without licensed arrangement
- Remittance address changes require staff approval + audit event
- Dual control on funding status overrides
- Clear disclosure that All In One is **not** the factor unless `direct_factoring_future` is legally enabled

---

## Duplicate funding prevention

| Control | Implementation |
|---------|----------------|
| One active submission per freight invoice | `findDuplicateSubmission()` |
| Active statuses | `draft` through `funded` block duplicates |
| Amount mismatch flag | `detectAmountMismatch()` → internal issue, staff review |
| Issue type `duplicate_invoice` | Manual escalation path |
| Funded lock | No status regression from `funded` except `closed` |

Production must enforce duplicate checks **server-side** on submission create — not UI-only.

---

## Organization isolation

Every factoring entity carries **`organizationId`**.

Rules:

- Portal queries: `organizationId === currentUserOrg`
- Office queries: staff role + optional assignment filter
- Never load submission by id without org membership check
- Cross-org document ids in `packageDocumentIds` must fail validation

RLS pattern (future):

```sql
organization_id IN (SELECT aio_user_org_ids())
-- OR aio_is_internal_user() for staff policies
```

---

## Audit

Demo store logs activity kinds including:

`FACTORING_ENROLLMENT_CREATED` · `FACTORING_SUBMISSION_CREATED` · `FACTORING_SUBMITTED` · `FACTORING_STATUS_CHANGED` · `FACTORING_FUNDING_REPORTED` · `FACTORING_ISSUE_CREATED` · `FACTORING_ISSUE_RESOLVED`

Production requirements:

- Actor (`actor_user_id` or `staff_id`)
- Entity type + id
- Before/after status on submission transitions
- **Do not** log full document file contents in metadata
- Separate internal notes from customer-visible timeline

Submission `timeline[]` uses `visibility: customer | internal` — filter server-side for portal API.

---

## Future webhooks & banking

When partner integrations ship:

| Integration | Security requirement |
|-------------|---------------------|
| Provider webhooks | HMAC signature verification, idempotency keys, IP allowlist |
| Funding status webhook | Map to submission status only — no automatic customer bank credit in All In One |
| Bank account linking (carrier) | PCI/GLBA scope review; tokenization via provider; never store raw account in Postgres |
| Document upload to partner | Signed URLs, time-limited; audit outbound payload hash |

Webhook endpoints: **dedicated AIO backend**, not Frontal Slayer Supabase Edge Functions.

---

## Direct factoring security requirements (future)

If `directFactoringEnabled` ever becomes true, additional controls required **before** flag flip:

- Legal/compliance review (see **`DIRECT_FACTORING_FUTURE.md`** — checklist only, no legal conclusions)
- Licensed entity separation or partnership structure documented
- KYC/KYB on carriers and debtors
- UCC filing workflow and audit
- Segregated accounts / trust accounting
- SOC2-aligned access controls on funding operations
- Penetration test on funding API surface

Until then: **`directFactoringEnabled = false`** is a hard product gate, not a feature flag for beta.

---

## Demo mode caveats

- No authentication — org isolation is simulated via `portalClientId`
- Staff actions use mock `staff-6` without session
- Reported funding is fictional — must not be used for financial decisions
- Reset Demo Data clears all factoring state

---

## Related documentation

- **`SECURITY_FOUNDATION.md`** — Auth, RLS, classification baseline
- **`AUTHORIZATION_MATRIX.md`** — Role permissions
- **`FINANCIAL_BOUNDARIES.md`** — Billing vs receivables
- **`DIRECT_FACTORING_FUTURE.md`** — Unimplemented direct model
