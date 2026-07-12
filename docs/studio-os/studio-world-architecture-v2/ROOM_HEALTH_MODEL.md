# Room Health Model™

**Version:** `room-health.v1`

## Principle

Every room is a **living operational system** with independent subsystem health.

## Subsystem states

Healthy · Warning · Critical · Offline · Repairing · Updating · Unknown

## Room operational status

Online · Degraded · Repairing · Offline · Activating

## Rules

- Architecture critical/offline → room offline
- Any subsystem repairing → room repairing
- Other subsystem critical → room degraded (architecture healthy)
- All healthy → room online

## Building health

Aggregate score computed from all room snapshots on a floor/building.

## Module

`src/studio-os-core/studio-world-architecture-v2/room-health.ts`

## Example dashboard

| Room | Status |
|------|--------|
| Reception | Healthy |
| Founder Suite | Healthy |
| TV Lounge | Repairing |
| Gallery | Updating |
| Showroom | Healthy |
