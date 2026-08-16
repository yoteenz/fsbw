# All In One — Data Access Layer (Sprint 20)

## Architecture

```
UI / Hooks
    ↓
useAioRepositories()  — registry.ts
    ↓
Repository Interface  — data/repositories/types.ts
    ↓
DemoRepository  |  SupabaseRepository
```

## Repository interfaces

| Interface | Demo | Supabase |
|-----------|------|----------|
| `IntakeRepository` | ✅ | ✅ |
| `RoadmapRepository` | ✅ | ✅ |
| `ServicePlanRepository` | ✅ | ✅ |
| `ServiceRequestRepository` | ✅ | ✅ |
| `OperationalDataRepository` | ✅ | Partial |

Domain modules (CRM, workflow, billing, etc.) still use `loadDemoStore()` — Phase 2 migrates incrementally.

## Storage

`DocumentStorageProvider` — `getDocumentStorageProvider()` selects demo vs supabase.

## Permissions

- Client: `officeContext.ts`, `securityPermissions.ts` (UX)
- Server: `data/permissions/serverPermissionService.ts` (authority)
- Never trust client `actorUserId`

## Query keys (future)

Standardize: `['customers', orgId]`, `['serviceRequest', id]`

## Transactions

Multi-table writes via server domain commands (extraction phase). Demo store uses synchronous `updateDemoStore()`.

## Error mapping

Postgres `23505` → domain `DUPLICATE_*` errors — not raw SQL to users.

## FS isolation

No imports from `@/lib/supabase`, FS auth keys, or FS service role.

See `SUPABASE_ARCHITECTURE.md`, `DATA_MIGRATION_PLAN.md`.
