# Component Registry™ V1.0 (Milestone 128)

**Route:** `/admin/studio/component-registry`

## Purpose

**Component Registry™** registers every reusable UI component inside Studio OS as a managed platform asset.

> Interfaces should be assembled—not recreated. Every visual component exists once and is reused everywhere.

## Core philosophy

- **Reuse first** — never duplicate Executive IA primitives or Mission Control patterns
- **Managed assets** — variants, dependencies, usage, version, owner, accessibility, design tokens
- **Assemble interfaces** — new modules compose from registered components

## What registers

| Category | Examples |
|----------|----------|
| **Card** | ExecutiveHeroCard, ExecutiveSecondaryCard, ExecutiveDepartmentCard |
| **Panel** | ExecutivePageShell, ExecutiveFocusPanel, AdminStudioStageShell |
| **Chart** | ExecutiveHealthRing, ExecutivePipelineViz, ExecutiveTrendSparkline |
| **Navigation** | ExecutiveIconNav, Registry Workspace Tab Bar |
| **Button** | eiaActionBtn |
| **Glass** | PerspectivePanel, PerspectivePanelHost |
| **Command Dock** | CommandDock |
| **Timeline** | ExecutiveTimelineShell, ExecutiveTimelineAnimationStyles |
| **Mission Control Widget** | MissionControl*Panel pattern |
| **Loading** | LoadingScreen |
| **Brand Asset** | StudioOsBrandTagline |
| **Animation** | Timeline animation styles |
| **Input** | Registry Search Input |

## Component metadata

Every registered component tracks:

Variants · Dependencies · Usage surfaces · Version · Owner · Accessibility · Responsive rules · Design tokens · Animation rules · Interaction rules · Documentation · Reuse score

## Architecture

| Component | Path |
|-----------|------|
| Registry builder | `registry-builder.ts` — Executive IA, platform, Mission Control seeds |
| Registration API | `registration.ts` — `registerComponent()` |
| Discovery | `discovery-engine.ts` — `queryComponentRegistry()` |
| Profile builder | `registry-profile-builder.ts` |
| Command Dock | `dock-advisor.ts` |

## Reuse scores

Components score 82–100% based on platform adoption. ExecutivePageShell, ExecutiveHeroCard, CommandDock, and Mission Control panel pattern score highest.

## Command Dock

**`resolveComponentRegistryAdvice()`** handles component queries:

- *"Show Component Registry status."*
- *"Which reusable cards should I use?"*
- *"Explain component ExecutiveHeroCard."*
- *"List Mission Control widgets."*

## Sync chain

Documentation Governance → System Registry → **Component Registry**

**`system-registry/store`** triggers **`syncComponentRegistryFromSources`** · **boundary-sync** · chains to **Design Token Engine™**

## UI

- **`ComponentRegistryWorkspace`** — Overview · Catalog · Categories · Reuse Scores · Discovery · Health
- **`MissionControlComponentRegistryPanel`** in Legacy Wing
- Hook: **`useComponentRegistryState`**

## Storage

Demo localStorage: `studioOsComponentRegistry_v1`

## Brand voice

*"Assemble interfaces. Never recreate. Every component exists once."*

Accent: `#7C2D12`

## Developer integration

When building new Studio OS UI:

1. Search **`queryComponentRegistry('card')`** before creating new components
2. Compose from Executive IA primitives (M83)
3. Register new reusable components via **`registerComponent()`**
4. Mission Control panels follow: ExecutiveSecondaryCard + ExecutiveHealthRing + eiaActionBtn

## Relationship to System Registry™

| Registry | Scope |
|----------|-------|
| **System Registry™** | Every object, module, service, and system |
| **Component Registry™** | **Every reusable UI component** — design system layer |
