# StudioOS API Structure

Phase 2 server integration follows the existing Vercel `api/` pattern. StudioOS introduces Workspace scoping concepts for future APIs:

## Planned Conventions (not connected in this refactor)

```
/api/studio-os/workspaces          — list workspaces (admin)
/api/studio-os/workspaces/:id      — workspace metadata
/api/workspaces/:id/shows          — workspace shows
/api/workspaces/:id/content-packs  — workspace content packs
/api/workspaces/:id/assets         — workspace assets
```

## Current State

- No new API routes in this milestone.
- Client state: localStorage with workspace-scoped keys.
- Existing `api/admin/*` routes unchanged.

## Auth

Admin access continues via `AdminGuard` + `VITE_ADMIN_EMAILS` / `ADMIN_EMAILS`. Workspace permissions are client-side stubs in `WorkspaceSchema.permissions`.
