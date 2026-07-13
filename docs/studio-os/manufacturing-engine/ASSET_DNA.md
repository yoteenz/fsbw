# Asset DNA™

Every asset receives immutable manufacturing DNA.

## Schema

- Identity: `assetId`, `assetFamily`, `assetCategory`, `blueprintOwner`
- Revisions: asset, geometry, material, lighting, animation, interaction
- Physical: dimensions, bounding volume, collision, pivot, center of mass
- Visual DNA: silhouette, scale, proportion, transparency, material ratios
- Negative DNA: forbidden materials and generations
- History: health, generation, prompt, model, repair
- `assetSignatureHash` — deterministic fingerprint

## Visual DNA ratios

`glassRatio`, `chromeRatio`, `marbleRatio`, `acrylicRatio` — deterministic per family.

## Negative DNA

Every asset explicitly forbids: gold, wood, granite, black marble, architecture leakage, complete rooms, people.

## API

```typescript
const dnaRecords = deriveAllAssetDnaFromPlan(constructionPlan);
```
