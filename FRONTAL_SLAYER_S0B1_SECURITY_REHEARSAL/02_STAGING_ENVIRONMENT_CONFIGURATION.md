# 02 — Staging Environment Configuration (prepared, not provisioned)

**Status: PREPARED · external provisioning BLOCKED** (A1a, H2, H3 not recorded; cost not approved). This sprint changed no provider resources.

## 1. Target configuration

| Layer | Configuration | Isolation property |
|---|---|---|
| Database | **New Supabase project** `frontal-slayer-staging` in the "FS Website" organisation (Pro). Region us-east-1, matching production | Separate ref, separate Auth, separate keys. Nothing shared with production or `site00-staging` |
| Schema | `22_…/staging/schema_export.sh` (operator) exports **schema only** from production (`public`, `supabase_migrations`; no rows, no privileges). `schema_import.sh` loads it **and refuses** the production or SITE00-staging refs | No customer data, no auth identities |
| Grants and policies | Re-applied explicitly from the 2026-10-26 live capture (`22_…/sql/03_policies_grants.sql`, `04_function_acls_live.sql`), then verified with V0 | ACL parity is checked, not assumed |
| Fixtures | Synthetic users via the staging Auth admin UI (`customer.a@staging.test`, `customer.b@staging.test`, `member.12m@staging.test`, `admin@staging.test`) + `staging_fixtures.sql` | Synthetic only |
| Application | The same Vercel project. A **Preview** environment scoped to a `staging` branch with a fixed domain (proposed `staging.frontalslayer.com`; requires DNS) | Environment-scoped variables. Production secrets never present |
| Payments | Stripe **test mode**: `sk_test_…`/`pk_test_…`, test Price IDs, test webhook endpoint `https://<staging host>/api/stripe/webhook` with its own `whsec_…`. Stripe CLI for replay | No live charges |
| Email | Resend test domain, or the proposed `EMAIL_SANDBOX_RECIPIENT` (all mail to one internal inbox). `SITE_URL` = the staging host | No customer email; links never point at production |
| Auth | The staging project's own Site URL and redirect allow-list = the staging host only | No production callbacks |
| Guard | `22_…/staging/env_guard.cjs` runs at build or start and **refuses** wrong-project, wrong-mode or leaked-key combinations (doc 03) | Fails closed |

## 2. Environment variable matrix (names only)

| Variable | Production | Staging | Notes |
|---|---|---|---|
| `APP_ENV` (proposed) | `production` | `staging` | Read by the guard |
| `SUPABASE_URL`, `VITE_SUPABASE_URL` | prod ref | **staging ref** | Guard checks the ref |
| `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY` | prod anon | staging anon | Role claim must be `anon` |
| `SUPABASE_SERVICE_ROLE_KEY` | prod service (Sensitive) | staging service (Sensitive) | **Required**; the guard refuses it missing |
| `FS_PRODUCTION_SUPABASE_REF` / `FS_STAGING_SUPABASE_REF` | config | config | Not secrets |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_*` | live | **test** | Guard checks the mode |
| `SITE_URL` | production domain | staging domain | Guard refuses a production domain in staging |
| `RESEND_API_KEY` + `EMAIL_SANDBOX_RECIPIENT` (proposed) | live | sandbox | Guard requires the sandbox in staging |
| `ALLOW_LEGACY_CHECKOUT` | **unset** | unset | Guard refuses it in production |
| `CRON_SECRET`, `BOOKING_AUTOPAY_CRON_SECRET` | prod | separate staging values | Autopay stays dormant (A7) |

## 3. Provisioning sequence (operator, after approvals)

1. Founder records A1a, H2 and H3, and approves the cost (doc 17).
2. Create the project `frontal-slayer-staging` (Supabase dashboard or connector `create_project` with cost confirmation).
3. `schema_export.sh` (production, read-only role) → `schema_import.sh` (staging; refuses wrong refs).
4. Re-apply ACL and policy parity; run `V0_PRECHECK` on staging and compare with the 2026-10-26 capture (doc 05).
5. Create the synthetic auth users and run `staging_fixtures.sql`.
6. Configure Vercel Preview variables for the `staging` branch; add the staging domain; run `env_guard.cjs` with `APP_ENV=staging` (must print OK).
7. Configure Stripe test mode, the test webhook endpoint and the portal (cancel at period end only).
8. Run the rehearsal: doc 06 Track S.

## 4. Fail-safe requirements (verified locally where possible)

| Requirement | How it is enforced | Verified |
|---|---|---|
| Never silently fall back to production Supabase | Guard: ref must equal `FS_STAGING_SUPABASE_REF`; import script refuses prod and SITE00 refs | Guard: 7/7 synthetic cases (doc 03). Import refusals: by code review only |
| Never silently fall back to the anon key | Guard refuses a missing service key. **The application still contains `getSupabaseAdmin()` anon fallback**: an S0B-2 code change | Guard only; app fix pending |
| Never use live Stripe in staging, or test Stripe in production | Guard mode checks | 2/2 cases |
| Never email real customers | Guard requires `EMAIL_SANDBOX_RECIPIENT` in staging; the mailer must honour it (S0B-2 code change) | Guard only; mailer change pending |
| Never call production webhooks | Separate test webhook endpoint and secret | By configuration (pending) |
