# World Stories & Events

## Event envelope

`ResidentLifeEventEnvelope` — `event_id`, `truth_status`, `visibility`, `causal_parent`, resident ids, payload.

## World stories

Must reference a real simulation event (`createWorldStory` throws if `groundedEventId` missing).

## Return brief

`getReturnBrief(from, to)` — items grounded in authoritative events only (no fabricated catch-up).

## Status

**CANONIZED · SERVICE_IMPLEMENTED · RUNTIME_ACTIVE background progression deferred**
