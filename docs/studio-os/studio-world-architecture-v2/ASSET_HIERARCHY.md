# Asset Hierarchy™

**Version:** `asset-hierarchy.v1`

## Tiers

| Tier | Examples | Subsystem |
|------|----------|-----------|
| Hero | Reception desk, landmark, elevator, crystal installation | hero-assets |
| Furniture | Chairs, tables, lounges, pods | furniture |
| Decor | Flowers, plants, accessories, wall pieces | decor |

## Independence

Each asset:

- Generated independently
- Validated independently
- Carries own health, version, repair history

## Metadata per asset

Asset ID · Health · Version · Prompt version · Model · Placement · Bounding volume · Socket compatibility · Transparency · Quality score

## Never conflate

- Furniture is NOT architecture
- Landmark is NOT decor
- Decor is disposable

## Module

`src/studio-os-core/studio-world-architecture-v2/asset-hierarchy.ts`
