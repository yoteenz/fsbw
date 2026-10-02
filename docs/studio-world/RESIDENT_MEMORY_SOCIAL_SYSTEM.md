# Memory, Social Graph, Rumor & Belief

## Memory

- Classes: `MemoryClass` in `types-core.ts`
- Significance: `memory-utils.ts` (`scoreMemoryRetention`, `classifyMemoryStability`)
- Storage: `studio_world_resident_memories` + in-memory `addMemoryRecord`

## Ground truth vs belief

- Authoritative events: `SocialTruthEvent` / `studio_world_resident_social_truth_events`
- Per-resident belief: `ResidentBeliefRecord` / `studio_world_resident_beliefs`
- Rumors: `RumorFragment` — **never** overwrite truth (`rumor-engine.ts`)

## Relationships

Foundation1 graph extended at read time with life dimensions (`getResidentRelationshipState`).

## Private disclosures

`registerPrivateDisclosure` — founder-privileged; does not auto-create `OFFICE_KNOWN` events.

## Status

**CANONIZED · SCHEMA_DEFINED · PERSISTED · SERVICE_IMPLEMENTED · QA_VISIBLE**

Memory echoes / full rumor mutation runtime: **deferred**.
