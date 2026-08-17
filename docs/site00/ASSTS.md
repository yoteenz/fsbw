# ASSTS — The Asset Vault (SITE 00)

Internal visual-production library for SITE 00. Composer/FAL-generated assets enter ASSTS before becoming production assets.

**Production law:** GENERATED ≠ APPROVED ≠ LOCKED. Only locked versions assigned to semantic slots resolve in the application.

## Routes (admin-only)

| Path | Screen | Environment slot |
|------|--------|------------------|
| `/assts` | Library | `assts.library.environment.mobile` |
| `/assts/batches/:batchId` | Batch Review | `assts.batch.environment.mobile` |
| `/assts/:assetId` | Asset Inspection | `assts.inspection.environment.mobile` |

Protected by `AdminGuard` (same auth as `/admin/*`).

## Semantic asset slots

Application code requests a **role**, not a versioned filename:

```ts
resolveProductionAsset('assts.library.environment.mobile')
// → { source: 'locked' | 'fallback', url, versionId, assetId }
```

Seeded slots (see migration `20260817103000_site00_assts_asset_factory.sql`):

- `assts.library.environment.mobile`
- `assts.batch.environment.mobile`
- `assts.inspection.environment.mobile`

Before lock: `AsstsEnvironmentShell` uses CSS fallbacks (`site00-assts-env-fallback--*`). After lock: resolver returns locked storage URLs automatically — no source edits.

## Data model (Supabase)

| Table | Purpose |
|-------|---------|
| `site00_asset_slots` | Semantic slots + current locked asset/version |
| `site00_batches` | Batch metadata, manifest JSON, status |
| `site00_logical_assets` | Asset keys, batch, slot, approved/production version refs |
| `site00_asset_versions` | Versioned files, prompts, status |
| `site00_review_events` | Approve/reject/regenerate/lock audit trail |
| `site00_generation_jobs` | FAL queue jobs, idempotency keys |

## API

`GET/POST /api/admin/site00-assts` (admin auth required)

| Action | Method | Description |
|--------|--------|-------------|
| `library` | GET | Library summary + priority batch |
| `batch` | GET | Batch + enriched assets |
| `asset` | GET | Asset detail + review history |
| `slots` | GET | Resolve one slot |
| `poll` | GET | Poll pending FAL jobs |
| `bootstrap` | POST | Seed batch + logical assets from manifest |
| `generate` | POST | Queue manifest-driven FAL generation |
| `approve` | POST | Approve version; returns `nextAssetId` |
| `reject` | POST | Reject version |
| `regenerate` | POST | Collect correction → queue new version |
| `variant` | POST | Record variant request (distinct from regenerate) |
| `note` | POST | Add review note |
| `lock` | POST | Lock batch + promote approved versions to slots |

## Storage layout

```
site00/assts/batches/{BATCH-KEY}/generated/{asset_key}_v##.webp
```

Deterministic naming: `s00_env_assts_library_mobile_v01.webp` — never overwrite prior versions.

Bucket: `STUDIO_ASSETS_BUCKET` or `live-preview`.

## FAL orchestration

- Reuses `api/_lib/studioBuilderGeneration.js` poll/result helpers
- Model default: `fal-ai/nano-banana-pro`
- Manifest-driven: `api/_lib/site00Assts/manifests.ts`
- Server-side `FAL_KEY` only
- Idempotency: `{asset_key}:v{NN}` on `site00_generation_jobs`

## Batch manifest format

Add manifests to `api/_lib/site00Assts/manifests.ts` and register in `getBatchManifestByKey`.

```typescript
{
  batchKey: 'BATCH-EXAMPLE-001',
  displayName: 'DISPLAY NAME',
  description: 'Optional',
  category: 'CATEGORY / SUBCATEGORY',
  masterPrompt: 'Shared style spec — NO UI, NO text in image',
  promptVersion: 'v1',
  aspectRatio: '9:16',
  outputFormat: 'webp',
  model: 'fal-ai/nano-banana-pro',  // optional
  assets: [
    {
      assetKey: 's00_env_example_mobile',
      displayName: 'Human label',
      semanticSlotKey: 'example.environment.mobile',  // must exist in site00_asset_slots
      compositionPrompt: 'Per-asset camera/composition only',
      required: true,
      variant: 'mobile',
      view: 'library',
    },
  ],
}
```

Workflow: `bootstrap` → `generate` → poll/review in ASSTS UI → approve → `lock`.

Workflow: library load auto-bootstraps + polls (no manual refresh required). Dev/factory controls: triple-tap top-right on ASSTS header or `?factory=1`.

## Pipeline script (server-side validation)

```bash
npx tsx scripts/site00-assts-pipeline.ts bootstrap
npx tsx scripts/site00-assts-pipeline.ts generate
npx tsx scripts/site00-assts-pipeline.ts poll
npx tsx scripts/site00-assts-pipeline.ts status
npx tsx scripts/site00-assts-pipeline.ts lock
```

## First production batch

**BATCH-ASSTS-ENV-001** — three mobile ASSTS environments (Library, Batch Review, Inspection). Locked in production; slots resolve to FAL-generated environments.

## Code map

- Frontend: `src/site00/assts/`
- API: `api/admin/site00-assts.ts`, `api/_lib/site00Assts/`
- Migration: `supabase/migrations/20260817103000_site00_assts_asset_factory.sql`
