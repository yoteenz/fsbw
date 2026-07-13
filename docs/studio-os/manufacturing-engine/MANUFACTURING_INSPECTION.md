# Manufacturing Inspection™

Immediately after generation — inspect the **asset**, not the room.

## Checks

- Silhouette, geometry, transparency, reflections
- Scale, proportions, bounding volume
- Socket orientation, materials, lighting profile
- Texture source, marble/chrome/acrylic match
- Background clean, no architecture, no room fragments
- No unwanted furniture, no duplicated objects

## API

```typescript
const inspection = inspectManufacturedAsset({ plan, dna, intent, output });
// inspection.approved — gate before assembly
// inspection.inspectionScore — 0-1
```
