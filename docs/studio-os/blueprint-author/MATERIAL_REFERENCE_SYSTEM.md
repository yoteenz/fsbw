# Material Reference System

**Version:** `material-reference-system.v1`

Blueprint references **only approved organization materials**. Models never invent marble, stone, glass, wood, or chrome.

## Approved materials (Frontal Slayer)

- `founder-marble` → `/assets/marble-half.png`
- `founder-chrome`
- `founder-crystal`
- `founder-glass`
- `founder-red-illumination`
- `founder-white-acrylic`

## Forbidden generic terms

`marble`, `stone`, `glass`, `wood`, `chrome`, `generic-marble`, etc.

## API

```typescript
resolveMaterialReferences({ organizationId, materialIds });
assertNoGenericMaterialInvention({ actualMaterialLabel });
buildMaterialSetReference({ materialSetId, version, organizationId, materialIds });
```

## Immune repair

When actual material is `Generic Marble` but blueprint expects `founder-marble`:

> Repair: Rebuild material layer with approved organization material.
