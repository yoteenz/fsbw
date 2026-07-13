# AI Factory Workers™

Models are specialized workers. No worker performs another worker's job.

## Worker roles

- Architect Worker — shell only
- Hero Asset Worker — hero objects
- Furniture Worker — furniture tier
- Decor Worker — disposable decor
- Lighting Worker — lighting pass
- Background Removal Worker — surgical repair
- Material Worker — material layer rebuild
- Optimization Worker — silhouette/scale fixes

## Assignment

```typescript
const assignment = assignFactoryWorker({ job, organizationId });
assertWorkerSpecialization({ assignment, attemptedRole });
```

Workers receive Render Intent ID — not whole-room context.
