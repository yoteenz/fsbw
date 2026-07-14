# Experience Lab V2 — Event Synchronization Forensic Audit

**Date:** 2026-07-14  
**Sprint:** Live Event Synchronization (follow-up to Live Workspace Wiring)

## Pre-sprint state

| Mechanism | Finding |
|-----------|---------|
| Supabase realtime | **None** in `src/` — no `.channel()` / `postgres_changes` before this sprint |
| React Query | **Not used** for Experience Lab package state |
| `syncTick` manual bump | Only invalidation path in `ExperienceLabLiveWorkspaceProvider` |
| `realtimeConnected` | Stub boolean (`!isEnvironmentPackageInMemoryOnly()`) |
| `appendAuditEvent` | Wrote basic rows without sequence, envelope fields, or idempotency |
| Polling | Worker poll on approve only — not workspace-wide |
| Duplicated state | View model already centralized; cards read `liveWorkspace` selectors |
| localStorage listeners | None for package |
| Browser custom events | None for package |

## Durable mutations (already emitted audit rows)

- Package approve → `approved`
- Canonical promote → `canonical-promoted`
- Generation queue/complete → `generation-queued`, `generated`, `production-complete`
- CDS handoff → audit via `cds-handoff.ts`
- Migration → `created`

## Gaps closed this sprint

1. Canonical event envelope + registry (`EnvironmentPackageEvent.ts`)
2. Sequence + idempotent publisher (`event-publisher.ts`)
3. Migration extending `studio_environment_package_audit_events`
4. Recovery API (`/api/admin/environment-package-events`)
5. `EnvironmentPackageRealtimeClient` + local bus
6. `useEnvironmentPackageEventSync` in provider
7. Targeted invalidation matrix + reconciliation
8. Gap recovery + visibility resume
9. Progress throttling (4/sec)
10. Diagnostics `eventSynchronization` export

## Race / ordering risks (mitigated)

| Risk | Mitigation |
|------|------------|
| Out-of-order realtime | Sequence cursor + gap recovery fetch |
| Duplicate delivery | `eventId` dedup in processor |
| Cross-package stale writes | `reconcileExperienceLabWorkspace` package ID guard |
| Context switch mixed state | Provider resets cursor + `reconnect()` on `contextKey` change |
| Progress spam | Throttle in realtime client |

## Intentionally unchanged

- UI layout, anchors, Command Dock, Living Orb, legacy route
- Generation pipeline logic (only event publish order enforced)
- Durable package repository schema (reuse audit table, no parallel model)

## Residual

- Founder live multi-device proof pending (`B1-EnvPkg-LiveProof`)
- Production generation flags still default OFF until founder enables
