# studio os Developer Guide

## Adding a New Workspace

1. Create `src/workspaces/my-brand/config.ts` implementing `WorkspaceSchema`.
2. Create `src/workspaces/my-brand/dataAdapter.ts` with shows, content packs, hub cards (or empty stubs).
3. Register in `src/workspaces/index.ts` (`WORKSPACE_REGISTRY` + `DATA_ADAPTERS`).
4. Set `studioEnabled` and `studioEntryPath` appropriately.

## Making a Module Workspace-Aware

1. **Copy / labels** — read from `useWorkspace().getModuleSubtitle('module-id')` or `workspace.moduleCopy`.
2. **Seed data** — expose via workspace data adapter; avoid importing brand-specific demo files from Core.
3. **Persistence** — use `readStudioJson` / `writeStudioJson` (automatically workspace-scoped).

## Platform Configuration

Rename the platform in one place only:

```typescript
// src/studio-os/config/platform.ts
export const STUDIO_OS_PLATFORM = {
  name: 'studio os',
  tagline: 'The Operating System for Modern Brands',
  owner: 'VXD Inc.',
};
```

## Asset Separation

| studio os Assets | Workspace Assets |
|-----------------|------------------|
| `src/studio-os/core/assets.ts` | Workspace config `logoSrc`, brand materials |
| UI placeholders, marble bg | Products, studios, talent, campaigns, prompts |

## Do Not

- Hardcode brand names inside `src/studio-os/`
- Put Frontal Slayer knowledge in `docs/studio-os/`
- Redesign Frontal Slayer Workspace UI during platform refactors
