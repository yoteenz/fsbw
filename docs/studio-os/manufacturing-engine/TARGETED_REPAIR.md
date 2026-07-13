# Targeted Repair™

Repairs are surgical — not full regeneration by default.

## Examples

| Failure | Old approach | New approach |
|---------|--------------|--------------|
| Silhouette incorrect | Regenerate desk | Adjust silhouette → reuse → revalidate |
| Background detected | Regenerate image | Background Removal Worker → reinspect |

## Actions

`adjust-silhouette` · `background-removal` · `rebuild-material-layer` · `fix-transparency` · `fix-scale` · `regenerate-asset` · `manufacture-replacement`

## API

```typescript
const repairs = planTargetedRepairs(classifiedFailures);
```
