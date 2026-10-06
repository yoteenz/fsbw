# Supabase link scoped PAT permission diagnostic

**Sprint:** P0.AIO.SUPABASE-CI-LINK-PERMISSION-DIAGNOSTIC1

## Current blocker (post pooler fix)

- Pooler precheck: **PASS** (DNS/TCP/session :5432)
- `supabase link`: **FAIL** — `AIO_SUPABASE_PROJECT_LINK_FAILURE` / scoped PAT authorization

## CI behavior

1. Normal `supabase link` (no `--debug`) runs first; output captured to temp files (not streamed raw).
2. On failure, second attempt with `--debug`; combined output sanitized.
3. Parser extracts `missing_permissions`, HTTP status, Management API route from CLI/API JSON.
4. Optional read-only probe: `GET /v1/projects/{ref}` with existing token (no mutation).
5. Artifact **`aio-supabase-link-diagnostic`**: `sanitized-link-debug.log`, `aio-link-permission-diagnostic.json`.

## Human action

After a live run, open the artifact JSON. Add **exact** machine permissions to the scoped PAT in Supabase dashboard — do **not** rotate until the diagnostic lists them.

## Scripts

- `scripts/ci/aio-supabase-link-ci.sh`
- `scripts/ci/aio-link-permission-diagnostic.mjs`
- `scripts/ci/aio-link-permission-parser.mjs`
- `scripts/ci/aio-link-debug-redaction.mjs`
