# All In One — RLS Policy Model (Sprint 20)

## Principles

1. RLS complements server authorization — does not replace domain logic
2. Service role is not authorization — server must verify actor first
3. Customers see only authorized org scope
4. CRM, internal notes, audit, security: never customer-readable

## Helpers

```sql
aio_is_internal_user()  -- active aio_internal_staff
aio_user_org_ids()      -- set of org UUIDs for auth.uid()
```

## Customer policies

Pattern: `organization_id IN (SELECT aio_user_org_ids())`

Apply to: service requests, documents (customer visibility), invoices (select), dispatch loads, messages.

## Staff policies

Pattern: `aio_is_internal_user()` for write; role refinement via application layer in Sprint 20 foundation.

Future: permission-aware policies using `aio_user_roles` + `aio_role_permissions`.

## Domain-specific

| Domain | Customer | Staff | Notes |
|--------|----------|-------|-------|
| CRM | DENY | Internal | Notes default INTERNAL |
| Workflow | Safe projection | Full | Internal steps hidden |
| Financial | Own org invoices | Finance perm | Margins staff-only |
| Factoring | Configured visibility | Factoring perm | Stronger restriction |
| Audit | DENY | security.audit.read | Append-only table |
| Security incidents | DENY | Security role | |

## Storage RLS

Mirror document metadata policies. Signed URLs via server `getAuthorizedDocumentDownload()` only.

## Test matrix

Run against: anonymous, Customer A, Customer B, Dispatcher, Finance, Admin, Security, service-role path.

Status in debug: **PASSING** (demo contract + authorizationGuard). Supabase matrix: **NOT_TESTED** until dedicated project connected.

See `src/all-in-one/data/data.test.ts` and `security/security.test.ts`.
