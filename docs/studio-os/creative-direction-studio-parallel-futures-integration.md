# Creative Direction Studio™ — Parallel Futures Integration™

**Route:** Creative Direction Studio™ → Story Table™ zone  
**Philosophy:** Generation begins with possibilities — not assets. Visions first, reverse engineering second.

## Universal creative pipeline

Studio OS replaces prompt-first generation with vision-first synthesis:

```
Founder Intent™
    ↓
Story Table™
    ↓
Parallel Futures™
    ↓
Future Merge™
    ↓
Concept Approval™
    ↓
Scene Deconstruction™
    ↓
Asset Registry™
    ↓
Warehouse™
    ↓
Scene Assembly™
    ↓
Golden Build™
```

This pipeline is **not** Atlas-only — it is the default Creative Direction Studio™ workflow and the template for every future department.

## Story Table™

On new project load, Studio OS generates **6 complete Scene Stack™ concepts** (not individual assets):

- Luxury Editorial · Apple Minimal · Futuristic Luxury
- Modern Penthouse · Gallery Experience · Architectural Showcase

Each concept includes environment, lighting, materials, architecture, furniture, hero objects, atmosphere, motion language, color direction, and full analysis metrics.

## Parallel Futures™

Founders compare 3–6 complete creative directions side-by-side on the Story Table™ with generation cost, Creative Budget impact, production time, reuse %, Marketplace potential, and Creative Equity™.

## Future Merge™

**MERGE CONCEPTS™** opens ingredient-based synthesis (lighting ← B, architecture ← A, etc.). Merged master concepts fork as new explorable visions — nothing is overwritten.

## Concept Approval™ gate

Production stages remain **locked** until **APPROVE CONCEPT™**. Only then does Studio OS:

1. Run **Scene Deconstruction™** (environment shell, lighting, architecture, materials, furniture, props, atmosphere, particles, hero objects, animations, textures, audio)
2. Check **Asset Reuse™** against Asset Registry™, Blueprint Archive™, Golden Builds™, Marketplace™, Company Genome™
3. Unlock the legacy Creative Approval Pipeline™ for layer-by-layer assembly

## Studio Orb™ — Creative Director

On Story Table™, the Orb surfaces Creative Director recommendations with WHY — genome alignment, reuse savings, merge suggestions, marketplace potential. The Orb guides; it does not generate assets first.

## Engine modules

```
src/studio-os-core/creative-direction-studio/
├── creative-pipeline-types.ts
├── creative-concepts.ts
├── concept-merge.ts
├── concept-deconstruction.ts
├── concept-reuse.ts
├── concept-orb.ts
└── creative-pipeline-store.ts
```

**Hook:** `useCreativeUniversalPipeline`  
**Storage:** `studioOsCreativeUniversalPipeline_v1`

See also: `docs/studio-os/creative-direction-pipeline/creative-direction-pipeline.md` · `docs/studio-os/studio-world-atlas-parallel-futures.md`
