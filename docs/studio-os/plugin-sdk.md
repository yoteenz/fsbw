# Plugin SDK™ V1.0 (Milestone 137)

**Route:** `/admin/studio/plugin-sdk`

## Purpose

**Plugin SDK™** transforms Studio OS from an application into an extensible platform where organizations, developers, and eventually partners can build custom capabilities.

> Studio OS should not attempt to build every feature. Instead, it should become a platform others can extend. Future innovation comes not only from Studio, but from the ecosystem built around it.

## Core philosophy

- **Platform, not monolith** — extend instead of building everything in core
- **First-class citizens** — every plugin registers pages, components, commands, and more
- **Sandboxed execution** — Policy Engine™ and Permission Engine™ always enforced
- **Marketplace choice** — organizations choose which plugins to install

## Plugin types

Organization Modules · Department Packs · Profession Packs · Marketplace Extensions · Dashboard Widgets · Command Dock Skills · Automation Actions · Workflow Nodes · Integrations · Reports · Analytics · Custom Pages · Custom Panels · Custom Commands · AI Tools · Developer Utilities · Future Plugins

## SDK capabilities

Register Pages · Register Components · Register Commands · Register Automations · Register Events · Register Permissions · Register Policies · Register Assets · Register Documentation · Register Academy Lessons · Register Search Entries · Register Tooltips

## Plugin sandbox

Plugins execute inside isolated environments. Prevented:

- Accessing unauthorized organizations
- Modifying protected systems
- Reading private data
- Bypassing permissions
- Violating policies

## Plugin marketplace

| Tier | Description |
|------|-------------|
| **Verified Plugins** | Security-reviewed and compatibility-tested |
| **Official Plugins** | Built and maintained by Studio OS |
| **Community Plugins** | Shared by the ecosystem with attribution |
| **Paid Plugins** | Premium extensions with licensing |
| **Free Plugins** | No-cost extensions |
| **Internal Organization Plugins** | Private org-built plugins |

## Architecture

| Component | Path |
|-----------|------|
| Plugin type catalog | `plugin-type-catalog.ts` — 17 extensible types |
| SDK capabilities | `sdk-capabilities-engine.ts` — registration surfaces |
| Marketplace | `marketplace-engine.ts` — tiers and installed plugins |
| Sandbox engine | `sandbox-engine.ts` — isolation and policy enforcement |
| Discovery | `discovery-engine.ts` — `queryPluginSdk()` |
| Command Dock | `dock-advisor.ts` |

## Command Dock

**`resolvePluginSdkAdvice()`** handles plugin queries:

- *"Install the Contractor Pack."*
- *"Update the Marketing Plugin."*
- *"Disable this plugin."*
- *"Show plugin compatibility."*

## Sync chain

… → Policy Engine → Permission Engine → Workspace Runtime → **Plugin SDK**

**`workspace-runtime/store`** triggers **`syncPluginSdkFromSources`** · **boundary-sync**

## UI

- **`PluginSdkWorkspace`** — Overview · Plugin Types · SDK Capabilities · Sandbox · Marketplace · Governance · Discovery
- **`MissionControlPluginSdkPanel`** in Legacy Wing
- Hook: **`usePluginSdkState`**

## Storage

Demo localStorage: `studioOsPluginSdk_v1`

## Relationship to other systems

| System | Role |
|--------|------|
| **Workspace Runtime™** | **Where plugins execute** — org-scoped sandbox |
| **Permission Engine™** | **Who may install/act** — capability grants |
| **Policy Engine™** | **What plugins may do** — organizational rules |
| **System Registry™** | **Discovery** — registered plugin surfaces |

## Brand voice

*Extend the platform. Innovate beyond Studio.*

Accent: `#7C3AED`
