# ARTICLE-A02 — Studio Foundry™

**Status:** Implemented foundation  
**System:** Studio Foundry™  
**Layer:** Universal asset manufacturing  
**Version:** 1.0.0  

---

## One sentence

**Studio Foundry™ manufactures every reusable Studio World object; Asset Registry™ stores and indexes the result; Orb, Atlas, and UI consume assets by ID only.**

---

## Why A02 exists

ARTICLE-A01 introduced the Asset Compiler™ and Generation Recipes™. That was the correct machinery, but the mental model was one level too low.

A library stores finished assets.

A foundry manufactures assets.

Studio World should not think in terms of a standalone Hero Icon Library™. Hero Icons are the first asset class manufactured by **Studio Foundry™**.

---

## Target model

```text
UI / Orb / Atlas
  ↓ assetId
Asset Registry™
  ↓
If asset exists: return registered asset.
If asset is missing or regeneration is requested:
  ↓
Studio Foundry™
  ↓
Generation Recipe™
  ↓
Asset Compiler™
  ↓
Existing FAL integration
  ↓
Versioned asset + metadata
  ↓
Asset Registry™
  ↓
UI displays registered asset
```

The UI never knows how an asset was produced.

---

## Responsibility boundaries

| System | Responsibility |
|--------|----------------|
| **Studio Foundry™** | Manufactures assets. Cache-first resolver for missing/regenerated assets. |
| **Asset Registry™** | Stores, versions, tags, indexes, and returns assets. |
| **Generation Recipes™** | Define how asset classes are manufactured. |
| **Asset Compiler™** | Internal compilation layer: recipe + intent → FAL request + metadata. |
| **World Graph™** | Tracks where assets are used and how recipes relate to systems. |
| **Orb / Atlas / UI** | Consume assets by ID only. |

---

## Foundry asset classes

Studio Foundry™ is the universal manufacturing system for:

- Hero Icons
- Architecture
- Rooms
- Furniture
- Materials
- Glass Objects
- Holograms
- Motion Assets
- Particle Systems
- Portraits
- UI Components
- Landmark Objects
- Audio
- Collectibles
- Future asset classes

Implemented foundation:

```ts
STUDIO_FOUNDRY_ASSET_CLASS_CATALOG
```

Supported classes currently map to Generation Recipes™. Planned classes reserve the manufacturing boundary for future recipes without changing Orb/Atlas/UI consumption.

---

## Resolver contract

Core API:

```ts
resolveStudioFoundryAsset({
  assetId: 'asset-hero-icon-world-atlas',
  registry,
  manufacturingIntent: {
    assetName: 'World Atlas',
    recipeId: 'hero-icon',
    modifiers: ['holographic atlas table', 'transparent PNG'],
  },
});
```

Behavior:

1. Look up `assetId` in Asset Registry™.
2. If present and regeneration is not requested, return the registered asset.
3. If missing or `regenerate: true`, call Studio Foundry™.
4. Studio Foundry™ selects the Generation Recipe™.
5. Asset Compiler™ builds the FAL request and metadata.
6. Existing FAL integration performs generation.
7. Asset is versioned, registered, cached, and returned.

---

## Implementation

Foundry:

- `src/studio-os-core/studio-foundry/types.ts`
- `src/studio-os-core/studio-foundry/foundry.ts`
- `src/studio-os-core/studio-foundry/index.ts`

Compiler internals:

- `src/studio-os-core/asset-compiler/`

Graph:

- `src/studio-os-core/world-graph/ingestion/asset-compiler-ingest.ts`

Docs:

- `docs/studio-os/engine/asset-compiler/ARTICLE_A01_ASSET_COMPILER.md`
- `docs/studio-os/engine/asset-compiler/ARTICLE_A02_STUDIO_FOUNDRY.md`

---

## Constitutional rule

No future Studio World visual object should be generated as a loose file or standalone library.

Every reusable generated object must flow through:

```text
Studio Foundry™ → Generation Recipe™ → Asset Compiler™ → FAL → Asset Registry™ → World Graph™ usage
```

Orb, Atlas, Mission Control, and UI should never depend on model names, prompts, output folders, or generation details.
