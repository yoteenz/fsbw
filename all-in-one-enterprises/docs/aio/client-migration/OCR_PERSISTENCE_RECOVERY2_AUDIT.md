# P0 RECOVERY2 — OCR, zero-entry intake, durable demo jobs

Sprint: `P0.AIO.CLIENT-MIGRATION.OCR-AUTOMATIC-DOCUMENT-INTELLIGENCE-SUPABASE-PERSISTENCE-AND-FULL-LIFECYCLE-E2E-RECOVERY2`  
Builds on: PR #59 / branch `cursor/client-migration-real-extraction-1087`

## Delivered in this increment

| Deliverable | Status |
|-------------|--------|
| RECOVERY1 PDF text path preserved | **PASS** |
| Self-hosted OCR (Tesseract.js) for images | **PASS** (browser + Node API) |
| Scanned PDF OCR | **PASS** in browser (pdf.js render + OCR); **BLOCKED** on API host without native `canvas` |
| Zero-manual-entry new client intake | **PASS** — provisional client + upload-first on `new` screen |
| Auto identity hints from extraction | **PASS** — `applyExtractedIdentityHints` + review field hydration |
| Durable demo processing queue | **PASS** — `migrationDemoFileProcessor` (refresh-safe persisted states) |
| Supabase MC canonical on approve | **PASS** — `supabaseApproveMigration.ts` |
| Full Supabase lifecycle E2E | **BLOCKED** — no staging creds in agent |
| Playwright 25-step journey | **NOT RUN** |

## OCR provider

- **Engine:** [Tesseract.js](https://tesseract.projectnaptha.com/) (English), **no paid third-party**
- **Cost:** $0 recurring (CPU on app server / browser)
- **Privacy:** Bytes stay on founder infrastructure (browser demo or Vercel API); not sent to external OCR SaaS

## Zero-entry rule

- **Before:** `createDraftClient()` required company name before upload.
- **After:** `createProvisionalIntakeClient()` + upload on **NEW CLIENT FILE** without identity fields.
- Optional identity fields remain for corrections only.

## Processing states (demo)

`queued` → `processing` → `ready` | `failed` with `queueState` / `processingError` on batch files.

## Founder demo steps

1. `/office/migration/new` — add PDF or photo **without** typing company name → continue.
2. Wait on **EXTRACTION** until stages complete (OCR may take ~10–30s on photos).
3. **BUSINESS IDENTITY REVIEW** should show extracted legal name / USDOT from documents.
4. Approve → Road Ready populated (RECOVERY1 canonical commit).

## Production gaps

- API scanned-PDF OCR until native `canvas` on Vercel or dedicated worker
- True background worker (Supabase Edge/cron) for long OCR batches
- Full multi-client batch E2E on Supabase
- RLS live regression
