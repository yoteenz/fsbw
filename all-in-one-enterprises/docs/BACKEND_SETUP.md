# All In One — Backend Setup

Sprint 04 introduces a **dedicated All In One Supabase project** — completely separate from Frontal Slayer (`hyycomvcaqxxvyrfupes`).

## Prerequisites

1. Create a new Supabase project for All In One Enterprises Inc.
2. Do **not** reuse Frontal Slayer URL, anon key, or service role credentials.

## Environment variables

Add to Cursor Cloud environment settings (or `.env.local` for local dev):

```bash
VITE_AIO_DATA_MODE=backend
VITE_AIO_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_AIO_SUPABASE_ANON_KEY=your-anon-key
VITE_AIO_SITE_URL=https://your-preview-or-production-domain
```

| Variable | Purpose |
|----------|---------|
| `VITE_AIO_DATA_MODE` | `demo` (default) or `backend` |
| `VITE_AIO_SUPABASE_URL` | Dedicated AIO Supabase project URL |
| `VITE_AIO_SUPABASE_ANON_KEY` | Dedicated AIO anon key |
| `VITE_AIO_SITE_URL` | Site URL for auth redirects |

If `VITE_AIO_DATA_MODE=backend` but credentials are missing, the app **falls back to Demo Mode** and shows a setup warning.

## Apply migrations

Migrations live in `all-in-one/supabase/migrations/` — **not** in the host repo's `supabase/migrations/`.

```bash
# Using Supabase CLI linked to the dedicated AIO project:
supabase link --project-ref YOUR_AIO_PROJECT_REF
supabase db push --workdir all-in-one/supabase
```

Or apply manually via Supabase SQL Editor in the **AIO project dashboard**:

1. `20260815100000_aio_identity_foundation.sql`
2. `20260815110000_aio_business_data_rls.sql`

## Auth configuration (Supabase dashboard)

1. Enable Email provider
2. Configure Site URL → `VITE_AIO_SITE_URL`
3. Add redirect URLs:
   - `{SITE_URL}/all-in-one/reset-password`
   - `{SITE_URL}/all-in-one/login`
4. Enable email confirmation if required for production

## Staging seed (optional)

After migrations, create test accounts via sign-up UI or SQL. **Never seed real customer data.**

Document test accounts in team secrets — do not commit passwords.

### Recommended test roles

| Account | Role | Setup |
|---------|------|-------|
| Customer carrier | `organization_owner` | Sign up via `/all-in-one/sign-up` |
| Customer shipper | `shipper_user` | Sign up with shipper account type |
| Permitting specialist | `permitting_specialist` | Insert into `aio_internal_staff` after auth user created |
| Administrator | `administrator` | Insert into `aio_internal_staff` |

Example (run in AIO SQL editor after user exists):

```sql
insert into public.aio_internal_staff (user_id, role)
values ('USER_UUID_HERE', 'administrator');
```

## Storage (future sprint)

Document uploads require a dedicated AIO storage bucket — **not** Frontal Slayer buckets. Not configured in Sprint 04.

## Verification checklist

- [ ] Migrations applied to AIO project only
- [ ] RLS enabled on all `aio_*` tables
- [ ] Customer sign-up creates profile + organization + membership
- [ ] Customer cannot query another organization's requests
- [ ] Customer cannot access `/all-in-one/office`
- [ ] Internal staff can access Office in backend mode
- [ ] Internal notes not visible to customers via API
- [ ] Demo mode still works with `VITE_AIO_DATA_MODE=demo`
