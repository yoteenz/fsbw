# AIO Backend Reality Audit (code-evidence)

**As-of:** 2026-10-05 (forensic run)  
**Dedicated project:** `nnnljnhtmseagotvgxxt`  
**Forbidden FS project:** `hyycomvcaqxxvyrfupes`

## Supabase

| Area | Status | Evidence |
|------|--------|----------|
| Migrations | **17 files** | `supabase/migrations/` through `20260827001621_aio_api_role_grants.sql` |
| Schema breadth | Freight, shipper, brokerage, autopilot, identity | Migration filenames + live tests |
| RLS enablement | Enabled on material freight/shipper tables | CI `aio-verify-schema.mjs` |
| Table GRANTs | **Applied** (service_role/authenticated/anon) | Migration `20260827001621`; GHA was failing 42501 before fix |
| Live CI | Workflow `aio-supabase-production-validate.yml` | RLS role matrix **BLOCKED** without Auth secrets; persistence tests expected PASS post-GRANT |
| Client repos | Narrow | `src/repositories/*` (4 files); most UI uses demo store |
| Data mode default | **demo** | `src/config/env.ts`, `vitest.config.ts` |

## Auth

- `AIOAuthProvider`, `CustomerRouteGuard`, `OfficeRouteGuard`.
- Demo mode: guards pass through.
- Production build: rejects demo auth/storage (`validateProductionBuildConfig`).

## Storage

- Vault / documents: demo + schema references; signed URL patterns in docs—verify per domain before PRODUCTION_READY.

## Email / SMS / Payments

- Integrations module present; largely demo/adapters. Treat as **BACKEND_PARTIAL** until provider credentials in env.

## Deployment

- Standalone Vite app; `vercel.json` SPA rewrite.
- AIO CI: `aio-standalone-qa.yml`, production validate workflow_dispatch.

## Staging vs production

- Single dedicated Supabase project used for validation; staging hostname via Cloudflare (`aio-preview.fsbw-dev.com`) for app preview—not a separate Supabase ref in repo constants.
