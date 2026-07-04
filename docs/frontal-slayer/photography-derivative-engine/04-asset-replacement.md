# Asset Replacement

Future approved derivatives replace website assets **without changing page code**. Pages resolve a stable **assetKey**; the derivative engine returns the folder URI for the matching derivative.

## Site bindings

Each binding maps:

- **assetKey** — stable resolver key (e.g. `unit.pdp.heroImage`)
- **derivativeId** — which derivative slot supplies the asset
- **surface** — pdp, wishlist, cart, search, collection, email, desktop, mobile, studioos, social, marketing

Example bindings:

| assetKey | Derivative | Surface |
|----------|------------|---------|
| `unit.pdp.heroImage` | product-page-crop | pdp |
| `shop.productCard.thumb` | product-card-crop | collection |
| `wishlist.row.thumb` | wishlist-crop | wishlist |
| `cart.dropdown.lineThumb` | cart-dropdown-crop | cart |
| `email.signatureCollection.unit` | email-crop | email |
| `email.holographic.exhibit` | holographic-display-crop | email |

Full list: `DERIVATIVE_SITE_BINDINGS` in `DerivativeAssetReplacement.ts`.

## Resolver API

```typescript
resolveDerivativeForSiteAsset(assetKey, derivatives)
```

Returns `DerivativeAssetUri | null`:

- `folderPath` — derivative folder (always when prepared)
- `fileUri` — `{folderPath}/asset.png` when status is `generated`, `approved`, or `replaced`; otherwise `null`

## studio os service

```typescript
photographyDerivativeEngineStudioService.resolveSiteAsset(assetKey, productLine, unitSlug)
```

Reads persisted derivative store and resolves bindings for admin tooling and future storefront integration.

## Migration path

1. **Now (M21):** Slots and bindings defined; site still uses legacy `/assets/` paths.
2. **Next:** Generation pipeline writes PNGs into derivative folders.
3. **Then:** Storefront product config references `assetKey`; resolver returns derivative URI.
4. **No page rewrites:** Swap asset source in resolver layer only.
