# Event Bus™ V1.0 (Milestone 131)

**Route:** `/admin/studio/event-bus`

## Purpose

**Event Bus™** is the communication backbone of Studio OS — the nervous system that connects every system through events.

> Systems should not communicate directly. Systems publish events. Other systems decide whether to respond.

## Core philosophy

- **Loosely coupled** — no feature depends directly on another feature
- **Publish/subscribe** — scalable event-driven architecture
- **One event, many reactions** — intelligent chain reactions across the platform
- **Permanent history** — every important action traceable for audit, debug, and compliance

## Example event chain

```
Customer Created
    ↓ Executive Timeline™
    ↓ Memory Engine™
    ↓ Organization Pulse™
    ↓ Documentation Registry™
    ↓ Command Dock™
    ↓ Notifications™
    ↓ Automation Registry™
    ↓ Analytics™
    ↓ Search™
```

## Standard event verbs

Created · Updated · Deleted · Approved · Rejected · Published · Archived · Completed · Started · Stopped · Assigned · Transferred · Scheduled · Cancelled · Paid · Failed · Succeeded · Imported · Exported · Connected · Disconnected

## Architecture

| Component | Path |
|-----------|------|
| Event catalog | `event-catalog.ts` — standardized event type definitions |
| Subscription registry | `subscription-registry.ts` — who reacts to what |
| Chain builder | `chain-builder.ts` — documented reaction chains |
| Event history | `event-history.ts` — permanent audit trail |
| Event Inspector | `inspector-engine.ts` — monitor, filter, debug, latency |
| Bus runtime | `bus-runtime.ts` — `publishEvent()` · `subscribeToEvent()` · `replayEvent()` |
| Governance | `governance-engine.ts` — flags direct coupling violations |
| Registration | `registration.ts` — `registerEventType()` |

## Event Inspector

Developers can:

- **Monitor** events in real time
- **Replay** historical events
- **Filter** by domain, verb, status, publisher
- **Inspect** payloads
- **Debug** delivery failures
- **Measure** event latency
- **Visualize** event chains

## Command Dock

**`resolveEventBusAdvice()`** handles event bus queries:

- *"Show Event Bus status."*
- *"What happens when a customer is created?"*
- *"Show Event Inspector metrics."*
- *"Are systems communicating via events?"*

## Sync chain

… → Interaction Engine → Event Bus → **Automation Registry**

**`event-bus/store`** triggers **`syncAutomationRegistryFromSources`** · **boundary-sync**

## UI

- **`EventBusWorkspace`** — Overview · Event Catalog · Subscriptions · Event Inspector · Event History · Event Chains · Governance · Discovery
- **`MissionControlEventBusPanel`** in Legacy Wing
- Hook: **`useEventBusState`**

## Storage

Demo localStorage: `studioOsEventBus_v1`

## Brand voice

*"Systems publish events. Other systems decide whether to respond."*

Accent: `#EA580C`

## Developer integration

When integrating new Studio OS modules:

1. **Publish** standardized events via `publishOrganizationEvent()` — never call another module directly
2. **Subscribe** via `subscribeToEvent()` or register in `subscription-registry.ts`
3. **Register** new types via `registerEventType()`
4. Use **Event Inspector** to debug delivery and measure latency

## Relationship to Interaction Engine™

| Layer | Scope |
|-------|-------|
| **Interaction Engine™** | **How UI responds** to user input |
| **Event Bus™** | **How systems communicate** with each other |
