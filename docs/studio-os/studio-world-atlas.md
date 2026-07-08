# Studio World Atlas™

**Route:** `/admin/studio/world-atlas`  
**Physical location:** Studio Command Center™ · Executive Atrium™ · Holographic Table  
**World path:** `/admin/studio/world/command-center/executive-district/world-atlas`

## Purpose

The Atlas is the **living blueprint** of Studio World™ — spatial civilization navigation for founders. It is **not** a sitemap, sidebar, navigation menu, or file explorer.

Founders stand over a holographic table projecting the entire campus: buildings rise, roads connect destinations, activity pulses where work is live, and Fog of Discovery™ hides what the company has not yet unlocked.

## Zoom levels

| Level | Name | Example |
|-------|------|---------|
| 1 | Studio World™ | Command Center, CDS, Archives, HQ, Expedition Hub |
| 2 | Company Campus™ | Frontal Slayer Campus™ |
| 3 | Building™ | Marketing HQ, Archives, Command Center |
| 4 | Wing™ | Warehouse Wing, Campaign Wing |
| 5 | Room™ | Campaign Studio, Story Table, Museum |
| 6 | Workspace™ | Actual working environment entry |

## Map modes

- Architectural Blueprint™
- Organization View™
- Creative View™
- Operations View™
- Archives View™
- AI View™
- Generation View™

## Travel modes

Walk · Elevator · Fast Travel · Guided Tour — cinematic transitions, never abrupt.

## Core package

`src/studio-os-core/studio-world-atlas/`

- `catalog.ts` — node tree from flagships + route registry
- `fog-of-discovery.ts` — unlock logic
- `live-world.ts` — activity pulse levels
- `orb-guide.ts` — Studio Orb™ recommendations
- `fast-travel.ts` — travel resolution + timing
- `memory-store.ts` — discovery persistence (`studioWorldAtlasDiscovery_v1`)

## UI

- `src/components/admin/studio/world-atlas/StudioWorldAtlasRoom.tsx`
- `src/hooks/useStudioWorldAtlas.ts`

## Scene Stack™

Department: `studio-world-atlas`  
Station: `holographic-table`  
Prompts: `src/studio-os-core/scene-stack/world-atlas-station-prompts.ts`

Layer order: Environment Shell → Architecture → Lighting → Terrain → Buildings → Landmarks → Runtime → Navigation → Interactive → Atlas.

## Entry points

1. Executive Atrium™ holographic table hotspot (Command Center)
2. HUD pill: **Studio World Atlas™**
3. Overview module card: **STUDIO WORLD ATLAS**
4. Direct route: `/admin/studio/world-atlas`
