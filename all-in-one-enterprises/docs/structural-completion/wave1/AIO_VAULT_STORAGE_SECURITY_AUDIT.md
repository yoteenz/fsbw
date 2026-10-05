# Vault / storage security audit

Canonical vault table: `aio_documents` (5 policies).

CI: `src/freight/freightStorageSecurity.test.ts` (live when service role present).

Checklist: auth required for private buckets, path scoping, no public listing of private objects, signed URL expiry enforced server-side.
