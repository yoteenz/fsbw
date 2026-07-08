# Studio World Atlas™

**Route:** `/admin/studio/world-atlas`  
**Physical location:** Studio Command Center™ · Executive Atrium™ · Holographic Table  
**World path:** `/admin/studio/world/command-center/executive-district/world-atlas`

## Purpose

The Atlas is the **living digital twin** of Studio World™ — spatial civilization navigation and the central operating table for every major Studio OS engine. It is **not** a sitemap, sidebar, navigation menu, or file explorer.

Founders stand over a holographic table projecting the entire campus: buildings rise, roads connect destinations, activity pulses where work is live, construction sites evolve in phases, and Fog of Discovery™ hides what the company has not yet unlocked.

## Phase 2 — Operating Table Evolution

The Atlas connects every major engine visually on the same world:

- Creative Intelligence Engine™ · Company Genome™ · Asset Registry™ · Blueprint Archive™
- Creative Budget™ · Creative Portfolio™ · Architecture Auditor™ · Experience Intelligence Engine™
- Generation Pipeline™ · Scene Stack™ · Studio Archives™ · Expedition Hub™

**Living world:** buildings pulse, departments glow when AI works, construction cranes appear, roads illuminate during travel, marketplace deliveries animate, Golden Builds become monuments.

**World construction:** phased builds (reserve land → fencing → blueprint hologram → foundation → steel → glass → lighting → opening ceremony → permanent).

**World memory:** every building stores construction date, reason, expedition, blueprint, generation cost, creative budget, equity gained, milestones.

**Hero Objects™:** Atlas projects destination-owned Hero Objects as collectible map artifacts, not software pins. A founder should recognize the World Atlas Globe™, Production Board Slate™, Story Table Relic™, or Hero Object Vault™ by silhouette before reading a label. See `docs/studio-os/hero-objects/ARTICLE_D09_HERO_OBJECTS_CONTEXTUAL_ORB.md`.

**Master Planner™:** reserve land, sketch districts, plan wings — simulate before generating.

## Zoom levels

| Level | Name | Example |
|-------|------|---------|
| 1 | Studio World™ | Command Center, CDS, Archives, HQ, Expedition Hub |
| 2 | Company Campus™ | Frontal Slayer Campus™ |
| 3 | Building™ | Marketing HQ, Archives, Command Center |
| 4 | Wing™ | Warehouse Wing, Campaign Wing |
| 5 | Room™ | Campaign Studio, Story Table, Museum |
| 6 | Workspace™ | Actual working environment entry |

## Map modes (16 layers — same world, never separate dashboards)

Architectural Blueprint™ · Organization™ · Operations™ · Creative™ · AI Activity™ · Generation™ · Archives™ · Creative Budget™ · Creative Portfolio™ · Creative Equity™ · Marketplace™ · Innovation™ · Company Genome™ · Construction™ · Future Vision™ · Master Planner™

## Travel modes

Walk · Glass Elevator™ · Fast Travel™ · Guided Tour · Executive Shuttle™ · Skybridge™ · Observation Train™ · Autonomous Transit™

## Core package

`src/studio-os-core/studio-world-atlas/`

| Module | Purpose |
|--------|---------|
| `catalog.ts` | Node tree + enrichment pipeline |
| `catalog-enrichment.ts` | Engine signals, living world, master plan ghosts |
| `engine-registry.ts` | Engine ↔ node ↔ mode intelligence layer |
| `world-construction.ts` | Phased construction system |
| `world-memory.ts` | Building memory + evolution timeline |
| `world-discovery.ts` | Hidden observatories, easter eggs, monuments |
| `master-planner.ts` | Future land reservations |
| `living-world-signals.ts` | Ambient pulse, cranes, deliveries, road glow |
| `fog-of-discovery.ts` | Unlock logic |
| `live-world.ts` | Activity pulse levels |
| `orb-guide.ts` | Studio Orb™ World Guide |
| `fast-travel.ts` | Cinematic travel resolution |
| `memory-store.ts` | Persistence (`studioWorldAtlasDiscovery_v2`) |

## UI

- `src/components/admin/studio/world-atlas/StudioWorldAtlasRoom.tsx`
- `src/hooks/useStudioWorldAtlas.ts`

## Scene Stack™

Department: `studio-world-atlas` · Station: `holographic-table`

## Entry points

1. Executive Atrium™ holographic table hotspot
2. HUD pill: **Studio World Atlas™**
3. Overview module card
4. `/admin/studio/world-atlas`

## Master Planner™ (Phase 3)

See **`docs/studio-os/studio-world-atlas-master-planner.md`** — Reserve Land™, District Planning™, Simulation Mode™, 9-phase pipeline, World Forecast™, Creative Budget integration, Future Vision™ concepts.

