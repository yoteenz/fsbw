# AIO client migration — environment setup

Canonical env names for **client migration**, **activation**, and **live validation**. Never commit secret values.

**Supabase project (AIO only):** `nnnljnhtmseagotvgxxt` — not Frontal Slayer `hyycomvcaqxxvyrfupes`.

---

## Client runtime (Vite)

| Env | Purpose | Server/Client | Required prod | Required live test |
|-----|---------|---------------|-------------|-------------------|
| `VITE_AIO_DATA_MODE` | `demo` vs `supabase` | Client | prod: `supabase` | `supabase` for live E2E |
| `VITE_AIO_AUTH_MODE` | Auth backend | Client | prod: `supabase` | `supabase` |
| `VITE_AIO_STORAGE_MODE` | Storage backend | Client | prod: `supabase` | `supabase` |
| `VITE_AIO_SUPABASE_URL` | AIO project URL | Client (public) | Yes | Yes |
| `VITE_AIO_SUPABASE_ANON_KEY` | Anon/publishable key | Client (public) | Yes | Yes |
| `VITE_AIO_ENVIRONMENT` | `local` / `staging` / `production` label | Client | Yes | Optional |
| `VITE_AIO_APP_URL` | App origin for links | Client | Yes | Optional |
| `VITE_AIO_CLIENT_MIGRATION_V1` | Staff migration pilot flag | Client | Default on | Optional |
| `VITE_AIO_EXISTING_CLIENT_ACTIVATION_V1` | Activation pilot flag | Client | Default on | Optional |

---

## Server (Vercel / API routes — never `VITE_` for secrets)

| Env | Purpose | Required prod | Required live test |
|-----|---------|-------------|-------------------|
| `AIO_SUPABASE_SERVICE_ROLE_KEY` | Approve migration, server intake | Yes | Yes |
| `AIO_SUPABASE_PROJECT_REF` | Guards / migrations | Yes | CI |
| `AIO_STAGING_SUPABASE_URL` | Optional alias for tests | Staging | Optional |
| `AIO_STAGING_SUPABASE_ANON_KEY` | Optional alias for tests | Staging | Optional |
| `AIO_MIGRATION_EXTRACTION_PROVIDER` | `none` / future slug (not `fixture` in prod) | When automation desired | Optional |
| `AIO_ALLOW_MIGRATION_FIXTURE` | Dev fixture extraction | **No** in prod | Local only (`1`, non-prod) |
| `OPENAI_API_KEY` | Used elsewhere in monorepo; **not** wired to migration yet | N/A | N/A |
| `RESEND_API_KEY` | Activation invite email | For email pilot | Live activation test |
| `NEWSLETTER_FROM_EMAIL` | Transactional from address | Optional | Optional |

---

## Live RLS matrix (CI / `aio-production`)

See `.github/workflows/aio-supabase-production-validate.yml` and `src/security/live/liveSecurityConfig.ts`.

Minimum for migration RLS slice:

- `AIO_RLS_TEST_CUSTOMER_A_EMAIL` / `_PASSWORD` (or `_JWT`)
- `AIO_RLS_TEST_CUSTOMER_B_EMAIL` / `_PASSWORD`
- `AIO_RLS_TEST_STAFF_EMAIL` / `_PASSWORD` (or `_JWT`)
- `AIO_SUPABASE_SERVICE_ROLE_KEY`

Full freight/shipper matrix adds `AIO_RLS_TEST_SHIPPER_*`, `CARRIER_*`, `DRIVER_*`, `PROVIDER_*`, etc.

---

## Readiness matrix (current)

| Capability | Local dev (demo) | Cloud agent | CI (`aio-production`) | Production |
|------------|------------------|-------------|------------------------|------------|
| Staff migration UI | Yes | Yes (5173) | With secrets | With config |
| Extraction automation | Fixture (demo) | No provider | If provider wired | If provider wired |
| **Manual migration review** | Yes | Yes | With Supabase + staff auth | Yes (canonical) |
| Approve migration | Demo store | Needs service role + staff JWT | Yes | Yes |
| RLS tests | Skipped | Blocked | Yes | Yes |
| Invitation send | Demo | Blocked | With Resend | With Resend |
| Client activation live | Demo | Blocked | With secrets | With secrets |
| Responsive live QA | Demo staff | Partial | With auth | With auth |

---

## Manual fallback (no extraction provider)

When `PROVIDER_UNAVAILABLE`, uploads still reach **`READY_FOR_REVIEW`**. Staff use batch review UI:

**Automated extraction unavailable → Continue with manual review → Add manual fact**

Manual facts use `source_reference` prefix `MANUAL_REVIEW|…` and provenance **`MANUAL_REVIEW`** on approve.
