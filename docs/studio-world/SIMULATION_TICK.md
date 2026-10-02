# Simulation Tick — Simulation1

**Execution:** `MANUAL_DEBUG` via QA page and `runWorldTick()` · **Job-ready** via `residentLifeScheduler` · **Cron:** disabled until founder authorizes deployment.

## Contract

- Uses real-world time by default; override with `setSimulationClockOverride(iso)` for tests.
- Idempotent per 15-minute tick window (`tickWindowIdForInstant`).
- Evaluates life rhythm, internal work, needs (time-based), location (logical only).
- Every external/founder-gated action passes `evaluateFounderGate` — simulation does not spend money, publish, or change live infra.

## Outputs

`NO_ACTION`, `STATE_UPDATE`, `WORK_PROGRESS`, `LOCATION_CHANGE`, `NEED_CHANGE`, `FOUNDER_ESCALATION`, etc. (see sprint spec).

## Persistence

Tick ledger table: `studio_world_resident_simulation_ticks` (Runtime1 migration).
