# Asset Factory Integration

When an exact configured visual does not exist:

1. Snapshot status → **FALLBACK_USED** (or **MISSING** before fallback applied)
2. `enqueueBawVisualVariantGeneration()` writes a placeholder request to `localStorage` key `bawVisualSnapshotGenerationQueue_v1`
3. Checkout is **not blocked**
4. Admin can generate/approve exact visuals later via Asset Factory (future milestone)

## Queue entry shape

```typescript
{
  id: 'baw-vgen-soft-wave-cherry-…',
  unitSlug: 'soft-wave',
  colorSlug: 'cherry',
  assetIds: ['soft-wave_cherry_hero', 'soft-wave_cherry_cart', …],
  config: { productName, color, length, … },
  status: 'queued',
}
```

## Event

`bawVisualSnapshotGenerationQueued` — dispatched on window when a new request is queued.

## Future

Asset Factory reads `listBawVisualVariantGenerationQueue()`, generates variants, publishes to `/assets/baw-visual-snapshots/`, and registers URLs in `BAW_APPROVED_VARIANT_URLS`.

No AI generation in Milestone 21.5.
