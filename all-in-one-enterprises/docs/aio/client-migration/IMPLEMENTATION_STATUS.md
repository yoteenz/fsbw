# Client migration — implementation status (runtime source of truth)

Architecture canon remains in `docs/aio/client-migration/README.md` and SITE00 PR #1409 exports.

---

## CODE STATUS

Implementation on branch `cursor/client-migration-activation-88a7` (PR #42) is **complete for the scoped architecture**. Not configured ≠ not implemented.

| Area | Status | Notes |
|------|--------|--------|
| Supabase schema (AIO `nnnljnhtmseagotvgxxt`) | **Applied** | `aio_client_migration_*`, intake storage, approve/queue migrations |
| Private intake bucket `aio-migration-intake` | **Implemented** | `public = false` in production |
| Batch create, upload, file queue UI | **Implemented** | `migrationIntakeService`, `MigrationFileQueuePanel` |
| `/api/aio/client-migration/process-file` | **Implemented** | Returns `PROVIDER_UNAVAILABLE` (503) when no provider configured |
| `/api/aio/client-migration/approve-batch` | **Implemented** | Staff JWT + `aio_internal_staff`; service-role commit |
| Provenance, Vault promotion, PREBUILT | **Implemented** | `supabaseApproveMigration.ts` |
| Portal lifecycle guard + route matrix | **Implemented** | Unit tests pass |
| Client activation review + confirm (Supabase repos) | **Implemented** | `supabaseClientActivationRepository` |
| Activation invite API (email) | **Implemented** | `send-activation-invite.ts` → Resend when configured |
| Demo store schema v26 | **Canonical** | Includes client-migration arrays via `ensureClientMigrationFields` |
| Automated extraction provider adapter | **Not implemented** | Only `fixture` adapter exists; production does not call external AI |
| Manual upload → review when provider unavailable | **Contract gap** | Intake marks files `FAILED` / `PROVIDER_UNAVAILABLE`; architecture allows staff review but upload path does not advance to `READY_FOR_REVIEW` without extraction or fixture |

### Demo schema version ladder (20 → 26)

| Version | Addition | Canonical |
|---------|----------|-----------|
| **21** | Bookkeeping seed (`bookkeepingSubscriptions`, cycles, reports, rescue, leads, counters) | Yes |
| **22** | Financial autopilot (connections, accounts, transactions, periods, exceptions, clarifications) | Yes |
| **23** | Physical archive migration (`archiveMigrationBatches`, `archiveMigrationBatchFiles`, client `archiveMigrationStatus`) | Yes |
| **24** | FleetCare network seed | Yes |
| **25→26** | DriverLink + load board publications (upgrade ladder persists as v26) | Yes |
| **26** | Client migration activation (`clientLifecycle`, extracted facts, invites, review, provenance keys, workspace entitlements) | Yes |

`AIO_DEMO_SCHEMA_VERSION` in `src/data/constants.ts` must stay aligned with `DemoStore.version`.

### Generated Experience Brain JSON

**Status:** `GENERATED_ARTIFACT_REGEN_BLOCKED_BY_TOOLING`

Export script `scripts/studioos/aio-client-migration-export.ts` is not in this repo. Does **not** block staff pilot if runtime + Supabase truth match this document.

---

## ENVIRONMENT STATUS

Validation blocked when secrets are missing. **Do not treat as code failure.**

### Extraction (production)

| Variable | Server only | Present in cloud agent | Purpose |
|----------|-------------|------------------------|---------|
| `AIO_MIGRATION_EXTRACTION_PROVIDER` | Yes | **No** | Only `fixture` is implemented today; any other/non-empty value still returns unavailable until a real adapter ships |
| `AIO_ALLOW_MIGRATION_FIXTURE` | Yes | **No** | Dev/test only; ignored when `NODE_ENV=production` |

**Extraction blocker:** No approved production adapter wired in `process-file.ts`. Founder action: implement + configure provider, **or** ship canonical manual intake path (see contract gap above).

### Live Supabase E2E (staff + activation)

| Variable | Classification | Present in cloud agent |
|----------|----------------|------------------------|
| `VITE_AIO_SUPABASE_URL` | **Required** | **No** |
| `VITE_AIO_SUPABASE_ANON_KEY` | **Required** | **No** |
| `VITE_AIO_DATA_MODE` | **Required** (`supabase`) | **No** (defaults demo) |
| `AIO_SUPABASE_SERVICE_ROLE_KEY` | **Required** (server approve/intake) | **No** |
| `AIO_STAGING_SUPABASE_URL` | Optional alias | **No** |
| `AIO_STAGING_SUPABASE_ANON_KEY` | Optional alias | **No** |

Staff session: signed-in user in `aio_internal_staff` (test staff via Supabase auth — see CI secrets below).

### Live RLS matrix

Requires GitHub `aio-production` environment or equivalent. Names only (see `src/security/live/liveSecurityConfig.ts` and `.github/workflows/aio-supabase-production-validate.yml`):

- `AIO_RLS_TEST_CUSTOMER_A_EMAIL` / `_PASSWORD` / `_JWT` / `_ORG`
- `AIO_RLS_TEST_CUSTOMER_B_*`
- `AIO_RLS_TEST_SHIPPER_A_*`, `AIO_RLS_TEST_SHIPPER_B_*`
- `AIO_RLS_TEST_CARRIER_A_*`, `AIO_RLS_TEST_CARRIER_B_*`
- `AIO_RLS_TEST_DRIVER_A_*`, `AIO_RLS_TEST_DRIVER_B_*`
- `AIO_RLS_TEST_PROVIDER_A_*`, `AIO_RLS_TEST_PROVIDER_B_*`
- `AIO_RLS_TEST_STAFF_*`, `AIO_RLS_TEST_STAFF_SPECIALIST_*`, `AIO_RLS_TEST_STAFF_ADMIN_*`
- `AIO_SUPABASE_SERVICE_ROLE_KEY` (service-role path)

**Cloud agent:** none of the above → `BLOCKED_BY_ENVIRONMENT` for live RLS.

### Activation email

| Variable | Classification | Present in cloud agent |
|----------|----------------|------------------------|
| `RESEND_API_KEY` | **Required** for live send | **No** |
| `NEWSLETTER_FROM_EMAIL` or transactional from | Optional | **No** |

### Production validate workflow

Run via **Actions → AIO Supabase Production Validate** (`workflow_dispatch`, environment `aio-production`). Typically **`POST_MERGE_REQUIRED`** for branch SHA unless workflow is dispatched against PR head with secrets.

### Cloud agent (this sprint)

Only **`AIO_CLOUDFLARE_TUNNEL_*`** present. All Supabase / RLS / Resend / extraction vars **absent** → live gates **BLOCKED_BY_ENVIRONMENT**, not code regression.

---

## Pilot readiness (truthful)

| Gate | Code | Environment |
|------|------|-------------|
| Full `npm test` | Fix demo schema expectation → v26 | — |
| Live staff E2E | Ready | **Blocked** |
| Live RLS | Policies exist in DB | **Blocked** (no role JWTs) |
| Live activation + client responsive QA | Ready | **Blocked** |
| Staff responsive QA (demo) | — | **Pass** (prior sprint) |
