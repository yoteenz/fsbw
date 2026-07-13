# Job Queue Architecture

**Version:** `job-queue.v1`

Blueprint Author decomposes the Construction Plan into **independent bounded jobs**.

## Job types

| Order | Job Type | Scope |
|-------|----------|-------|
| 1 | `architecture` | Immutable shell only |
| 2 | `hero-asset` | One hero asset per job |
| 3 | `furniture` | One furniture asset per job |
| 4 | `decor` | One decor asset per job |
| 5 | `lighting` | Lighting pass — no asset regeneration |
| 6 | `particles` | Atmosphere only |
| 7 | `interaction` | Interaction zones |
| 8 | `material-application` | Library materials only |

## Independence rules

- Each job has `boundedScope: true`
- Workers know only their assigned task — not the whole room
- Non-architecture jobs depend on architecture job completion
- Lighting depends on hero asset jobs

## API

```typescript
const queue = decomposePlanToJobQueue(plan);
assertJobsIndependent(queue.jobs);
```

## Worker payload

Each job carries:

- `jobId`, `assetId`, `socketId`
- `materialSetId`, `materialIds`
- `cameraAnchorId`, `validationProfileId`
- `styleId`, `lightingProfileId`
- `negativeRules`, `organizationRules`
- `outputRequirements`
