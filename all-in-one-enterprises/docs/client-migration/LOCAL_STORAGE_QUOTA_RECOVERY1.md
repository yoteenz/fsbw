# AIO migration — localStorage quota recovery (RECOVERY1)

## Root cause

`aio_debug_store` persisted the **entire** demo store via `JSON.stringify`, including vault `documents[].storageReference` values stored as **data URLs** (base64-in-JSON). Each migration upload duplicated full file bytes inside localStorage. The seeded demo store is already large; a few PDFs exceed typical ~5MB browser quotas.

## Size breakdown (typical)

| Section | Role |
| --- | --- |
| `documents` | **Largest after migration uploads** — inline `data:` URLs |
| `commMessages`, `activity`, CRM arrays | Secondary growth |
| `clientExtractedFacts`, `archiveMigrationBatchFiles` | Metadata-scale (small vs blobs) |
| Seed domains (loads, brokerage, workflow) | Large baseline even before migration |

Measured in unit tests via `measureDemoStoreSectionSizes()` without logging document contents.

## Fix

1. **New uploads:** `storeVaultFile` writes bytes to **IndexedDB** (`aio_demo_vault_v1`); demo store keeps `demo-blob:{documentId}` refs only.
2. **Legacy sessions:** `bootstrapDemoBlobMigrationFromLocalStorage()` moves existing `data:` URLs into IndexedDB and re-saves compact metadata.
3. **Writes:** `writeStorage` catches `QuotaExceededError`; `saveDemoStore` retries compact payload; UI listens for `aio-demo-store-save-failed`.
4. **Export:** `exportDemoStoreBackup()` — metadata JSON without inline bytes (blobs remain in IndexedDB).
5. **Supabase mode:** Authoritative migration state is server-backed (RECOVERY3); demo store is not the production source of truth.

## RECOVERY3 integration

- Supabase upload path uses storage + `process-batch-file`; it does not embed file bytes in `aio_debug_store`.
- Demo migration path still updates demo store for batches/facts but document bytes live in IndexedDB.
