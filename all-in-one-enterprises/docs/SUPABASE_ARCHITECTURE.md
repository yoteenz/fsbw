# All In One — Supabase Architecture (Sprint 20)

**Status:** Foundation documented — dedicated project NOT provisioned in debug host

## Dedicated project requirement

All In One MUST use its own Supabase project for Auth, Database, and Storage.

**Forbidden:** Frontal Slayer project `hyycomvcaqxxvyrfupes`

## Environment contract

| Variable | Scope | Purpose |
|----------|-------|---------|
| `VITE_AIO_DATA_MODE` | Client | `demo` \| `local` \| `supabase` (legacy `backend` → `supabase`) |
| `VITE_AIO_SUPABASE_URL` | Client | Dedicated AIO URL only |
| `VITE_AIO_SUPABASE_ANON_KEY` | Client | Anon key |
| `AIO_SUPABASE_SERVICE_ROLE_KEY` | Server only | Elevated ops — never in browser |
| `AIO_SUPABASE_PROJECT_REF` | Migration tooling | Project identity guard |
| `VITE_AIO_STORAGE_MODE` | Client | `demo` \| `supabase` |
| `VITE_AIO_AUTH_MODE` | Client | `demo` \| `supabase` |
| `VITE_AIO_ENVIRONMENT` | Client | `debug` \| `staging` \| `production` |

Validation: if `supabase` mode and URL missing → fail safely, stay on demo. If URL matches FS project → reject.

## Clients

- `getAioSupabase()` — browser anon client (`src/all-in-one/data/supabase/client.ts`)
- Server user-scoped and service-role clients: server-only modules (extraction phase)
- Storage key namespace: `aio-auth-token` — not `baw_sb_*`

## Migrations

Directory: `all-in-one/supabase/migrations/` (8 files, Sprint 20 baseline)

Guard script: `all-in-one/scripts/verify-migration-environment.sh`

Apply via Supabase CLI to **dedicated project only**:
```bash
./all-in-one/scripts/verify-migration-environment.sh
supabase db push --project-ref <AIO_PROJECT_REF>
```

## RLS

Helper functions: `aio_is_internal_user()`, `aio_user_org_ids()`

Policies: org-scoped customer access; staff via internal flag; CRM/audit/financial restricted.

## Storage

Private buckets (defined, not provisioned):
- `aio-customer-documents`, `aio-service-documents`, `aio-factoring-documents`, etc.

Path pattern: `organization/{org_id}/service/{request_id}/{document_id}/v1.pdf`

## Local development

Without credentials: full UI via Demo Mode at `/all-in-one`.

With dedicated project: set env vars, `AIO_DATA_MODE=supabase`, run migrations, seed reference data only.
