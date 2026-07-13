# World Manufacturing History™

Every asset stores full manufacturing provenance.

## Recorded fields

- Who built it (worker role + model)
- Blueprint revision, DNA revision, Render Intent revision
- Generation time, inspection score
- Repair count, replacement count
- Current health, lifetime health

## API

```typescript
const entry = recordManufacturingHistory({
  planId, blueprintRevision, dna, intent, assignment, inspection, generationTimeMs
});
```

Enables audit, rollback, and evidence-based model routing.
