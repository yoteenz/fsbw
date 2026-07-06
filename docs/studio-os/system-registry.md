# System Registry™ V1.0 (Milestone 127)

**Route:** `/admin/studio/system-registry`

## Purpose

**System Registry™** is the master registry of every object, service, module, feature, organization, component, automation, workflow, and system inside Studio OS.

> Nothing inside Studio OS should exist anonymously. Everything registers itself.

## Core philosophy

- **Master directory** — the operating system's master index
- **Register everything** — organizations, departments, modules, pages, routes, panels, services, APIs, automations, concierges, workflows, assets, and every future system
- **Full metadata** — unique ID, official name, description, category, owner, dependencies, status, version, permissions, documentation, health, lifecycle
- **System discovery** — powers search, documentation, architecture, developers, Command Dock, dependencies, and Studio Intelligence™

## What registers

| Category | Examples |
|----------|----------|
| Organization | Workspace tenant, departments |
| Module | All `STUDIO_OS_CORE_MODULES` |
| Feature | Documentation Registry entries |
| Page / Route | Admin Studio navigation surfaces |
| Panel | Mission Control preview panels |
| Service | Studio Intelligence Layer, boundary sync |
| API | Profile Image API |
| Automation | Organization boundary sync |
| Concierge | Chief Concierge, Chief of Staff |
| Workflow | Getting Started progression |
| Policy / Permission | Professional Trust, executive access |
| Knowledge / Marketplace | Institute courses, expert packs |
| Event | Organization boundary changed |

## Architecture

| Component | Path |
|-----------|------|
| Registry builder | `registry-builder.ts` — seeds from Core modules, doc registry, navigation, infrastructure |
| Registration API | `registration.ts` — `registerSystem()` |
| Discovery engine | `discovery-engine.ts` — `querySystemRegistry()` |
| Dependency graph | `dependency-graph.ts` — upstream/downstream impact |
| Profile builder | `registry-profile-builder.ts` |
| Command Dock | `dock-advisor.ts` |

## System metadata

Every registered system includes:

Unique ID · Official Name · Description · Category · Owner · Dependencies · Status · Version · Created/Updated Date · Permissions · Organizations · Related Systems · Documentation · Health · Lifecycle · Keywords · Aliases · Route · Module ID · Milestone

## Discovery surfaces

Search · Documentation · Architecture · Developers · Command Dock · Dependencies · Studio Intelligence · Future Milestones

## Command Dock

**`resolveSystemRegistryAdvice()`** handles master directory queries:

- *"What exists in Studio OS?"*
- *"Explain system Profession Brain."*
- *"What depends on Command Dock?"*
- *"List all modules in the System Registry."*

## Sync chain

Documentation Sync → Documentation Registry → Documentation Governance → **System Registry**

**`documentation-governance/store`** triggers **`syncSystemRegistryFromSources`** · **boundary-sync**

## UI

- **`SystemRegistryWorkspace`** — Overview · All Systems · Categories · Dependencies · Discovery · Registry Health
- **`MissionControlSystemRegistryPanel`** in Legacy Wing
- Hook: **`useSystemRegistryState`**

## Storage

Demo localStorage: `studioOsSystemRegistry_v1`

## Brand voice

*"Nothing exists anonymously. The operating system always knows what exists."*

Accent: `#0369A1`

## Developer integration

When adding a new milestone module:

1. Add to **`core/modules.ts`** and **`documentation-sync/system-registry.ts`**
2. System Registry auto-indexes on sync
3. Optional: **`registerSystem()`** for custom objects (panels, APIs, automations)
4. Query via **`querySystemRegistry()`** for discovery and dependency tracing

## Relationship to other registries

| Registry | Scope |
|----------|-------|
| **Documentation Sync** | Documentation surfaces and help content |
| **Documentation Registry™** | Feature documentation metadata |
| **Documentation Governance™** | Documentation quality and audits |
| **System Registry™** | **Everything in Studio OS** — master OS directory |
