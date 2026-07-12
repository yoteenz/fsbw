# studio os Architecture

studio os is a standalone **Business Headquarters Operating System** for modern brands. Frontal Slayer is one organization running on it — not the root application.

**Platform philosophy:** [Headquarters Engine™](./headquarters-engine.md) · [Platform Vision](./platform-vision.md)

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
| Studio Administration | `src/pages/admin/studio-os/administration/` | Portfolio control plane (registry, onboarding, headquarters types) |
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

- [Creative Services Roadmap](../studio-os/creative-services/CREATIVE_SERVICES_ROADMAP.md) — provider-agnostic generation (Planned)

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

**Phase 1 boundaries (2026-07-05):** `StudioWorkspaceGuard` locks legacy `/admin/studio/*` to Frontal Slayer HQ context. `headquarters-module-resolver.ts` glob-loads all HQ page modules for workspace-scoped routes. Platform auth via `studio-os-core/auth/` + `registerStudioOsAuthBridge()`. Org membership via Supabase `studio_os_org_memberships` + `GET /api/admin/studio-os-membership`. Registry callbacks: `bootstrapVisionEngine`, `isDynamicWorkspaceId` — core no longer imports `workspaces/`.

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

## Master Content Pipeline™ · Studio Production Engine™

Studio OS content products share a **production pipeline**, not a page-centric publishing workflow. The pipeline is the **canonical operating model** — products consume it; they do not own independent lifecycles.

**Lifecycle (gates):** DISCOVER → DEVELOP → ASSEMBLY → PRODUCTION → REVIEW → EXPANSION → APPROVAL → PUBLISH → MEASURE → LEARNING

**UX (departments):** The [Studio Production Engine™](./studio-production-engine.md) implements each gate as a **department workspace** inside Studio Headquarters. Users **travel** between departments with a **living Master Content Asset** — not a long scrolling report page.

| Concept | Role |
|---------|------|
| **Master Content Asset™** | Living object — single passport through all departments |
| **Derivatives** | Platform-specific outputs linked to the master asset |
| **Ten lifecycle gates** | Entry/exit criteria (Master Content Pipeline™) |
| **Ten departments** | Workspaces · tools · navigation (Studio Production Engine™) |
| **Asset passport** | Brief · research · versions · reviews · derivatives — never duplicated |

**Spec:** [master-content-pipeline.md](./master-content-pipeline.md) · [Gates](./master-content-pipeline-gates.md) · [Production Engine](./studio-production-engine.md) · [Departments](./studio-production-engine-departments.md)  
**Master Spec:** [studio-production-engine.yaml](./master-spec/studio-production-engine.yaml)

**Consumers:** Campaign Engine™ · Newsroom™ · Website Builder™ · Publishing Studio™ · Social Studio™ · Email Studio™ · Knowledge Library™ · Studio Intelligence™

## Related Docs

- [Studio Production Engine™](./studio-production-engine.md)
- [Department workspaces](./studio-production-engine-departments.md)
- [Master Content Pipeline™](./master-content-pipeline.md)
- [Lifecycle Gates Reference](./master-content-pipeline-gates.md)
- [Workspace System](./workspace-system.md)
- [Core vs Workspace](./core-vs-workspace.md)
- [Frontal Slayer Workspace Implementation](../frontal-slayer/workspace-implementation.md)
- [NDXBook Page 001 runbook](../NDXBOOK_PAGE_001_PIPELINE.md)
