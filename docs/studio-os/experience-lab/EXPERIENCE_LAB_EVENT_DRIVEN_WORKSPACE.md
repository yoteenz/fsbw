# Experience Lab V2 — Event-Driven Workspace

**Sprint:** Experience Lab V2 Live Event Synchronization  
**Status:** Shipped on `master`

## Objective

Keep every connected Experience Lab V2 workspace surface consistent with the active Environment Asset Package **without page refresh**, **without duplicated business state**, and **without UI redesign**.

## Architecture

```
Package mutation (server / worker / local action)
  → EnvironmentPackageEventPublisher (durable append)
  → studio_environment_package_audit_events
  → Supabase realtime INSERT (scoped by package_id)
  → EnvironmentPackageRealtimeClient
  → processEnvironmentPackageEvent (cursor + dedup + sequence)
  → reconcileExperienceLabWorkspace (targeted invalidation)
  → refreshPackage (syncTick) → buildExperienceLabLiveWorkspaceViewModel
```

## Connected surfaces (same event flow)

- Design Brief
- Persistent Blueprint Display
- Founder Review Wall
- Revision Timeline
- Workbench modules (Architectural Tools, Material Library, Asset Reference, Budget Forecast, Workforce Center, Permit Center)
- Approval Bridge
- Dynamic Context Display (single instance preserved)

## Client modules

| Module | Path |
|--------|------|
| Event contract | `src/studio-os-core/environment-asset-package/events/` |
| Realtime client | `EnvironmentPackageRealtimeClient.ts` |
| Local bus (in-memory / same-tab) | `EnvironmentPackageLocalEventBus.ts` |
| Recovery | `recoverEnvironmentPackageEventGap.ts` |
| Provider hook | `useEnvironmentPackageEventSync.ts` |
| Page boundary | `ExperienceLabLiveWorkspaceProvider.tsx` |

## Non-goals (preserved)

- Command Dock, Program Selector, viewport layout, anchors, Living Orb, legacy route
- Parallel package repository
- Global polling loops

## Diagnostics

`exportDiagnostics()` on the live workspace provider includes `eventSynchronization` JSON:

- connection state
- active subscription package ID
- last event ID / sequence
- recovery count
- last invalidation set
- historical-preview update flag

## Tests

`src/features/studio-world/experience-lab-v2/experience-lab-event-sync.test.ts`

## Related docs

- `docs/studio-os/environment-packages/ENVIRONMENT_PACKAGE_EVENT_CONTRACT.md`
- `docs/studio-os/environment-packages/ENVIRONMENT_PACKAGE_REALTIME_RECOVERY.md`
- `docs/studio-os/environment-packages/ENVIRONMENT_PACKAGE_EVENT_INVALIDATION_MATRIX.md`
- `docs/studio-os/forensics/EXPERIENCE_LAB_V2_EVENT_SYNC_AUDIT.md`
