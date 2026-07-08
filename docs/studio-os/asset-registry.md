# Asset Registry™ V1.0 (Milestone 140)

**Route:** `/admin/studio/asset-registry`

## Purpose

**Asset Registry™** is the permanent home for every organizational asset inside Studio OS.

> Assets should never become scattered across folders. Every organizational asset becomes a managed platform resource. The Asset Registry transforms media into organizational knowledge.

## Core philosophy

- **No scattered folders** — single registry for all assets
- **Managed platform resources** — every asset registered with metadata
- **Never overwrite** — complete versioning with restore and comparison
- **Discoverable and connected** — intelligently linked to Studio OS systems

## Register assets

Images · Videos · Audio · Logos · Brand Kits · Documents · PDFs · Templates · Presentations · Icons · Illustrations · 3D Models · Animations · Marketing Assets · Training Assets · Knowledge Assets · Academy Resources · Marketplace Resources · Documentation Assets

Everything searchable.

## Asset metadata

Unique ID · Name · Category · Owner · Organization · Department · Version · Tags · Keywords · Description · Usage · Related Systems · Associated Workflows · Brand Guidelines · License · Storage Location · Last Modified · Usage History

## Versioning

Never overwrite assets. Maintain:

Current Version · Previous Versions · Approval History · Change Log · Archive · Restore · Comparison

## Asset health

Broken Links · Unused Assets · Duplicate Assets · Missing Alt Text · Brand Compliance · Resolution · Performance · Accessibility · Recommended Updates

## Architecture

| Component | Path |
|-----------|------|
| Category catalog | `category-catalog.ts` — 19 asset categories |
| Metadata engine | `metadata-engine.ts` — 18 tracked fields |
| Asset catalog | `asset-catalog.ts` — registered assets |
| Versioning engine | `versioning-engine.ts` — never overwrite |
| Health engine | `health-engine.ts` — 9 health checks |
| Discovery | `discovery-engine.ts` — `queryAssetRegistry()` |
| Command Dock | `dock-advisor.ts` |

## Command Dock

**`resolveAssetRegistryAdvice()`** handles asset queries:

- *"Show unused assets."*
- *"Find our latest logo."*
- *"Archive outdated brand assets."*
- *"Which videos are used in Academy?"*

## Sync chain

… → Plugin SDK → Workflow Engine → State Engine → Asset Registry → **Experience Engine**

**`asset-registry/store`** triggers **`syncExperienceEngineFromSources`** · **boundary-sync**

## Asset Compiler™ integration

**ARTICLE-A01:** [Asset Compiler™](./engine/asset-compiler/ARTICLE_A01_ASSET_COMPILER.md) is the production layer that creates registry-ready generated assets from founder intent.

Flow:

`Asset Name + Generation Recipe™ + Optional Modifiers → FAL request → metadata → versioned storage path → RegisteredAssetEntry → Asset Registry™`

The founder should not manually download, upload, name, version, or import generated assets.

## UI

- **`AssetRegistryWorkspace`** — Overview · Asset Categories · Metadata · Versioning · Asset Health · Governance · Discovery
- **`MissionControlAssetRegistryPanel`** in Legacy Wing
- Hook: **`useAssetRegistryState`**

## Storage

Demo localStorage: `studioOsAssetRegistry_v1`

## Brand voice

*Assets managed. Knowledge preserved. Never scattered.*

Accent: `#B45309`
