# AUTH OPERATIONS — All In One

## Architecture

- Dedicated Supabase Auth per environment
- **No** Frontal Slayer identities
- Customer auth: sign-in, sign-out, password reset, email verification, sessions
- Staff auth: **invitation-only** — no public staff registration

## Registration policy

Customer accounts via Road Ready / service onboarding / staff invitation — **not** unrestricted public signup unless feature flag enabled in Sprint 24.

## Staff invitation flow

Admin/Owner → Invite → Secure link (expires) → Staff credentials → Role assigned → Audit event

## MFA readiness

Required for OWNER, ADMIN, FINANCE, SECURITY before/at launch — configure in Supabase when production project exists.

## Session security

Idle/absolute timeout, logout, disabled-user handling, role-change invalidation.

## Bootstrap (initial owner)

1. Owner creates Supabase project
2. Use secure admin invitation or Supabase dashboard bootstrap
3. **No** default passwords (`admin/admin`)
4. Disable temporary bootstrap after first owner exists

## Password reset

Callback URLs must use `VITE_AIO_APP_URL` for target environment — never FS or preview URLs.

## Deactivation

Staff/customer disable → revoke sessions → audit event.
