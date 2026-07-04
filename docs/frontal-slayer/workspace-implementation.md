# Frontal Slayer — Workspace Implementation

How the first production StudioOS workspace is wired without changing the existing admin experience.

## Overview

Frontal Slayer is the reference workspace implementation. After the `studio-os-core` extraction, all brand-specific configuration lives under `src/workspaces/frontal-slayer/`. The admin UI at `/admin/studio/*` looks and behaves exactly as before.

## Files

| File | Role |
|------|------|
| `src/workspaces/frontal-slayer/config.ts` | `FRONTAL_SLAYER_WORKSPACE` schema — colors, typography, brand voice, module subtitles, entry path |
| `src/workspaces/frontal-slayer/dataAdapter.ts` | `frontalSlayerDataAdapter` — bridges existing demo seeds into `WorkspaceDataAdapter` |

## Configuration Highlights

- **ID:** `frontal-slayer`
- **Status:** `active`
- **Studio enabled:** yes
- **Entry path:** `/admin/studio/mission-control` (Mission Control landing)
- **Legacy routes:** `/admin/studio/*` preserved via `workspaceStudioModulePath()` in core

Brand colors (`#EB1C24` cherry red), Futura/Grace typography, and all module subtitles remain in `config.ts` only.

## Data Adapter

`frontalSlayerDataAdapter` maps platform contracts to existing demo utilities:

| Adapter field | Source |
|---------------|--------|
| `shows` | `adminStudioShowsDemo.ts` |
| `contentPacks` | `adminStudioContentPacksDemo.ts` |
| `studioHub` | `adminStudioDemo.ts` (hub cards, dashboard items, metric) |

No demo file paths changed in this refactor — only the import boundary moved to the workspace layer.

## UI Integration

Components use `useWorkspace()` from `studio-os-core`:

```typescript
const { workspace, dataAdapter, getModuleSubtitle } = useWorkspace();
// workspace.moduleCopy — brand subtitles
// dataAdapter.shows.listDefaults() — show catalog
```

Examples:

- `AdminStudioLayout` — workspace-aware navigation
- `MissionControlWorkspace` — executive operating room with brand copy
- `useAdminStudioEditableState` — reads shows/content packs from active adapter

## Routes (unchanged)

| Route | Module |
|-------|--------|
| `/admin/studio` | Redirects to Mission Control |
| `/admin/studio/mission-control` | Mission Control (landing) |
| `/admin/studio/executive-command-center` | Executive Command Center |
| `/admin/studio/blueprint-manager` | Blueprint Manager |
| `/admin/studio/asset-factory` | Asset Factory |
| `/admin/studio/*` | All other studio modules |

Workspace picker remains at `/admin/studio-os`.

## What Did Not Change

- Customer-facing Frontal Slayer pages
- Studio module UI layouts and styling
- Demo seed content in `adminStudio*Demo.ts`
- Production Builder, Director Mode, Executive AI Director, Campaign Orchestrator
- Supabase, commerce, or membership flows

## Adding Frontal Slayer–Only Data

1. Add or extend seeds in `src/utils/adminStudio*Demo.ts`.
2. Expose through `frontal-slayer/dataAdapter.ts` (extend `WorkspaceDataAdapter` in core first if the shape is platform-wide).
3. Do not add Frontal Slayer imports to `studio-os-core`.

## Related

- [StudioOS Architecture](../studio-os/architecture.md)
- [Workspace System](../studio-os/workspace-system.md)
- [Core vs Workspace](../studio-os/core-vs-workspace.md)
