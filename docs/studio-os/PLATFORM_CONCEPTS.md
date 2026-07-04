# StudioOS Platform Concepts

## Operating System Metaphor

StudioOS is to brands what an OS is to applications:

- **Kernel** — workspace context, routing, storage scoping, module registry
- **Drivers** — service stubs (OpenAI, Fal, Resend, publishing) in `STUDIO_SERVICE_REGISTRY`
- **Applications** — Studio modules (Content Brain, Production, etc.)
- **User space** — Workspace brand configuration and assets

## Extensibility

1. **New Workspaces** — register config + data adapter
2. **New Core modules** — add to `STUDIO_OS_CORE_MODULES`, implement UI under `src/pages/admin/studio/`
3. **Workspace overrides** — `moduleCopy`, data adapter, brand rules

## Scalability Targets

StudioOS architecture supports unlimited Workspaces, brands, products, shows, studios, talent, projects, content packs, campaigns, and asset libraries — each isolated by Workspace ID.

## Industry Agnostic Core

Core modules use generic language. Beauty, hair, PSA, Lounge TV, and e-commerce references exist only in the Frontal Slayer Workspace config and data adapter.
