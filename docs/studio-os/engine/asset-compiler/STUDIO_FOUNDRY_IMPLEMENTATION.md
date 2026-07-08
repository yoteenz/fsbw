# Studio Foundry™ — Hero Icon Product Line Implementation

**Date:** 2026-07-08  
**Status:** Implemented (Hero Icons first product line)  
**Related:** ARTICLE-A01 Asset Compiler · ARTICLE-A02 Studio Foundry

---

## Summary

Studio Foundry™ is now the universal asset manufacturing layer for Studio World UI surfaces. Hero Icons are the first product line. The Orb radial menu, Hero Icon Library wrappers, and related panels consume assets **by slug only** — they never embed generation prompts or hardcoded sculpture art.

```
UI / Orb / Atlas
    → getFoundryAsset(slug)
    → Asset Registry (localStorage, Supabase-ready)
    → if missing / regenerate → Foundry Client → FAL adapter → register ready asset
```

---

## New modules

| Path | Role |
|------|------|
| `src/studio/foundry/foundryTypes.ts` | Foundry asset model, statuses, cost fields, World Graph refs |
| `src/studio/foundry/generationRecipes.ts` | `HERO_ICON_RECIPE` and recipe catalog stub |
| `src/studio/foundry/assetRegistry.ts` | Local-first registry: seed merge, versioning, tags, usage |
| `src/studio/foundry/assetResolver.ts` | Resolve, queue, ready/failed/regenerate lifecycle |
| `src/studio/foundry/foundryClient.ts` | `getFoundryAsset`, `generateFoundryAsset`, `regenerateFoundryAsset` |
| `src/studio/foundry/foundryGenerationAdapter.ts` | Client adapter → `/api/admin/studio-foundry-generate` |
| `src/studio/foundry/productLines/heroIcons.ts` | Hero Icon seed registry + Orb/legacy ID bridges |
| `src/hooks/useFoundryAsset.ts` | React hook with registry subscription + optional auto-queue |
| `src/components/admin/studio/foundry/` | `FoundryAssetPreview`, `FoundryHeroIcon` |
| `api/admin/studio-foundry-generate.ts` | Admin FAL endpoint via Asset Compiler + existing builder generation |

**Existing core (unchanged boundary):** `src/studio-os-core/studio-foundry/`, `src/studio-os-core/asset-compiler/`

---

## Files changed (Orb / Hero Icon wiring)

| File | Change |
|------|--------|
| `StudioWorldHeroIcon.tsx` | Delegates to `FoundryHeroIconFromId` |
| `OrbIconSculptures.tsx` | Delegates to `FoundryHeroIconFromOrb`; keeps `OrbIconDailyBrief` / `OrbIconVoice` |
| `StudioOrbRadialMenu.tsx` | Unchanged API — still uses `OrbIconSculpture` |
| `studioOrbTheme.ts` | Foundry shimmer / missing / preview CSS |
| `StudioWorldHeroIconSculptures.tsx` | **Deprecated as source of truth** — retained for reference only |

---

## How Hero Icons resolve

1. UI calls `getFoundryAsset('hero-icon.world-atlas')` or uses `useFoundryAsset(slug)`.
2. Registry merges seeds from `HERO_ICON_SEEDS` with any stored versions.
3. **Ready:** `FoundryAssetPreview` renders `transparentUrl` / `previewUrl` image.
4. **Queued / generating:** acrylic shimmer placeholder (not emoji).
5. **Missing / failed:** elegant crystal void placeholder (not flat glyph, not sculpture fallback).
6. Optional `autoQueue: true` calls `generateFoundryAsset({ slug })` — default **off** on Orb to avoid spamming FAL.

**Slug format:** `hero-icon.{name}` e.g. `hero-icon.world-atlas`, `hero-icon.voice-mode`.

**Legacy bridges:**
- Orb `iconId` → slug via `foundrySlugFromOrbIconId()`
- Hero icon id → slug via `foundrySlugFromHeroIconId()`

---

## FAL integration status

