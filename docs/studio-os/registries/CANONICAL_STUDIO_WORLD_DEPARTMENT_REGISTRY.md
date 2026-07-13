# Canonical Studio World Department Registry

**Registry:** CanonicalStudioWorldDepartmentRegistry™  
**Version:** `canonical-department-registry.v1`

## Purpose

First-class registry of **global Studio World main departments**. These departments:

- Belong to Studio World itself
- Exist **once** globally
- Have **no** `organizationId` ownership
- Are **not** Industry Packs or founder HQ templates

## Record schema

Each canonical department includes:

| Field | Description |
|-------|-------------|
| `departmentId` | Stable canonical identifier |
| `slug` | URL-safe slug |
| `name` | Display name |
| `category` | Governed category (see below) |
| `purpose` | Department mission summary |
| `canonicalRole` | Role in Studio World architecture |
| `departmentClass` | Always `CANONICAL_STUDIO_WORLD_DEPARTMENT` |
| `blueprintTemplateId` / `blueprintRevision` | Blueprint Author binding |
| `founderRenderId` / `founderRenderRevision` | Master Founder Render |
| `commandDockProfile` / `workbenchProfile` | Shell placeholder maps |
| `socketProfile` | UI socket registry binding |
| `departmentModelRoute` | `nano-banana-pro-full-scene` |
| `departmentPromptVersion` | Versioned prompt contract |
| `lifecycleState` | DRAFT → PUBLISHED pipeline state |
| `scope` | Always `studio-world-global` |

## Categories (seeded)

| Category | Departments |
|----------|-------------|
| **World Creation** | Experience Lab, Blueprint Author, World Compiler, Construction Mode |
| **Creative Production** | Creative Director Studio, Material Lab, Lighting Studio, Composition Studio, Animation Studio, Character Studio |
| **Operations** | Command Center, AI Workforce Center, Asset Registry, Studio World Registry, Observatory |
| **Governance** | City Council, Permit Center, Quality Guard, Immune System |
| **Commerce** | Marketplace, Mod Registry, Certification Center |
| **Founder** | Founder Suite, Founder Dashboard, Founder Archive |

**Count:** 25 seeded canonical departments across 6 categories.

## Persistence

Migration: `supabase/migrations/20260713200000_canonical_department_generator.sql`

Tables:

- `studio_world_canonical_departments`
- `studio_world_department_charters`
- `studio_world_department_versions`
- `studio_world_department_blueprints`
- `studio_world_department_renders`
- `studio_world_department_composition_packs`
- `studio_world_department_socket_profiles`
- `studio_world_department_publications`
- `studio_world_department_dependencies`
- `studio_world_department_access_policies`

## Runtime source of truth

In-memory registry: `src/studio-os-core/canonical-studio-world/canonical-department-registry.ts`

UI renders **dynamically** from registry — never hardcoded static lists in React.
