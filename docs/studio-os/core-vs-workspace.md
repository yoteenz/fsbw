# Core vs Workspace — Separation Guide

What belongs in `studio-os-core` versus the workspace layer.

## Principle

**studio-os-core** = how StudioOS works (platform)  
**workspaces/** = who is using it (brand/client)

Frontal Slayer-specific knowledge must never leak into core. Core must be deployable as a standalone product with different workspaces plugged in.

## Belongs in studio-os-core

| Category | Examples |
|----------|----------|
| Workspace architecture | `WorkspaceSchema`, permissions model, registry injection |
| Context / provider | `WorkspaceProvider`, `useWorkspace` |
| Routing helpers | `STUDIO_OS_ROUTES`, `workspaceStudioModulePath` |
| Module registry | `STUDIO_OS_CORE_MODULES`, `StudioOsCoreModuleId` |
| Platform vocabulary | Workspace, Studio, Project, Content Pack, Asset |
| Shared schemas / types | Blueprint, Content Pack, Mission Control, Production, Distribution, Legacy, Asset shapes |
| Service interfaces | `StudioServiceResult`, `StudioServiceStub` |
| Provider adapters | AI provider state helpers, Asset Factory provider contracts |
| Permissions logic | `DEFAULT_WORKSPACE_PERMISSIONS`, `canAccessWorkspaceStudio` |
| Utilities | `scopeStorageKey`, `loadWorkspace`, `emptyWorkspaceDataAdapter` |
| Platform assets | Marble background, generic workspace icon (not brand logos) |

## Belongs in workspace layer (NOT core)

| Category | Frontal Slayer location |
|----------|----------------------|
| Brand colors | `workspaces/frontal-slayer/config.ts` → `colors` |
| Logo / thumb | `config.ts` → `logoSrc` |
| Brand voice & rules | `config.ts` → `brandVoice`, `brandRules` |
| Module subtitles / copy | `config.ts` → `moduleCopy` |
| Product catalog references | Demo utils + data adapter |
| Shows | `dataAdapter.ts` → `adminStudioShowsDemo` |
| Content packs | `dataAdapter.ts` → `adminStudioContentPacksDemo` |
| Studio hub cards / metrics | `dataAdapter.ts` → `adminStudioDemo` |
| Campaigns, talent, studios | `src/utils/adminStudio*Demo.ts` (workspace-scoped seeds) |
| Customer data | Supabase / admin pages (never in core) |
| Frontal Slayer prompts | Creative Director, Content Brain demo seeds |

## Data Flow

```
adminStudio*Demo.ts (Frontal Slayer seeds)
        ↓
frontal-slayer/dataAdapter.ts (implements WorkspaceDataAdapter)
        ↓
workspaces/index.ts (registry)
        ↓
studio-os-core/workspace/loader.ts
        ↓
WorkspaceProvider → useWorkspace() → admin UI components
```

Core components call `useWorkspace()` for brand copy and `dataAdapter` for seed lists. They do not import `adminStudio*Demo.ts` directly.

## Placeholder Workspaces

`sandbox`, `future-brand`, and `future-client` prove the architecture:

- Minimal `WorkspaceSchema` via `createPlaceholderWorkspace()`
- `emptyWorkspaceDataAdapter` — no brand data
- `studioEnabled: false` — studio modules disabled
- Shell route only at `/admin/studio-os/workspace/{id}`

## Migration Checklist (for new modules)

When adding a StudioOS module:

1. Add module ID to `studio-os-core/core/modules.ts` if platform-wide.
2. Add platform types to `studio-os-core/types/` if the shape is reusable.
3. Add module copy key to workspace `config.ts` (brand subtitles).
4. Keep demo/seed data in `src/utils/` or workspace `dataAdapter.ts`.
5. Import platform APIs from `studio-os-core`, not from demo files.

## Anti-patterns

- Importing `adminStudioShowsDemo` from core or shared components
- Hardcoding `#EB1C24` or "FRONTAL SLAYER" in core
- Putting workspace registry inside `studio-os-core` (registry lives in `workspaces/index.ts`)
- Removing or renaming `/admin/studio/*` routes for Frontal Slayer
