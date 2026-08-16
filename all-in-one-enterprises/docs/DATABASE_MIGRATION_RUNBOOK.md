# All In One — Database Migration Runbook (Sprint 20)

## Prerequisites

- Dedicated All In One Supabase project (NOT `hyycomvcaqxxvyrfupes`)
- `AIO_SUPABASE_PROJECT_REF` set
- Supabase CLI authenticated

## Pre-flight

```bash
./all-in-one/scripts/verify-migration-environment.sh
```

Expected: `All In One migration guard: OK`

If ABORT: fix project ref / URL before proceeding.

## Apply migrations

```bash
export AIO_SUPABASE_PROJECT_REF=<your-aio-project-ref>
supabase link --project-ref "$AIO_SUPABASE_PROJECT_REF"
supabase db push
```

Migration order (8 files):
1. `20260815100000_aio_identity_foundation.sql`
2. `20260815110000_aio_business_data_rls.sql`
3. `20260815120000_aio_identity_roles_contacts.sql`
4. `20260815130000_aio_crm_workflow_billing.sql`
5. `20260815140000_aio_integrations_security_audit.sql`
6. `20260815150000_aio_infrastructure_outbox.sql`
7. `20260815160000_aio_rls_extensions.sql`
8. `20260815170000_aio_indexes_views.sql`

## Verification

1. `list_tables` — confirm `aio_*` tables exist
2. Run RLS test matrix
3. Apply production reference seed (roles/permissions only)
4. Run repository contract tests against Supabase adapter

## Rollback

Forward-only migrations. Destructive changes require backup/restore — document per migration.

## Destructive policy

No `DROP TABLE` / `DROP COLUMN` without founder review and backup plan.

## Type generation

When schema exists: `supabase gen types typescript` → update `database.types.ts`
