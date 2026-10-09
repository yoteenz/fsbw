# P0 — REAL DOCUMENT EXTRACTION · RECOVERY1 — Wiring audit

Sprint: `P0.AIO.CLIENT-MIGRATION.REAL-DOCUMENT-EXTRACTION-CANONICAL-POPULATION-AND-E2E-RECOVERY1`  
Branch: `cursor/client-migration-real-extraction-1087`

## Executive summary

| Area | Status |
|------|--------|
| Demo migration UI (41 screens) | **WORKING ONLY IN DEMO MODE** — live store wiring; extraction was **MOCKED** (filename fixture) |
| Supabase intake + storage | **PARTIALLY WIRED** — uploads to `aio-migration-intake` bucket; pipeline API did not read bytes |
| Extraction provider | **BLOCKED → REPAIRED (local)** — `AIO_MIGRATION_EXTRACTION_PROVIDER=local` reads PDF text layer; **OCR for scans BLOCKED** |
| Canonical commit (demo) | **PARTIALLY WIRED → REPAIRED** — PREBUILT + office entitlements; facts now map to Road Ready |
| Canonical commit (Supabase) | **PARTIALLY WIRED** — `supabaseApproveMigration.ts` maps legal_name, USDOT; not full entity matrix |
| Client activation E2E (demo) | **WORKING IN DEMO MODE** — invite → review → ACTIVE (unit tests) |
| Full NORTHLINE production E2E | **BLOCKED** without `VITE_AIO_DATA_MODE=supabase` + service role + staff auth on preview |

## Component classification (evidence)

| Component | Classification | Evidence |
|-----------|----------------|----------|
| `MigrationStudioPage.tsx` | DEMO MODE UI | `useDemoStore()`; routes call services that branch on `isSupabaseMode()` |
| `fixtureAdapter.ts` | **MOCKED** | `proposedValue: Extracted from ${fileName}` — metadata only |
| `contentExtractionAdapter.ts` | **WORKING (PDF text)** | Parses bytes via pdf.js; values must appear in text (`contentExtraction.test.ts`) |
| `api/.../process-file.ts` (before) | **BROKEN / BLOCKED** | Default provider `none` → 503; fixture only with env flag; no storage download |
| `api/.../process-file.ts` (after) | **WORKING (local PDF)** | Downloads `storageReference`; `local` provider; no paid API |
| `migrationIntakeService.ts` (Supabase) | **PARTIALLY WIRED** | Upload + facts insert; now passes `storageReference` to pipeline |
| `migrationCommitService.ts` | **PARTIALLY WIRED → improved** | `applyCanonicalFactsFromMigration` for demo |
| `supabaseApproveMigration.ts` | **PARTIALLY WIRED** | Server-side PREBUILT; org + USDOT + provenance rows |
| `approveMigrationOfficeService.ts` | **PARTIALLY WIRED** | Demo vs `/api/.../approve-batch` |
| Image uploads (JPG/PNG) | **BLOCKED** | Returns `UNREADABLE_DOCUMENT` until OCR provider approved |
| RLS / tenant isolation | **UNKNOWN — NOT VERIFIED** in this sprint | `clientMigrationRlsIntegration.test.ts` exists; needs live creds |

## Demo vs production map

| Mode | Upload bytes | Extraction | Facts store | Canonical commit |
|------|--------------|------------|-------------|------------------|
| `VITE_AIO_DATA_MODE=demo` | IndexedDB/data URL vault + demo store | In-browser PDF text (`contentExtractionAdapter`) | `clientExtractedFacts` in `aio_debug_store` | `commitApprovedMigration` → Road Ready |
| `VITE_AIO_DATA_MODE=supabase` | Supabase Storage `aio-migration-intake` | `/api/aio/client-migration/process-file` + `local` | `aio_client_extracted_facts` | `/api/aio/client-migration/approve-batch` |

Set `VITE_AIO_MIGRATION_FIXTURE=1` to restore filename fixture (tests / legacy demos only).

## Environment

| Variable | Purpose |
|----------|---------|
| `AIO_MIGRATION_EXTRACTION_PROVIDER` | `local` (default) · `none` · `fixture` (non-prod + flag) |
| `AIO_ALLOW_MIGRATION_FIXTURE` | `1` allows fixture provider in non-production |
| `AIO_SUPABASE_SERVICE_ROLE_KEY` | Required for server download + approve |

## Forensic trace (demo upload → fact)

1. `MigrationStudioPage` → `uploadFilesToMigrationBatch` → `addFilesToMigrationBatch`
2. `storeVaultFile` persists bytes (demo: data URL / IndexedDB when quota fix merged)
3. `readFileAsBase64(file)` → `getMigrationPipelineAdapter()` → `contentExtractionAdapter`
4. `extractTextFromPdfBytes` → `extractFactsFromDocumentText`
5. `updateDemoStore` → `recordExtractedFacts` with `documentId` + `sourceReference`
6. Staff review → `applyReviewActionToFact` → `commitApprovedMigration` → `applyCanonicalFactsFromMigration`

## Remaining gaps (honest)

- Scanned PDFs / photos: **OCR BLOCKED** (no approved provider)
- Async job queue: processing still inline on upload (no durable worker)
- Full entity matrix on Supabase approve: partial
- Full 25-step browser E2E with second session: **not run** in CI this sprint
- Security regression: not expanded

## Founder review (demo)

1. Open `/office/migration` (demo mode, debug banner visible).
2. New client → upload PDF generated with visible text (e.g. LEGAL BUSINESS NAME: NORTHLINE HAULING LLC).
3. Review screen should show **NORTHLINE HAULING LLC**, not “Extracted from filename”.
4. Approve migration → inspect Road Ready / company name on client record.
5. For Supabase: set `VITE_AIO_DATA_MODE=supabase`, `AIO_MIGRATION_EXTRACTION_PROVIDER=local`, service role on API host, repeat upload.
