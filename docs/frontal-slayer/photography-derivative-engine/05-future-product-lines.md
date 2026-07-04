# Future Product Lines

The same derivative engine applies to every studio os product line — no forked logic.

## Supported product lines

| Product line | Folder root | Status (M21) |
|--------------|-------------|--------------|
| `signature-collection` | `derivatives/signature-collection/` | Full slot tree (6 units × 18 derivatives) |
| `bundles` | `derivatives/bundles/` | Placeholder root |
| `closures` | `derivatives/closures/` | Placeholder root |
| `frontals` | `derivatives/frontals/` | Placeholder root |
| `accessories` | `derivatives/accessories/` | Placeholder root |

## API

```typescript
prepareDerivativesOnHeroApproval({
  productLine: 'bundles',
  unitSlug: 'example-bundle-slug',
  photographyVersion: '1.0',
});
```

`listDerivativeSlotsForProductLine()` returns the same 18 slots for all lines today. Product-line-specific slot variants can be added later without changing the approval trigger.

## Future brands

Additional brands inside studio os inherit:

- Photography Bible locked specifications
- Crop template library
- Derivative slot registry
- Site binding pattern (assetKey → derivative)

Register new product lines in `PhotographyProductLine` and create a placeholder folder under `derivatives/`.

## Inheritance on product create

`inheritPhotographyBibleForProduct(productSlug)` includes `derivativeSlots: 18` so studio os product creation knows the derivative count upfront.
