# DATABASE OPERATIONS — All In One

## Project identity guard

**Forbidden:** `hyycomvcaqxxvyrfupes` (Frontal Slayer)

Staging and production project refs **must differ**. Validated by:

- `scripts/verify-migration-environment.sh`
- `validateProductionBuildConfig()`

## Migrations

8 files in `supabase/migrations/` — see `src/data/dataHealth.ts` registry.

### Staging

```bash
export AIO_STAGING_PROJECT_REF=<staging-ref>
export AIO_CONFIRM_STAGING=yes
npm run migrate:staging
supabase db push --project-ref $AIO_STAGING_PROJECT_REF
```

Dry-run: clean staging + current staging state.

### Production

Requires `AIO_CONFIRM_PRODUCTION=yes-i-understand-production` and staging RLS PASS.

## Migration states

`NOT_APPLIED` | `PENDING` | `APPLYING` | `APPLIED` | `FAILED` | `ROLLED_BACK` | `MANUAL_INTERVENTION_REQUIRED`

Strategy: **forward-only** for production.

## RLS verification

Run after staging migrations:

```bash
npm run test:rls-staging
```

Mandatory: Customer A vs B, org boundaries, staff roles.

## Backup / restore

See `BACKUP_AND_RESTORE.md`. Never overwrite production to test restore.

## Access policy

Developers do not casually browse production customer data. Minimum necessary for support.
