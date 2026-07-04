# studio os Workspace System

## Registered Workspaces

| ID | Display Name | Status | Studio Enabled |
|----|--------------|--------|----------------|
| `frontal-slayer` | FRONTAL SLAYER | active | yes |
| `sandbox` | SANDBOX | placeholder | no |
| `future-brand` | FUTURE BRAND | placeholder | no |
| `future-client` | FUTURE CLIENT | placeholder | no |

Registry: `src/workspaces/index.ts`

## Workspace Schema

Each Workspace implements `WorkspaceSchema` (`src/studio-os/workspace/types.ts`):

- Brand identity (name, logo, colors, typography, voice, rules)
- Module copy (subtitles per studio os core module)
- Permissions
- `studioEnabled` + `studioEntryPath`
- Metadata (industry tags for documentation only — not used by Core logic)

## Active Workspace

Persisted in localStorage: `studioOs_activeWorkspace_v1`

Default: `frontal-slayer` (backward compatible with existing Studio bookmarks).

## Switching

1. Admin Dashboard → **STUDIO** → `/admin/studio-os`
2. Select a Workspace
3. **FRONTAL SLAYER** → `/admin/studio/executive-command-center` (unchanged experience)
4. Placeholders → workspace shell (routing architecture demo only)

## Data Adapters

Workspace-specific seed data is loaded through `WorkspaceDataAdapter`:

- `frontalSlayerDataAdapter` — bridges existing `adminStudio*Demo.ts` seeds
- `emptyWorkspaceDataAdapter` — placeholders with no production data

Hooks like `useAdminStudioEditableState` read shows and content packs from the active adapter.

## Future Workspaces

New Workspaces add:

1. `src/workspaces/{id}/config.ts`
2. `src/workspaces/{id}/dataAdapter.ts`
3. Register in `src/workspaces/index.ts`

They inherit the same routing patterns under `/admin/studio-os/workspace/{id}/…`.
