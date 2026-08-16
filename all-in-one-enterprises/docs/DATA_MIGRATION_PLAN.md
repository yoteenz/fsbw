# All In One — Data Migration Plan (Sprint 20)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | Canonical repositories introduced | **COMPLETE** |
| 2 | Demo UI on repository interfaces | **IN PROGRESS** |
| 3 | Supabase dev backend connected | NOT STARTED |
| 4 | Schema/RLS/storage verified | NOT STARTED |
| 5 | Standalone extraction | NOT STARTED |
| 6 | Production configuration | NOT STARTED |
| 7 | Controlled initial data import | NOT STARTED |

## Debug persistence → canonical tables

See `src/all-in-one/data/persistenceInventory.ts` for full migration map.

Primary demo store: `localStorage` key `aio_debug_store` (v20). Legacy keys migrated into consolidated store.

## Repository switch

```
UI → Domain Services → Repository Interface → DemoRepository | SupabaseRepository
```

No `supabase.from()` in React components.

## Production import

`LegacyDataImporter` interface with `validate()`, `transform()`, `dryRun()`, `import()`, `verify()`.

**Sprint 20:** `import()` disabled; dry-run only at `/office/system/data/migration`.

## FS isolation

- Migration guard aborts on FS project ref
- No FS env fallback
- Demo repositories never call FS backend

## Demo reset

Reset Demo Data restores canonical v20 seed — does not affect Frontal Slayer data.
