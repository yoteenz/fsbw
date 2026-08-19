# AIO Freight — Production Configuration Checklist

**Sprint:** Load Board + Brokerage production configuration  
**Target:** Dedicated **All In One** Supabase project (`AIO_SUPABASE_PROJECT_REF`) — **never** Frontal Slayer (`hyycomvcaqxxvyrfupes`)

---

## 1. Supabase project connection

| Item | Status | Notes |
|------|--------|-------|
| `VITE_AIO_SUPABASE_URL` set (staging/prod) | ☐ BLOCKED | No AIO credentials in agent environment |
| `VITE_AIO_SUPABASE_ANON_KEY` set | ☐ BLOCKED | |
| URL is **not** FS Website project | ☑ Code | `validateAioEnvironment()` rejects `hyycomvcaqxxvyrfupes` |
| `VITE_AIO_DATA_MODE=supabase` in production | ☐ Pending deploy | |
| Service role key in host secret store only | ☐ Pending | Never `VITE_*` |

---

## 2. Migrations (apply to AIO project)

| Migration | Purpose |
|-----------|---------|
| `20260819120000_aio_freight_load_board_production.sql` | Load board, financial split, carrier offers, saved searches |
| `20260819140000_aio_shipper_brokerage_intake.sql` | Shipment requests, quotes, audit |
| `20260819150000_aio_shipper_rls_bookkeeping_handoff.sql` | Shipper RLS, safe views, bookkeeping handoff, shipper invoices |

```bash
export AIO_SUPABASE_PROJECT_REF=<aio-project-ref>
bash scripts/verify-migration-environment.sh
# Apply via Supabase CLI or dashboard SQL
```

| Item | Status |
|------|--------|
| All freight migrations applied | ☐ BLOCKED — live project access required |
| `list_tables` / schema spot-check | ☐ BLOCKED |

---

## 3. RLS & storage

| Item | Status |
|------|--------|
| RLS enabled on intake tables | ☑ Migration |
| Shipper policies (`aio_user_org_id_texts()`) | ☑ Migration |
| Pricing drafts staff-only | ☑ Migration |
| Carrier financials deny-by-default | ☑ Prior migration |
| Shipper-safe views (`aio_shipper_freight_quotes`, `aio_shipper_freight_shipments`) | ☑ Migration |
| Bookkeeping handoffs staff-only | ☑ Migration |
| **Live RLS role matrix** | ☐ BLOCKED — run when creds available |
| Storage policies for freight documents | ☐ Not validated this sprint |

**Live test command (when configured):**

```bash
export AIO_STAGING_SUPABASE_URL=...
export AIO_STAGING_SUPABASE_ANON_KEY=...
bash scripts/rls-staging-test.sh
```

Optional role JWTs: `AIO_RLS_TEST_SHIPPER_A_JWT`, `AIO_RLS_TEST_SHIPPER_B_JWT`, `AIO_RLS_TEST_CARRIER_A_JWT`, `AIO_RLS_TEST_STAFF_JWT`

---

## 4. Application repositories

| Surface | Demo | Supabase | No silent fallback |
|---------|------|----------|-------------------|
| Carrier load board | `demoFreightRepository` | `supabaseFreightRepository` | ☑ `useFreightRepository` |
| Shipper portal | `demoShipperFreightRepository` | `supabaseShipperFreightRepository` | ☑ `useShipperFreightRepository` |
| Office brokerage intake | Demo store (staff) | ☐ Staff Supabase repo deferred | — |
| Bookkeeping handoff | Demo store array | `aio_brokerage_bookkeeping_handoffs` | ☑ Idempotent by `source_type` + `source_id` |

---

## 5. Bookkeeping handoff

| Item | Status |
|------|--------|
| Idempotent key `BROKERAGE_LOAD:{load_id}:rev:{n}` | ☑ |
| Separate from carrier-client P&L | ☑ AIO internal org only |
| Financial revision creates new revision row | ☑ `handoffBrokerageLoadFinancialRevision` |
| Trigger on brokerage load complete (demo) | ☑ `completeLoad` |
| Accessorial split fields | ☑ Schema + handoff payload |

---

## 6. Environment variables (names only — see `.env.example`)

- `VITE_AIO_ENVIRONMENT`, `VITE_AIO_DATA_MODE`, `VITE_AIO_AUTH_MODE`, `VITE_AIO_STORAGE_MODE`
- `VITE_AIO_SUPABASE_URL`, `VITE_AIO_SUPABASE_ANON_KEY`
- `AIO_SUPABASE_SERVICE_ROLE_KEY` (server only)
- RLS test vars (staging CI)

---

## 7. Validation gates

| Gate | Status |
|------|--------|
| Unit / golden path tests | ☑ 40+ freight tests pass locally |
| Production build (`npm run build`) | ☑ Pass |
| Demo mode regression | ☑ Demo repositories unchanged in demo mode |
| Staging golden path (real Supabase) | ☐ BLOCKED |
| Production smoke test | ☐ BLOCKED |
| Auto-deploy | ☐ **Not performed** — founder `deploy now` only |

---

## 8. Deployment recommendation

**Current:** `NOT READY TO DEPLOY — BLOCKERS REMAIN`

**Manual validation workflow (GitHub Actions):**

- Workflow: `.github/workflows/aio-supabase-production-validate.yml`
- Environment: `aio-production` (secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, `SUPABASE_DB_PASSWORD`)
- Trigger: Actions → **AIO Supabase Production Validate** → Run workflow
- Optional role JWT secrets documented in root `docs/freight/AIO_FREIGHT_PRODUCTION_CONFIGURATION_CHECKLIST.md`

**Blockers (production):**
1. AIO Supabase project credentials not configured in this environment
2. Migrations not applied / verified on live AIO project
3. Live RLS integration tests not executed
4. Staging golden path not run against real persistence

**Ready once founder provides AIO Supabase access:**
1. Apply migrations to AIO staging
2. Run `scripts/rls-staging-test.sh`
3. Execute Nashville→Dallas synthetic QA transaction
4. Set production env vars + `deploy now`

---

## 9. Out of scope (unchanged)

GPS/ELD, external market rates, instant booking, freight i18n, sort UI, counteroffer UI, external load APIs.
