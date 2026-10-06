# Cloud agent — validation blocker package (PR #42)

Configure these in **Cursor Cloud Agent environment secrets** (or run GitHub **AIO Supabase Production Validate** with `aio-production` env). **Names only — never paste values into the repo.**

| Env name | Required for | Where to configure | Secret |
|----------|--------------|--------------------|--------|
| `VITE_AIO_SUPABASE_URL` | Staff E2E, client Supabase mode | Cloud agent + Vercel | No (URL) |
| `VITE_AIO_SUPABASE_ANON_KEY` | Client Supabase auth/RLS anon checks | Cloud agent + Vercel | Yes (publishable) |
| `VITE_AIO_DATA_MODE` | Live migration path (`supabase`) | Cloud agent | No |
| `VITE_AIO_AUTH_MODE` | Staff/client sign-in | Cloud agent | No |
| `AIO_SUPABASE_SERVICE_ROLE_KEY` | Approve migration API, server writes | Cloud agent + Vercel server | **Yes** |
| `AIO_RLS_TEST_STAFF_EMAIL` | Live RLS (staff) | Cloud agent or CI | Yes |
| `AIO_RLS_TEST_STAFF_PASSWORD` | Live RLS (staff) | Cloud agent or CI | **Yes** |
| `AIO_RLS_TEST_CUSTOMER_A_EMAIL` | Cross-tenant RLS | Cloud agent or CI | Yes |
| `AIO_RLS_TEST_CUSTOMER_A_PASSWORD` | Cross-tenant RLS | Cloud agent or CI | **Yes** |
| `AIO_RLS_TEST_CUSTOMER_B_EMAIL` | Cross-tenant RLS | Cloud agent or CI | Yes |
| `AIO_RLS_TEST_CUSTOMER_B_PASSWORD` | Cross-tenant RLS | Cloud agent or CI | **Yes** |
| `RESEND_API_KEY` | Activation invite live test | Vercel / CI | **Yes** |
| `AIO_MIGRATION_EXTRACTION_PROVIDER` | Automated extraction only (optional for staff pilot) | Vercel server | No (slug) |

**Optional (full CI parity):** remaining `AIO_RLS_TEST_*` from workflow file; `SUPABASE_ACCESS_TOKEN` for migration workflow only.

After secrets are present, rerun:

1. Live staff E2E (batch → upload → manual facts if no provider → approve → PREBUILT)
2. `clientMigrationRlsIntegration.test.ts` + `wave1TenantIsolation.live.test.ts`
3. Activation invite + client review + responsive QA (393 / 834 / 1440)
4. `workflow_dispatch`: **AIO Supabase Production Validate** (post-merge or branch policy)

**Code status:** green. **Environment status:** blocked until rows above are configured.
