# All In One — Document Vault System

**Sprint:** 11 · **Last updated:** 2026-08-15

---

## Purpose

The **All In One Vault** is the customer’s secure business document hub. It extends Sprint 03–05 document metadata — it is **not** a parallel file-management system.

**Principle:** Uploading a file does **not** equal verification. Only staff-verified documents update Road Ready verified status per workflow rules.

---

## Routes

| Surface | Path |
|---------|------|
| Customer Vault | `/all-in-one/portal/vault` |
| Document detail | `/all-in-one/portal/vault/:documentId` |
| Office Document Center | `/all-in-one/office/documents` |

(Legacy `/debug/all-in-one/*` redirects to `/all-in-one/*`.)

---

## Code locations

| Module | Path |
|--------|------|
| Types & statuses | `src/all-in-one/vault/vaultTypes.ts` |
| Categories, file policy, rejection reasons | `src/all-in-one/vault/vaultConfig.ts` |
| Storage abstraction | `src/all-in-one/vault/vaultStorage.ts` |
| Demo actions (upload, verify, reject, supersede) | `src/all-in-one/demo/vaultActions.ts` |
| Seed data (clients A–E) | `src/all-in-one/demo/vaultSeed.ts` |
| Upload UI | `src/all-in-one/components/VaultUpload.tsx` |

---

## Categories

`business` · `authority` · `registration` · `tax_fuel` · `insurance` · `permits` · `fleet` · `dispatch` · `factoring` · `brokerage` · `billing`

---

## Document statuses

`requested` → `uploaded` → `under_review` → `verified` | `rejected` · derived `expired` · `archived`

Verification status: `unverified` · `pending_review` · `verified` · `rejected`

---

## Supersession / versioning

Lightweight model via:

- `supersedes_document_id` / `superseded_by_document_id`
- `isCurrent` — Road Ready uses the **current verified** record, not the most recently uploaded expired doc

Replacing a credential archives the old record; audit history is preserved.

---

## Storage architecture

| Mode | Behavior |
|------|----------|
| **Demo** (default) | Files stored as data URLs in `storageReference` on document metadata |
| **Backend** | `storeVaultFile` returns error until dedicated AIO Supabase bucket is configured — **never Frontal Slayer storage** |

### Production requirements (when backend activated)

- Organization-isolated paths
- Non-public bucket + signed/protected URLs
- MIME + extension validation (`vaultConfig` `FILE_POLICY`)
- Configurable size limits
- Audit logging
- Malware scanning at provider layer (documented; not built in Sprint 06)

---

## Verification workflow

1. Customer uploads → `uploaded` / `pending_review`
2. Office queue **Needs Review**
3. Staff **Verify** or **Reject** (reason + optional customer message)
4. On verify: Road Ready item linked via `roadReadyItemId` updates; deadline synced; renewal may be created
5. Customer receives in-app notification

---

## Road Ready relationship

- Road Ready items may reference `documentId`
- Upload from Vault can set `roadReadyItemId`
- Only **verified** documents drive verified Road Ready progress (Sprint 05 rule preserved)

---

## Service request relationship

Documents link via `serviceRequestId`. Staff `requestDocuments()` creates `requested` vault records attached to the request.

Renewals started from Renewal Center create service requests via existing `submitServiceRequest`.

---

## Factoring document references (Sprint 09)

Factoring does **not** duplicate files. Loads and freight invoices hold **Vault document id references**:

| Document | Load field | Freight invoice field |
|----------|------------|----------------------|
| Rate Confirmation | `rateConfirmationDocumentId` | `rateConfirmationDocumentId` |
| BOL | `bolDocumentId` | `bolDocumentId` |
| POD | `podDocumentId` | `podDocumentId` |

Category **`dispatch`** for load movement docs; category **`factoring`** available for factoring-specific uploads (application, NOA, etc.).

`FactoringSubmission.packageDocumentIds[]` snapshots ids at package creation for review checklist — resolves to Vault metadata in Office submission detail.

Readiness rules (`factoringRules.ts`) require POD + rate confirmation (or reviewed rate details) before submission. Missing docs may create `FactoringIssue` types `missing_pod`, `missing_rate_confirmation`, `document_quality`.

See **`FACTORING_SYSTEM.md`**.

---

## Insurance document references (Sprint 11)

Insurance does **not** duplicate Vault files. Policies and certificates hold **document id references**:

| Document | Entity field |
|----------|--------------|
| Policy declaration / dec page | `InsurancePolicy.documentIds[]` |
| Issued COI PDF | `InsuranceCertificate.documentId` |
| Quote/proposal (optional) | `InsuranceQuoteRecord.documentIds[]` |

Category **`insurance`** in Vault taxonomy. Upload supports `document_supported` verification state on policies — upload alone does not equal verified coverage.

Staff **`activatePolicyFromEvidence()`** requires evidence workflow (demo: button on pending policies in office).

Partner adapter lists required documents: Certificate of Insurance, Policy Document (`manualInsurancePartnerAdapter.getRequirements()`).

See **`INSURANCE_SYSTEM.md`**, **`INSURANCE_DATA_SECURITY.md`**.

---

| Role | Capabilities |
|------|----------------|
| Customer | View org documents; upload; cannot self-verify |
| Staff | Verify/reject per division role (future matrix); internal notes never customer-visible |
| Cross-org | Blocked in demo store by `organizationId` |

---

## Known limitations (Sprint 06)

- No OCR / automatic expiration extraction
- No production file bucket until AIO Supabase + storage configured
- Preview via data URL (demo) or signed URL (future)
- No custom antivirus

---

## Retention

Verified credentials, renewal history, and audit events are **not** hard-deleted in Sprint 06. Legal retention policy pending business review.
