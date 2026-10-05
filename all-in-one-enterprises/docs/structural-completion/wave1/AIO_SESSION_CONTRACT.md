# AIO Session Contract (Wave 1)

Implemented in `src/security/sessionContract.ts` and re-exported from `src/auth/authService.ts`.

## Exposed to UI (safe)

- `userId`, `authState`, `emailVerified`
- `activeOrganizationId`, `organizationIds`
- `membershipRole`, `internalRole`, `isInternal`
- `portalProjection`, `fleetcareProviderId`, `driverProfileId`
- `permissions` (reserved; populate from server map in future waves)

## Never exposed

- Raw access token, refresh token, service role key

## Security error codes

`UNAUTHENTICATED`, `UNAUTHORIZED`, `TENANT_MISMATCH`, `RESOURCE_NOT_FOUND`, `SESSION_EXPIRED`, `MEMBERSHIP_REVOKED`, `ROLE_MISMATCH`, `RLS_DENIED`

Supabase errors are mapped via `mapSupabaseErrorToSecurityCode` without leaking policy names in UI copy.
