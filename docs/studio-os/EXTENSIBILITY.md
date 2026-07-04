# studio os Extensibility Guide

## Workspace Extensibility

- Add workspaces without modifying Core
- Placeholder workspaces validate routing before real brand onboarding
- Each workspace owns its own storage namespace

## Module Extensibility

When building a new Studio module:

1. Register in `STUDIO_OS_CORE_MODULES` with industry-neutral description
2. Add route under workspace studio path helper (`workspaceStudioModulePath`)
3. Read subtitles from `useWorkspace().getModuleSubtitle()`
4. Load seed data from `useWorkspace().dataAdapter`

## Brand Extensibility

Brand-specific prompts, products, shows, and campaigns belong in:

```
src/workspaces/{workspace-id}/
  config.ts       — brand identity + module copy
  dataAdapter.ts  — seed data bridges
```

## Documentation Extensibility

- Platform docs: `docs/studio-os/` (no brand knowledge)
- Workspace docs: `docs/frontal-slayer/` (owner's manual, brand rules)

When adding a new production Workspace, create `docs/{workspace-id}/` for internal brand documentation.
