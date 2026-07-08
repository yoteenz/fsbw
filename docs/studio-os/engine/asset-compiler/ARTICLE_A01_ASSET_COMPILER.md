# ARTICLE-A01 — Asset Compiler™

**Status:** Implemented foundation  
**Engine:** Asset Compiler™  
**Layer:** Production · Asset generation · Asset Registry integration  
**Version:** 1.0.0  

---

## One sentence

**The founder describes intent. The Asset Compiler™ handles prompt engineering, model selection, generation settings, metadata, versioning, and Asset Registry registration.**

---

## Mission

The founder should never manually leave Studio World to generate individual assets.

Studio World already has FAL integrated. The Asset Compiler™ leverages that production stack and turns it into a repeatable internal manufacturing layer.

The founder should never think about:

- prompt engineering,
- model selection,
- CFG,
- steps,
- output resolution,
- transparent backgrounds,
- file naming,
- asset folders,
- versioning,
- metadata,
- registry imports.

All of this becomes automated.

---

## Founder input

The founder chooses only:

1. **Asset Name**
2. **Generation Recipe™**
3. **Optional modifiers**

Everything else is selected by the compiler.

Example:

```ts
compileAssetIntent({
  assetName: 'World Atlas',
  recipeId: 'hero-icon',
  modifiers: ['holographic table', 'crystal geography', 'transparent PNG'],
  creator: 'Founder',
});
```

Output:

- selected recipe,
- FAL model,
- prompt,
- negative prompt,
- aspect ratio,
- output format,
- version,
- storage path,
- metadata,
- Asset Registry entry.

---

## Generation Recipes™

Implemented recipes:

| Recipe | Model | Output | Registry destination |
|--------|-------|--------|----------------------|
| Hero Icon™ | `openai/gpt-image-2/edit` | Transparent PNG | Hero Icon Library™ / icons |
| Environment™ | `fal-ai/nano-banana-pro/edit` | WebP | Environment Library™ / images |
| Furniture™ | `fal-ai/nano-banana-pro/edit` | Transparent PNG | Furniture Library™ / 3D models |
| Orb™ | `openai/gpt-image-2/edit` | Transparent PNG | Orb Artifact Library™ / icons |
| Glass UI™ | `fal-ai/nano-banana-pro/edit` | WebP | Glass UI Library™ / templates |
| Room™ | `fal-ai/nano-banana-pro/edit` | WebP | Room Concept Library™ / images |
| Architecture™ | `fal-ai/nano-banana-pro/edit` | WebP | Architecture Library™ / images |
| Material™ | `fal-ai/nano-banana-pro/edit` | WebP | Material Library™ / images |
| Particle™ | deterministic runtime | JSON | Particle System Library™ / animations |
| Animation™ | `fal-ai/kling-video/v3/pro/image-to-video` | MP4 | Animation Library™ / animations |
| Portrait™ | `openai/gpt-image-2/edit` | Transparent PNG | Portrait Library™ / images |
| Brand Asset™ | `openai/gpt-image-2/edit` | Transparent PNG | Brand Asset Library™ / brand kits |

Each recipe defines:

- FAL model,
- default prompt prefix,
- negative prompt,
- resolution,
- aspect ratio,
- background behavior,
- lighting profile,
- material profile,
- output format,
- registry destination,
- versioning strategy,
- upscaling pipeline,
- metadata.

---

## Asset Registry™ metadata

Every compiled asset stores:

- Asset ID
- Recipe
- Version
- Prompt
- Generation parameters
- Dependencies
- Tags
- Departments using it
- Creator
- Created date
- Preview
- Relationships
- Registry destination
- Registry library
- Storage path

The compiler builds both:

- `CompiledAssetMetadata`
- `RegisteredAssetEntry`

This makes assets immediately discoverable by Asset Registry™ and available to connected systems.

---

## World Graph™

Asset Compiler™ is registered as `W-ENG-asset-compiler`.

Each Generation Recipe™ compiles into a `knowledge-object` node:

```text
W-KNO-generation-recipe-hero-icon
W-KNO-generation-recipe-environment
W-KNO-generation-recipe-furniture
...
```

Relationships:

```text
Asset Compiler™ owns Generation Recipe™
Generation Recipe™ references Asset Registry™
Asset Compiler™ integrates with Asset Registry™, Scene Stack™, and Atlas™
```

---

## Implementation

Core:

- `src/studio-os-core/asset-compiler/types.ts`
- `src/studio-os-core/asset-compiler/recipes.ts`
- `src/studio-os-core/asset-compiler/compiler.ts`
- `src/studio-os-core/asset-compiler/index.ts`

Graph:

- `src/studio-os-core/world-graph/ingestion/asset-compiler-ingest.ts`

Compiler entry point:

```ts
import { compileAssetIntent } from 'src/studio-os-core/asset-compiler';
```

---

## Success criteria

Studio World becomes a self-producing design platform.

The founder describes intent. The Asset Compiler™ handles production.

Every generated asset flows directly from idea to generation recipe to Asset Registry without manual prompt engineering, manual downloads, manual uploads, or manual imports.
