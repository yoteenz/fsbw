# Work, Career & Employment Life

## Work view slices

- `ResidentWorkNow`, `ResidentCareerSnapshot`, pairing outcomes (context-specific chemistry)
- Career events: promotion, transfer, notice, alumni — via `recordCareerEvent` (does not mutate canonical personality)

## Career states

`CareerStateKind` — not level numbers; includes `NOTICE_PERIOD`, `ALUMNI`, rotations, leave (schema-ready)

## Pairing

Task-type-specific outcomes in store seed (e.g. concepting vs rapid_execution for Etta ↔ Caspian)

## APIs

`getResidentWorkState`, `getResidentCareerState`, `getPairingOutcomesForPair`, `createResidentRequest`

## Status

**CANONIZED · SCHEMA_DEFINED · PERSISTED (career + decisions) · SERVICE_IMPLEMENTED · QA_PARTIAL**

Full delegation chains / squad runtime: **deferred**.
