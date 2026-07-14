# Environment Package Realtime Recovery

## When recovery runs

- Sequence gap detected (`event.sequence > cursor.lastSequence + 1`)
- Realtime reconnect
- Browser tab visibility resume (`document.visibilitychange`)
- Package context transition (provider resets cursor, then `reconnect()`)
- Invalid event payload (processing error → degraded state)

## Recovery function

`recoverEnvironmentPackageEventGap()` in  
`src/studio-os-core/environment-asset-package/events/recoverEnvironmentPackageEventGap.ts`

Fetches:

- Events after `lastSequence` via `/api/admin/environment-package-events`
- Optional package status refresh via `/api/admin/environment-package-status`

Then reconciles workspace via `reconcileExperienceLabWorkspace()` — **no full-page reload**.

## Event cursor

Per active package session (`EnvironmentPackageEventCursor`):

| Field | Purpose |
|-------|---------|
| `lastEventId` | Dedup aid |
| `lastSequence` | Gap detection |
| `lastOccurredAt` | Lag observability |
| `connectionState` | connecting / connected / reconnecting / degraded / disconnected / recovering / local-only |
| `missingSequenceCount` | Gap metric |
| `duplicateEventCount` | Idempotency metric |
| `recoveryCount` | Recovery frequency |
| `lastRecoveryAt` | Last recovery timestamp |
| `lastInvalidationSet` | Last targeted selectors |
| `processingErrors` | Failed processing count |

## Dual transport

1. **Durable:** Supabase `postgres_changes` on `studio_environment_package_audit_events` filtered by `package_id`
2. **Local:** `EnvironmentPackageLocalEventBus` for in-memory repository and same-tab optimistic actions

When persistence is disabled (Vitest / in-memory), client operates in `local-only` mode with bus + no Supabase channel.

## Mobile Safari

On `visibilitychange` → visible: compare cursor, fetch missed events, refresh package once.

Avoid duplicate subscriptions — provider `useEffect` cleanup calls `dispose()` on prior client.

## Multi-session

Changes from another authorized admin session arrive via durable INSERT → realtime → same reconciliation path.

## Progress throttling

`GENERATION_JOB_PROGRESS` and `OUTPUT_GENERATING` throttled to ~4 visual updates/sec in `EnvironmentPackageRealtimeClient`.

## Historical preview safety

During pinned revision preview, live events update background state (`currentPackageUpdated`) without auto-switching viewport.
