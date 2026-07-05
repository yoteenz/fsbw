# studio os Architecture

studio os is a standalone operating system for modern brands. Frontal Slayer is one organization running on it — not the root application.

## Product Hierarchy

```
Studio OS                    ← platform (authentication, org management, permissions, …)
    ↓
Workspace Registry           ← catalog of organizations
    ↓
Organizations                ← Frontal Slayer, NDXBOOK, VXD INC, All In One Enterprise, …
```

### Application layers (code)

| Layer | Path | Responsibility |
|-------|------|----------------|
| Platform core | `src/studio-os-core/` | Reusable OS logic — modules, tenant isolation, feature inheritance |
| Application shell | `src/studio-os-core/application/` | Product hierarchy, portfolio access, application routes |
| Workspace registry | `src/workspaces/` | Per-organization configs and data adapters |
| Organization HQ UI | `src/pages/admin/studio/*` | Headquarters modules (Mission Control, production, …) |
| Studio Administration | `src/pages/admin/studio-os/administration/` | Portfolio control plane (registry, onboarding, templates) |
| Frontal Slayer admin | `src/pages/admin/dashboard/` | Commerce admin — **Headquarters** entry launches Studio OS HQ |

## Access model

| Role | Dashboard card | Entry route | Can see |
|------|----------------|-------------|---------|
| Organization operator | **HEADQUARTERS** | `/admin/headquarters` → Mission Control | Own organization only |
| Portfolio owner | **STUDIO ADMINISTRATION** + **HEADQUARTERS** | `/admin/studio-os/administration` | Workspace registry, all orgs, portfolio intelligence |

Portfolio owners: founder account + `VITE_PORTFOLIO_OWNER_EMAILS` env list.

## Layer Model (implementation)

```
studio-os-core          ← reusable platform (industry-agnostic)
        ↓
application/            ← product hierarchy, portfolio access, routes
        ↓
workspace layer         ← registry + per-brand implementations
        ↓
frontal-slayer          ← first production organization
        ↓
Headquarters UI         ← `/admin/studio/*` (organization consumes platform)
```

### studio-os-core (`src/studio-os-core/`)

Platform logic only. No brand colors, logos, catalog, prompts, shows, talent, or customer data.

| Area | Path | Responsibility |
|------|------|----------------|
| Platform identity | `config/platform.ts` | studio os name, tagline, owner |
| Application layer | `application/` | Product hierarchy, portfolio access, app routes |
| Feature inheritance | `feature-inheritance/` | Capabilities every org receives automatically |
| Tenant isolation | `tenant/isolation.ts` | Scoped storage per workspace domain |
| Core modules | `core/modules.ts` | Canonical module registry and IDs |
| Workspace schema | `workspace/types.ts` | `WorkspaceSchema`, permissions, module copy shape |
| Workspace routing | `workspace/routes.ts` | Route helpers for shell and studio modules |
| Workspace registry | `workspace/registry.ts` | Injection API — core never imports workspace implementations |

Public entry: `src/studio-os-core/index.ts`

### Workspace layer (`src/workspaces/`)

Registers organization implementations and bridges brand-specific data.

| Organization | Path | Status |
|--------------|------|--------|
| Frontal Slayer | `frontal-slayer/` | Active — commerce + media |
| NDXBOOK | `ai-media/` | Active — public media |
| VXD INC | `vxd-inc/` | Placeholder |
| All In One Enterprise | `all-in-one-enterprise/` | Placeholder |
| Sandbox | `sandbox/` | Placeholder |

Registry: `src/workspaces/index.ts` — calls `configureWorkspaceRegistry()` on import.

### Frontal Slayer admin vs Headquarters

- **Frontal Slayer admin** (`/admin/dashboard`) owns website, commerce, customers, orders, products, brand, marketing.
- **Headquarters** (`/admin/headquarters` → `/admin/studio/mission-control`) launches the organization's executive HQ inside Studio OS.
- Frontal Slayer does **not** own Studio OS functionality — it consumes it.

### Studio Administration

`/admin/studio-os/administration` — master control center for portfolio owners:

- Workspace Registry
- Organization creation and onboarding
- Organizational templates
- Portfolio intelligence
- Global settings (licensing, billing, plugins — architecture-ready)

Guard: `StudioAdministrationGuard` — non-portfolio users redirect to `/admin/headquarters`.

## Multi-tenant isolation

Every workspace is isolated via `tenantScopedKey()` and `scopeStorageKey()`. Separate knowledge, executives, concierges, customers, media, campaigns, analytics, permissions, branding, voice, AI memory, and organization genome per workspace.

## Feature inheritance

Every organization automatically receives platform capabilities (Mission Control, Production Studio, Render Queue, Screening Room, Publishing, Analytics, Library, Knowledge, Institute, Executive Council, Concierge Team, Campaign Engine, Automation). Dynamically instantiated — no company-specific platform implementations.

See `src/studio-os-core/feature-inheritance/registry.ts`.

## Import Rules

1. **Platform code** imports from `studio-os-core`.
2. **Workspace configs** import core types; never import other workspaces.
3. **Brand demo data** stays in workspace `dataAdapter.ts`.
4. **`AdminStudioWorkspaceGuard`** wraps Studio OS routes only — not `/admin/dashboard`.

## Future deployment

When Studio OS becomes its own application, remap `application/routes.ts` prefixes only. All business logic remains in `studio-os-core/`.

## Related Docs

- [Workspace System](./workspace-system.md)
- [Core vs Workspace](./core-vs-workspace.md)
- [Frontal Slayer Workspace Implementation](../frontal-slayer/workspace-implementation.md)
