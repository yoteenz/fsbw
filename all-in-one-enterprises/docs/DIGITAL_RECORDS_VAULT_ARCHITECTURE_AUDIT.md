# Digital Records Vault — Architecture Audit (Phase 0)

**Sprint:** Digital Records Vault + Legacy Archive Migration Foundation  
**Date:** 2026-08-17  
**Scope:** `all-in-one-enterprises/` only — not Frontal Slayer / FS Supabase (`hyycomvcaqxxvyrfupes`)

---

## Executive summary

AIO already ships a **demo-complete Document Vault** (Sprint 11): portal vault, office document review, verify/reject, supersession, renewals, Road Ready hooks. This sprint **extends** that foundation with structured metadata, archive migration workflow, employee Document Vault UI, and SQL aligned to `VaultDocument` — not a parallel file uploader.

**Production gap:** dedicated AIO Supabase is documented but not provisioned; UI runs on `demoStore` + data URLs. Migrations live under `all-in-one-enterprises/supabase/migrations/` and apply only to the **dedicated AIO project** when activated.

---

## 1. Client / organization model

| Layer | ID pattern | Location |
|-------|------------|----------|
| Demo client | `client-a` … `client-g` | `src/demo/demoTypes.ts` → `Client` |
| Org scope | `organizationId` on vault docs (demo: `clientId === organizationId`) | `vaultTypes.ts`, `vaultActions.ts` |
| Supabase org | `aio_organizations.id` (uuid) | `20260815100000_aio_identity_foundation.sql` |
| Customer link | `aio_customers`, `aio_customer_organizations` | `20260815120000_aio_identity_roles_contacts.sql` |

**Reuse:** `ClientDetailPage` Client 360, `getClient360View`, `portalClientId` for portal scope.

---

## 2. Auth & roles

| Concern | Implementation |
|---------|----------------|
| Customer auth | `AIOAuthProvider`, `authService.ts` (signup creates org + membership) |
| Office access | `RouteGuards`, `officeContext.ts`, `OfficeStaffRole` permissions |
| Postgres roles | `aio_membership_role`, `aio_internal_role` enums + RLS helpers |
| Document RLS (SQL) | Select: customer visible + internal; **write: internal only today** — sprint adds customer insert + staff review policies in new migration |

---

## 3. Existing Supabase tables (document-related)

| Table | Status |
|-------|--------|
| `aio_documents` | Minimal columns — **extended in** `20260817180000_aio_digital_records_vault.sql` |
| `aio_document_versions` | Exists — version chain |
| `aio_document_sharing_events` | Sharing audit |
| `aio_audit_events` | Security audit (append-only) |
| `aio_activity_events` | Operational activity |
| `aio_road_ready_*` | Road Ready persistence (not wired to demo UI) |

Storage buckets: **documented** in `STORAGE_ARCHITECTURE.md`, **not** in SQL migrations yet.

---

## 4. Existing application modules (reuse)

| Module | Path |
|--------|------|
| Types | `src/vault/vaultTypes.ts` (+ `vaultRecordTypes.ts`, `vaultTaxonomy.ts`) |
| Config | `src/vault/vaultConfig.ts` |
| Demo actions | `src/demo/vaultActions.ts` |
| Archive migration | `src/demo/archiveMigrationActions.ts` (new) |
| Repository | `src/repositories/documentRepository.ts` (new) |
| Storage provider | `src/data/storage/documentStorageProvider.ts` (Supabase stub) |
| Upload UI | `src/components/VaultUpload.tsx`, `SecureDocumentUploader.tsx` |
| Portal | `src/pages/portal/VaultPage.tsx`, `VaultDocumentPage.tsx` |
| Office review | `src/office/pages/OperationsPages.tsx` → `DocumentsPage` |
| Office vault | `src/office/pages/DocumentVaultPages.tsx` (new) |

---

## 5. Routes (after this sprint)

| Surface | Path |
|---------|------|
| Client vault | `/portal/vault`, `/portal/vault/:documentId` |
| Client documents hub | `/portal/documents` |
| Office Document Vault | `/office/documents/vault` |
| Office client vault | `/office/clients/:clientId/documents` |
| Archive Migration | `/office/archive-migration` |
| Digitize workflow | `/office/archive-migration/digitize` |
| Batch review | `/office/archive-migration/batches/:batchId` |
| Legacy review queue | `/office/documents` (unchanged) |

---

## 6. Intentional deviations

1. **Category IDs** — Legacy Sprint 11 categories (`business`, `authority`, …) retained; taxonomy adds labels, subcategories, and new categories (`legacy`, `poa_authorization`, etc.) without breaking seed data.
2. **OCR/AI** — `suggestedMetadata` JSON hook only; no fake extraction UI.
3. **Supabase apply** — Migration file committed; apply when dedicated AIO project is provisioned (not FS production).
4. **Page separation** — `ArchiveMigrationBatchFile.pageCount` + batch file model prepared; PDF splitting not implemented.

---

## 7. Remaining future work

- Provision dedicated AIO Supabase + private buckets + storage RLS
- Implement `SupabaseDocumentStorageProvider`
- Wire repository to Supabase adapter (replace demoStore in backend mode)
- Customer document INSERT RLS + signed URL downloads
- OCR / AI classification pipeline feeding `suggestedMetadata`
- PDF page grouping / multi-document batch splitting
- Road Ready SQL table sync with demo items
- Malware scanning at storage layer
