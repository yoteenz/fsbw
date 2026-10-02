# Resident Life Twin

The **Resident Life Twin** is the continuous aggregate of a resident’s simulated life — identity, location, schedule, work, career, goals, memory, relationships, emotional/need state, possessions/home refs, autonomy, cast roles, and recent events.

## Canonical model

- Type: `ResidentLifeTwin` in `life-os/life-twin-model.ts`
- Normalized slices: `ResidentCurrentState`, `ResidentNeedSnapshot`, `ApproachProfile`, `PersonalityDecisionWeights`, `ResidentAutonomyProfile`, `ResidentCareerSnapshot`, `ResidentWorkNow`, `ResidentGoalStack`, `ResidentLifeRhythm`, `ResidentHomeRef`
- JSONB in Postgres is reserved for extensible metadata on rows — not whole-twin storage

## API

- `getResidentLifeTwin(residentId)` — primary aggregate
- Season 1 seed: `life-os/life-os-seed.ts` (non-idle default activities)

## Status (Foundation2)

**CANONIZED · SCHEMA_DEFINED · PERSISTED (tables) · SERVICE_IMPLEMENTED · QA_VISIBLE**

Runtime tick / offline reflection engine: **deferred**.
