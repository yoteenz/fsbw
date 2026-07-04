# studio os Platform Architecture

studio os is the reusable multi-brand operating system that powers creative and production workflows for modern brands. It is owned by VXD Inc. and is independent from any single Workspace.

## Layer Model

```
studio os (platform)
  └── Workspace (company / brand / client)
        └── Brand configuration
        └── Projects · Content Packs · Assets
        └── Studio modules (Executive Command Center, Content Brain, etc.)
```

## Core Principles

1. **studio os Core** contains no Workspace-specific knowledge.
2. **Workspace Layer** holds all brand data: voice, products, shows, talent, templates, campaigns.
3. **Frontal Slayer** is the first production Workspace; it preserves legacy `/admin/studio/*` routes.
4. Platform name and tagline live in `src/studio-os/config/platform.ts` only.

## Code Layout

| Path | Purpose |
|------|---------|
| `src/studio-os/` | Platform core — config, vocabulary, modules, context, routing |
| `src/workspaces/` | Workspace registry and per-workspace configs |
| `src/workspaces/frontal-slayer/` | First Workspace — brand config + data adapter |
| `src/pages/admin/studio-os/` | Workspace selection and placeholder shells |
| `src/pages/admin/studio/` | Frontal Slayer Studio UI (unchanged UX) |

## Workspace Context

All admin routes run inside `WorkspaceProvider` (`AdminGuard`). Modules should consume:

- `useWorkspace()` — active workspace schema, data adapter, switching
- `getActiveWorkspaceDataAdapter()` — non-React data access (storage, list functions)

## Storage

Studio editable state is scoped per Workspace: `studioOs_ws_{workspaceId}_{key}` with legacy key migration.

## Routing

| Route | Purpose |
|-------|---------|
| `/admin/studio-os` | studio os entry — select Workspace |
| `/admin/studio-os/workspace/:id` | Placeholder workspace shell |
| `/admin/studio/*` | Frontal Slayer Studio (legacy paths preserved) |

See also: [Workspace System](./WORKSPACE_SYSTEM.md), [Vocabulary Guide](./VOCABULARY.md).
