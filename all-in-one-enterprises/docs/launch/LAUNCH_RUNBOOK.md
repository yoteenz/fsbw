# LAUNCH RUNBOOK — All In One Enterprises Inc.

## Phased strategy

| Phase | Mode | Audience |
|-------|------|----------|
| 0 | INTERNAL | Staff only — verify production auth, portal, Office, monitoring |
| 1 | PILOT | Approved pilot customers + activated services only |
| 2 | LIMITED_PUBLIC | Selected services public; others COMING SOON / Request Info |
| 3 | PUBLIC | All APPROVED ACTIVE services |

Current mode: **INTERNAL** (`src/launch/launchModes.ts`)

## Phase 0 checklist

- [ ] Production deployment smoke (internal accounts)
- [ ] Launch Control Center reviewed (`/office/management/launch`)
- [ ] Service Activation states confirmed
- [ ] Staff training assigned
- [ ] SOPs acknowledged
- [ ] No demo utilities in production bundle

## Pilot activation

Requires explicit **pilot approval** recorded (who, when, scope, services).

## Pause / rollback

- Service-specific pause preferred over full shutdown
- Application rollback: `docs/DEPLOYMENT_RUNBOOK.md`
- Database: forward repair / restore — never blind down-migration

## Stabilization

After launch → STABILIZING state. Daily review per `docs/launch/STABILIZATION_PLAN.md`.
