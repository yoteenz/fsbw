# Workspace Creation Engine v1.0

studio os can launch entire companies from blueprint templates — not hardcoded per-project folders.

## Entry points

- **Workspace Registry:** `/admin/studio-os`
- **Launch New Company:** `/admin/studio-os/create` (6-step wizard)
- **Blueprint Library:** `/admin/studio-os/blueprints`
- **Promotion Center:** `/admin/studio-os/promotion-center`
- **Workspace Dashboard:** `/admin/studio-os/workspace/{slug}/dashboard`

## AI Media pilot

The permanent reference pilot workspace (`ai-media`) is provisioned through the creation engine on platform bootstrap — same code path as the wizard. It validates features before promotion to Frontal Slayer.

## Promotion lifecycle

Develop → Deploy to AI Media → Production testing → Analytics → Bug fixes → Approval → Promote to Frontal Slayer → Release to all workspaces.

## Core modules

- `src/studio-os-core/workspace-creation/` — types, blueprints, engine, registry, executive team, promotion pipeline
- `src/hooks/useWorkspaceCreationEngine.ts` — React hook
- `src/workspaces/index.ts` — merges dynamic registry with static workspaces (Frontal Slayer unchanged)

## Blueprints (v1)

Ecommerce Brand · AI Media Company · SaaS Platform · Agency · Creator Brand · Education Business · Local Service · Consulting · Startup · Blank Workspace

Each blueprint provisions: dashboard, modules, Memory Bible, Creative DNA, Writing Bible, Knowledge Graph, Interactive Manual, onboarding, prompt library, automation, storage, analytics, approval workflows, asset folders, AI directors, documentation, workflow templates, reporting dashboards, and an AI executive team.
