# Blueprint Versioning

**Version:** `blueprint-versioning.v1`

Every compile is reproducible. Blueprint stores full revision metadata.

## Revision record

```typescript
BlueprintRevisionRecord {
  revision, author, timestamp
  compilerVersion, promptVersion
  materialVersion, organizationVersion
  roomVersion, sceneVersion
  planId, versions
}
```

## Operations

| Function | Purpose |
|----------|---------|
| `captureBlueprintRevision(plan)` | Snapshot current revision |
| `bumpBlueprintRevision(plan, author)` | Increment revision |
| `assertReproducibleCompile({ revisionA, revisionB })` | Detect version drift |
| `formatRevisionSummary(record)` | Human-readable summary |

## Future features

- Blueprint diff
- Room evolution and historical versions
- Blueprint rollback and merge
- Department and organization templates
- Mass room upgrades

All enabled because Blueprint is deterministic.
