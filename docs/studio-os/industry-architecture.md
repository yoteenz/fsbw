# Industry Architecture & Expansion Center (Milestone 88)

Studio OS is a **Business Headquarters Operating System** — not a content platform, website builder, collection of apps, or industry-specific SaaS. Milestone 88 establishes how every organization receives a **Headquarters** and **expands** it over time.

**Canonical philosophy:** [Headquarters Engine™](./headquarters-engine.md)

## Core concepts

| Concept | Purpose |
|---------|---------|
| **Headquarters** | Every org owns a living business environment — grows via Expansions |
| **Industry** | Day-one selection (Creator, Beauty, Restaurant, …) drives **starter headquarters layout** |
| **Department Pack / Expansion** | Modular **business capability** — not a template or app |
| **Universal Marketing** | Every org receives Marketing — industry-aware insights and channels |
| **Expansion Center** | Install **Headquarters Expansions™** after launch |
| **Headquarters growth** | Installing an Expansion adds buildings, departments, concierges, KPIs, Command Dock capabilities |

## Canonical hierarchy

```
Headquarters → Buildings → Departments → Workspaces → Projects → Assets → Tasks
```

See [Headquarters Engine™](./headquarters-engine.md#canonical-hierarchy).

## Code layout

```
src/studio-os-core/industry-architecture/
  types.ts              — IndustryId, DepartmentPackDefinition, OrganizationArchitectureProfile
  industries.ts         — 21 industry definitions + workspace defaults
  department-packs.ts   — Creator, Beauty, Contractor, Restaurant, Medical, Agency, Marketing
  expansion-packs.ts    — Creator Studio, Sales CRM, Warehouse, Accounting, …
  pack-registry.ts      — Catalog helpers
  install-engine.ts     — mergePackIntoProfile, buildHeadquartersLayout
  store.ts              — Per-org localStorage + installDepartmentPack()
  dock-advisor.ts       — Command Dock expansion recommendations
  bootstrap.ts          — Seed profiles for known workspaces
```

## UI

- **Route:** `/admin/studio/expansion-center`
- **Component:** `src/components/admin/studio/expansion-center/ExpansionCenterWorkspace.tsx`
- **Shell:** M83 Executive IA (`ExecutivePageShell`, `ExecutiveHeroCard`, …)

## Organization onboarding flow

1. Organization selects **industry** (Expansion Center or auto from workspace id).
2. **Starter department packs** install automatically (`buildInitialOrganizationProfile`).
3. **Universal Marketing Department** always installs.
4. **Mission Control** remains HQ home; custom departments appear in Expansion Center **HQ Layout** tab.
5. **Expansion packs** (e.g. Creator Studio) install via Expansion Center — no migration, no new software.

## Command Dock

- On `/admin/studio/expansion-center` — expansion-focused suggested commands.
- On Mission Control — industry-aware suggestions via `listDockExpansionSuggestions()`.
- Natural language triggers (e.g. “post educational videos”) map to pack recommendations in `dock-advisor.ts`.

## Workspace defaults

| Workspace | Industry | Starter packs |
|-----------|----------|---------------|
| `ai-media` (NDXBOOK) | creator | Creator Pack + Marketing |
| `frontal-slayer` | beauty | Beauty Pack + Marketing |
| `vxd-inc` | agency | Agency Pack + Marketing |

## Conventions for future work

- Add new industries in `industries.ts`; add packs in `department-packs.ts` or `expansion-packs.ts`.
- Every pack must declare `outcome.departmentsAdded`, `conciergesAdded`, `navModuleIds`, `kpiLabels`, `commandDockCapabilities`.
- Do **not** expose irrelevant departments in HQ — filter via installed packs only.
- Expansion Center is the **consumer UX for Headquarters Expansions**; legacy Marketplace deal network remains separate. Growth purchases use **Expand Headquarters** language — see [Headquarters Marketplace™](./headquarters-marketplace.md).
