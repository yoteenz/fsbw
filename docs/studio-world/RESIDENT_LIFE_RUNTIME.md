# Resident Life Runtime — Simulation1

**Status:** SERVICE_IMPLEMENTED · PERSISTED (repository layer) · RUNTIME_ACTIVE (manual debug tick) · DEBUG_VISIBLE · PROD_APPLIED **PENDING verification** · CRON_ACTIVE **DEFERRED**

Foundation2 canon + in-memory domain remain source of truth for business rules. Simulation1 adds:

- Repository boundary (`life-os/persistence/`)
- Materialized snapshot export/import + Supabase adapter
- Background tick + reflection job contracts (`life-os/runtime/scheduler.ts`)
- Return brief significance filter (`life-os/runtime/return-brief-service.ts`)
- QA extensions at `/__studio-world/residents`

Do **not** describe residents as fully autonomous in production until cron is authorized and prod schema verified.

See also: `SIMULATION_TICK.md`, `RETURN_BRIEF.md`, `PERSISTENCE_ARCHITECTURE.md`.