| Layer | Status |
|-------|--------|
| Adapter interface | ✅ `generateFoundryAsset()` + `callFoundryFalAdapter()` |
| API route | ✅ `POST /api/admin/studio-foundry-generate` (admin auth) |
| Asset Compiler | ✅ `compileAssetIntent()` builds prompt from recipe + seed intent |
| FAL execution | ✅ Uses existing `generateStudioBuilderAsset()` (`fal-ai/nano-banana-pro/edit` on API path) |
| Credentials | ⚠️ Requires `FAL_KEY` — returns 503 gracefully when missing |
| Auto-generation on Orb | ❌ Off by default (`autoQueue: false`) |

**Conclusion:** FAL is **wired end-to-end** through the adapter. Icons display placeholders until an admin-triggered or explicitly queued generation succeeds.

---

## Regenerating an icon

```typescript
import { regenerateFoundryAsset } from '@/studio/foundry';

await regenerateFoundryAsset('hero-icon.world-atlas');
```

Or from a React surface with auto-queue:

```tsx
<FoundryHeroIcon slug="hero-icon.world-atlas" autoQueue />
```

Programmatic queue without immediate FAL call:

```typescript
import { queueFoundryAssetGeneration } from '@/studio/foundry';
queueFoundryAssetGeneration('hero-icon.mission-control');
```

---

## Adding a new Foundry asset class

1. **Recipe** — Add a `FoundryGenerationRecipe` in `generationRecipes.ts` and ensure a matching `GenerationRecipeId` exists in Asset Compiler recipes.
2. **Product line** — Create `src/studio/foundry/productLines/{className}.ts` with seed definitions.
3. **Registry** — Import seeds in `assetRegistry.ts` `mergeWithSeeds()`.
4. **Client** — Extend `generateFoundryAsset()` to resolve seeds beyond hero-icons (currently hero-icon only).
5. **UI component** — Add a thin preview wrapper (like `FoundryHeroIcon`) that calls `getFoundryAsset(slug)` only.
6. **World Graph** — Register asset class node on compile (future ingest hook).

Do **not** embed prompts in UI components.

---

## Production cost fields

Each `FoundryAsset` supports:

- `estimatedCost`, `actualCost`, `provider`, `model`, `generationTimeMs`, `reuseSavings`

Populated on successful generation in `foundryClient.ts`. Cost is **not** shown in the Orb menu — reserved for Foundry / Registry / Inspector views.

---

## World Graph compatibility

Assets include:

- `usedBy`, `worldGraphRefs.usedByDepartments`, `usedByScenes`, `usedByComponents`
- `originRecipe`, `relatedAssets`, `supersedes`, `supersededBy`

Graph UI ingestion for individual manufactured assets is **not** built yet — data model is ready.

---

## Known limitations

1. **Local registry only** — `localStorage` key `studioFoundryAssetRegistry_v1`; Supabase adapter stub documented in `assetRegistry.ts`.
2. **Hero-icon product line only** — `generateFoundryAsset()` validates against `HERO_ICON_SEED_BY_SLUG`.
3. **Admin-only generation API** — requires signed-in admin session.
4. **No auto-queue on Orb** — prevents unsolicited FAL spend; placeholders shown until manual/inspector generation.
5. **Legacy sculptures file retained** — `StudioWorldHeroIconSculptures.tsx` no longer used by Orb but not deleted (reference / rollback).
6. **Core vs UI foundry split** — manufacturing orchestration lives in both `studio-os-core/studio-foundry` (compiler integration) and `src/studio/foundry` (UI registry + React consumption). Future consolidation optional.

---

## What remains to connect

- [ ] Supabase persistence tables + sync adapter
- [ ] Foundry Inspector UI (cost, version history, regenerate controls)
- [ ] World Graph node creation when assets reach `ready`
- [ ] Bridge to `src/studio-os-core/asset-registry/` canonical registry
- [ ] Additional product lines (Rooms, Environments, Furniture, …)
- [ ] Optional `autoQueue` policy per surface (Mission Control vs Orb)
