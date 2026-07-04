# studio os Architecture

studio os is a reusable operating system for modern brands. This document describes the layered architecture introduced by the `studio-os-core` extraction.

## Layer Model

```
studio-os-core          ← reusable platform (industry-agnostic)
        ↓
workspace layer         ← registry + per-brand implementations
        ↓
frontal-slayer          ← first production workspace
        ↓
Frontal Slayer admin UI ← existing `/admin/studio/*` experience
```

### studio-os-core (`src/studio-os-core/`)

Platform logic only. No brand colors, logos, catalog, prompts, shows, talent, or customer data.

| Area | Path | Responsibility |
|------|------|----------------|
| Platform identity | `config/platform.ts` | studio os name, tagline, owner |
| Core modules | `core/modules.ts` | Canonical module registry and IDs |
| Vocabulary | `core/vocabulary.ts` | Industry-agnostic terms |
| Platform assets | `core/assets.ts` | System UI placeholders (not brand assets) |
| Workspace schema | `workspace/types.ts` | `WorkspaceSchema`, permissions, module copy shape |
| Workspace routing | `workspace/routes.ts` | Route helpers for workspace shell and studio modules |
| Workspace storage | `workspace/storage.ts` | Active workspace persistence, scoped localStorage keys |
| Workspace registry | `workspace/registry.ts` | Injection API — core never imports workspace implementations |
| Workspace loader | `workspace/loader.ts` | Resolves schema + data adapter for active workspace |
| Context | `context/WorkspaceProvider.tsx` | React provider and `useWorkspace` hook |
| Shared types | `types/*` | Blueprint, Content Pack, Mission Control, Production, Distribution, Legacy, Asset |
| Service contracts | `services/interfaces.ts` | `StudioServiceResult`, provider adapter shapes |
| Provider adapters | `providers/adapters.ts` | AI/media provider registry helpers |

Public entry: `src/studio-os-core/index.ts`

### Workspace layer (`src/workspaces/`)

Registers workspace implementations and bridges brand-specific data.

| Workspace | Path | Status |
|-----------|------|--------|
| Frontal Slayer | `frontal-slayer/` | Active production workspace |
| Sandbox | `sandbox/` | Placeholder (architecture proof) |
| Future Brand | `future-brand/` | Placeholder |
| Future Client | `future-client/` | Placeholder |

Registry: `src/workspaces/index.ts` — calls `configureWorkspaceRegistry()` on import.

### Frontal Slayer admin UI

Existing routes under `/admin/studio/*` are unchanged. Mission Control remains the workspace landing page for Frontal Slayer. Customer-facing Frontal Slayer pages are not modified by this architecture.

## Import Rules

1. **Platform code** imports from `studio-os-core` (or the deprecated `studio-os` shim).
2. **Workspace configs** import core types and permissions; never import other workspaces.
3. **Brand demo data** stays in `src/utils/adminStudio*Demo.ts` and is wired through `frontal-slayer/dataAdapter.ts`.
4. **AdminGuard** imports `src/workspaces` before mounting `WorkspaceProvider` so the registry is configured.

## Backward Compatibility

`src/studio-os/index.ts` re-exports `studio-os-core` for legacy import paths. New code should import from `studio-os-core` directly.

## Related Docs

- [Workspace System](./workspace-system.md)
- [Core vs Workspace](./core-vs-workspace.md)
- [Frontal Slayer Workspace Implementation](../frontal-slayer/workspace-implementation.md)
