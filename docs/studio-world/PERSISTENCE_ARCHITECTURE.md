# Resident Life Persistence Architecture — Simulation1

## Boundary

Domain logic in `life-os/` must not call Supabase directly. Use `ResidentLifeRepository`:

- `InMemoryResidentLifeRepository` — tests + default runtime
- `SupabaseResidentLifeRepository` — server paths when Supabase client available

## Model

- **Event history:** append-only envelopes (Foundation2 `studio_world_resident_life_events`)
- **Materialized state:** Foundation2 tables (current state, needs, memories, beliefs, career, …) + Runtime1 tables (requests, stories, tick ledger, work_now, …)
- **Snapshots:** `exportStoreToSnapshot` / `applySnapshotToStore` for full rehydration in tests

## Migrations (apply order)

1. `20261002143000_studio_world_resident_system_season1.sql`
2. `20261002180000_studio_world_resident_life_os_foundation2.sql`
3. `20261002210000_studio_world_resident_life_runtime_simulation1.sql`

**Prod apply:** verify via Supabase MCP when available; do not claim production persistence without verification.
