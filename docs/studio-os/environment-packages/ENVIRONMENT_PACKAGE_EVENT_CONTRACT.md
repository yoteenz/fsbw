# Environment Package Event Contract

**Schema version:** `studio.environment-package-event.v1`  
**Durable table:** `studio_environment_package_audit_events` (append-only)

## Envelope: `EnvironmentPackageEvent`

| Field | Required | Description |
|-------|----------|-------------|
| `eventId` | yes | Globally unique; idempotent writes |
| `eventType` | yes | Registry-driven (see below) |
| `packageId` | yes | Active durable package |
| `variantId` | no | Design variant context |
| `environmentId` | no | Environment context |
| `departmentId` | no | Department context |
| `revision` | yes | Package revision at emit time |
| `outputType` | no | blueprint, materials, etc. |
| `jobId` | no | Generation job correlation |
| `actorType` | yes | founder, admin, system, scheduler, generation-worker, provider, CDS, asset-manufacturing |
| `actorId` | no | Actor identifier |
| `source` | yes | package-repository, generation-worker, scheduler, readiness-service, approval-service, review-service, revision-service, CDS-handoff, asset-manufacturing, realtime-recovery, client-local |
| `sequence` | yes | Monotonic per package |
| `occurredAt` | yes | Business time |
| `persistedAt` | yes | Database write time |
| `correlationId` | no | Workflow chain |
| `causationId` | no | Parent event |
| `schemaVersion` | yes | Contract version |
| `payload` | yes | Typed extension data |

## Server publisher

`api/_lib/environmentPackage/event-publisher.ts` — `publishEnvironmentPackageEvent()`

Order of operations:

1. Persist package mutation
2. Persist output/job/revision record
3. Append package event
4. Return response

## Recovery API

`GET /api/admin/environment-package-events?packageId=...&afterSequence=N`

Admin-authenticated; returns events after cursor for gap recovery and reconnect.

## Registry

Canonical types live in `ENVIRONMENT_PACKAGE_EVENT_TYPES` (`EnvironmentPackageEvent.ts`).

Legacy audit strings (`approved`, `canonical-promoted`, `blueprint-generation-started`, etc.) normalize via `normalizeLegacyAuditEventType()`.

## RLS

- `service_role`: full access (server writes)
- `authenticated`: SELECT for realtime subscription (Experience Lab admin sessions)

## Code

- `src/studio-os-core/environment-asset-package/events/EnvironmentPackageEvent.ts`
- `api/_lib/environmentPackage/persistence.ts` → `appendAuditEvent()` delegates to publisher
