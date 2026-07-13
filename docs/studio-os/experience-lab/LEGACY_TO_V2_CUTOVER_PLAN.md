# Legacy → V2 Cutover Plan

**Current state:** V2 is isolated at `/admin/studio/experience-lab-v2`. Production remains at `/admin/studio/experience-lab`.

## Cutover criteria (founder review)

All items in V2 diagnostics **Migration Readiness** panel must be explicitly approved:

1. Mobile approved
2. Desktop approved
3. Viewport approved
4. Data parity approved
5. Generation parity approved
6. Accessibility approved
7. Performance approved
8. Production navigation approved

## Cutover sprint (future — not this sprint)

1. Founder explicit written approval
2. Feature flag `experienceLabV2ProductionCutover` enabled
3. Optional redirect from legacy route (opt-in only)
4. Rollback path: disable flag, restore legacy route as primary

## Rollback

- Legacy components and route remain in repository
- No schema migrations in V2 sprint
- No deletion of Founder Render jobs or queue records
- Revert = route flag off + deploy
