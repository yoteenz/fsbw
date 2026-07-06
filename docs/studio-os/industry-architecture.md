# Industry Architecture & Expansion Center (Milestone 88)

Studio OS is a **Business Operating System** — not a content platform, website builder, or industry-specific app. Milestone 88 establishes the permanent architecture for how every organization is created, expanded, and evolves.

## Core concepts

| Concept | Purpose |
|---------|---------|
| **Industry** | Day-one selection (Creator, Beauty, Painting, Restaurant, …) drives headquarters layout |
| **Department Pack** | Modular business capability bundle (Creator Pack, Beauty Pack, Contractor Pack, …) |
| **Universal Marketing** | Every org receives Marketing — industry-aware insights and channels |
| **Expansion Center** | Install new packs after launch — Creator Studio, Sales CRM, Warehouse, … |
| **Headquarters expansion** | Installing a pack physically adds departments, concierges, KPIs, and Command Dock capabilities |

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
- Expansion Center replaces Marketplace as the **org growth** UX; legacy Marketplace modules remain for other purposes.
