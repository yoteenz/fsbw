# All In One — Storage Architecture (Sprint 20)

## Buckets (private by default)

| Bucket | Contents |
|--------|----------|
| `aio-customer-documents` | Customer uploads |
| `aio-service-documents` | Service request files |
| `aio-dispatch-documents` | BOL, POD, rate cons |
| `aio-factoring-documents` | Restricted financial docs |
| `aio-insurance-documents` | COI, applications |
| `aio-internal-documents` | Staff-only |
| `aio-generated-exports` | Authorized exports |
| `aio-temporary-uploads` | Quarantine / pending validation |

## Path convention

```
organization/{organization_id}/service/{service_request_id}/{document_id}/v{n}.{ext}
```

Never: email/SSN in paths.

## Upload flow

1. `prepareUpload()` — validate actor, org, type, size, mime, classification
2. Client uploads to quarantine/temp bucket
3. `finalizeUpload()` — metadata transaction + move to canonical bucket
4. Orphan cleanup if metadata fails

## Download flow

`getAuthorizedDocumentDownload()`:
1. Authenticate session
2. Load document metadata
3. Verify org + classification + permission
4. Generate short-lived signed URL
5. Audit if required

## Adapters

- `DemoDocumentStorageProvider` — in-memory demo (`src/all-in-one/data/storage/documentStorageProvider.ts`)
- `SupabaseStorageProvider` — throws until dedicated project configured

## Demo mode

No real files; demo URLs use `demo://` scheme. Production readiness: **NOT CONFIGURED**.
