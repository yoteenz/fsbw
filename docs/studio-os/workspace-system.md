# studio os Workspace System

How workspaces are defined, registered, switched, and loaded.

## Registered Workspaces

| ID | Display Name | Status | Studio Enabled | Entry Path |
|----|--------------|--------|----------------|------------|
| `frontal-slayer` | FRONTAL SLAYER | active | yes | `/admin/studio/mission-control` |
| `sandbox` | SANDBOX | placeholder | no | `/admin/studio-os/workspace/sandbox` |
| `future-brand` | FUTURE BRAND | placeholder | no | `/admin/studio-os/workspace/future-brand` |
| `future-client` | FUTURE CLIENT | placeholder | no | `/admin/studio-os/workspace/future-client` |

## Folder Layout

```
src/workspaces/
├── index.ts                 # Registry + configureWorkspaceRegistry()
├── _shared/
│   └── placeholder.ts       # Shared placeholder factory
├── frontal-slayer/
│   ├── config.ts            # Brand schema (colors, copy, module subtitles)
│   └── dataAdapter.ts       # Bridges adminStudio*Demo seeds
├── sandbox/config.ts
├── future-brand/config.ts
└── future-client/config.ts
```

## Workspace Schema

Each workspace implements `WorkspaceSchema` from `studio-os-core/workspace/types.ts`:

- Brand identity (name, logo, colors, typography, voice, rules)
- Module copy (titles/subtitles per studio os core module)
- Permissions (`canAccessStudioModules`, etc.)
- `studioEnabled` + `studioEntryPath`
- Metadata (industry tags for documentation)

## Registry Injection

`studio-os-core` does not import workspace folders directly. Instead:

1. `src/workspaces/index.ts` builds `WORKSPACE_REGISTRY` and `DATA_ADAPTERS`.
2. On module load it calls `configureWorkspaceRegistry({ getWorkspaceById, getWorkspaceDataAdapter, isKnownWorkspaceId, listWorkspaces })`.
3. `AdminGuard` imports `../workspaces` before `WorkspaceProvider` so the registry exists at runtime.

## Active Workspace Persistence

- **Key:** `studioOs_activeWorkspace_v1` (localStorage)
- **Default:** `frontal-slayer` (preserves existing Studio bookmarks)
- **Scoped storage:** `scopeStorageKey(baseKey)` prefixes keys with active workspace ID

## Switching Flow

1. **Organization operator:** Admin Dashboard → **HEADQUARTERS** → `/admin/headquarters` → Mission Control
2. **Portfolio owner:** Admin Dashboard → **STUDIO ADMINISTRATION** → `/admin/studio-os/administration`
3. Select a workspace card from Studio Administration or Workspace Registry
4. **Frontal Slayer** → `/admin/studio/mission-control`
5. Other organizations → `/admin/studio-os/workspace/{id}/…`

## Data Adapters

`WorkspaceDataAdapter` (defined in `studio-os-core`) is the contract for workspace seed data:

```typescript
interface WorkspaceDataAdapter {
  shows: { listDefaults(); getById(id) };
  contentPacks: { listDefaults(); getById(id) };
  studioHub: { cards; dashboardItems; dashboardMetric };
}
```

| Adapter | Workspace | Data source |
|---------|-----------|-------------|
| `frontalSlayerDataAdapter` | frontal-slayer | `adminStudio*Demo.ts` seeds |
| `emptyWorkspaceDataAdapter` | placeholders | Empty arrays / zero metrics |

Hooks like `useAdminStudioEditableState` read shows and content packs from `getActiveWorkspaceDataAdapter()`.

## Adding a New Workspace

1. Create `src/workspaces/{id}/config.ts` implementing `WorkspaceSchema`.
2. Create `src/workspaces/{id}/dataAdapter.ts` implementing `WorkspaceDataAdapter`.
3. Register both in `src/workspaces/index.ts`.
4. Placeholder workspaces can use `createPlaceholderWorkspace()` from `_shared/placeholder.ts`.

New workspaces inherit routing patterns under `/admin/studio-os/workspace/{id}/…` unless they set a custom `studioEntryPath`.

## Routing Helpers

From `studio-os-core/workspace/routes.ts`:

- `STUDIO_OS_ROUTES` — workspace shell paths
- `workspaceStudioModulePath(workspaceId, segment)` — Frontal Slayer keeps legacy `/admin/studio/{segment}`; other workspaces use `/admin/studio-os/workspace/{id}/studio/{segment}`
- `workspaceStudioEntryPath(workspaceId, entryPath)` — resolves post-selection landing route
