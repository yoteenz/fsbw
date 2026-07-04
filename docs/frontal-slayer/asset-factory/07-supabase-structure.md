# Supabase Structure

Upload helper: `api/_lib/productAssetFactory/supabaseStorage.ts`

```typescript
productAssetStoragePath(productLine, unitSlug, version, fileName)
// → products/signature-collection/soft-wave/v1/cart.png
```

Upload uses service role client with `upsert: true`.

Public URL pattern:

```
{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
```

Environment:

- `SUPABASE_URL` — required
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY` — required for upload
- `PRODUCT_ASSETS_BUCKET` — optional override (default `live-preview`)
