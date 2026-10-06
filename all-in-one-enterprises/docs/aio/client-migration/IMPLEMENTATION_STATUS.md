# Client migration — implementation status (runtime source of truth)

Architecture canon remains in `docs/aio/client-migration/README.md` and SITE00 PR #1409 exports.

## Generated Experience Brain JSON

**Status:** `GENERATED_ARTIFACT_REGEN_BLOCKED_BY_TOOLING`

The export script referenced in README (`npx tsx scripts/studioos/aio-client-migration-export.ts`) is not present in this repository. Runtime behavior is governed by:

- Supabase migrations under `all-in-one-enterprises/supabase/migrations/`
- Module `all-in-one-enterprises/src/client-migration/`
- API routes under `api/aio/client-migration/`

Do not hand-edit generated JSON artifacts; add the export script in a dedicated tooling sprint.

## Staff pilot path (Supabase mode)

| Capability | Status |
|------------|--------|
| Batch create + upload + private storage | Implemented |
| File queue + stage columns | Implemented |
| Server-side process-file | Implemented (provider required in production) |
| Approve migration (service API) | Implemented |
| Provenance + Vault promotion | Implemented (server commit) |
| PREBUILT lifecycle | Implemented |

## Client activation (Supabase mode)

| Capability | Status |
|------------|--------|
| Review sessions persistence | Implemented |
| Reported changes | Implemented |
| Confirm → ACTIVE | Implemented (org lifecycle + workspace entitlements) |
