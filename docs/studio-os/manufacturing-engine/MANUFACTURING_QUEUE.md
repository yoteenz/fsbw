# Manufacturing Queue

Blueprint decomposes into manufacturing jobs with policies.

## Job ownership

Each job owns:
- `priority`, `dependencies`
- `estimatedCostUnits`, `estimatedTokens`, `estimatedDurationMs`
- `retryPolicy` (max retries, backoff, escalate)
- `inspectionPolicy` (per-asset, block on critical)
- `repairPolicy` (targeted first, full regen last)

## Example jobs

| # | Asset | Type |
|---|-------|------|
| 001 | ReceptionShell | architecture |
| 002 | ReceptionDesk | hero-asset |
| 003 | CrystalLandmark | hero-asset |
| 004+ | Furniture/Decor | tier jobs |
| 006 | Lighting | lighting pass |
| 007 | Particles | atmosphere |
| 008 | Interaction | zones |

## API

```typescript
const queue = buildManufacturingQueue({ plan, dnaRecords, renderIntents });
```
