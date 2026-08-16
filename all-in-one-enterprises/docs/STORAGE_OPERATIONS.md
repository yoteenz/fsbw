# STORAGE OPERATIONS — All In One

## Buckets (private by default)

See `src/data/constants.ts` — `AIO_STORAGE_BUCKETS`:

- `aio-customer-documents`
- `aio-service-documents`
- `aio-dispatch-documents`
- `aio-factoring-documents`
- `aio-insurance-documents`
- `aio-internal-documents`
- `aio-generated-exports`
- `aio-temporary-uploads`

## Path ownership

Conceptual: `organizations/{id}/...`, `customers/{id}/...`, `services/{requestId}/...`

RLS/storage policies are authoritative — paths are not security by obscurity.

## Signed URLs

Short-lived; test valid, expired, wrong customer/org.

## File validation

Size, MIME, extension consistency — server validation where available.

## Malware scanning

**FILE MALWARE SCANNING — PENDING** until provider configured.

## Temporary uploads

Cleanup policy for failed/stale uploads — document in ops when storage live.

## Document versioning

Sprint 20 supersession architecture preserved — no silent history loss.
