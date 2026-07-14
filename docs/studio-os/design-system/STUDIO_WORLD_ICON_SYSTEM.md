# Studio World Icon System (V1 Foundation)

**Status:** Architecture foundation — SF Symbols equivalent for Studio World  
**Scope:** Permanent platform for 1,500+ future icons across all Studio World products

## Principle

Icons are **first-class objects**, not loose image assets. Every icon has identity, metadata, category, aliases, search terms, states, themes, versioning, and certification lifecycle.

## Module layout

| Layer | Path |
|-------|------|
| Platform core | `src/studio-os-core/studio-world-icon-system/` |
| Experience Lab bridge | `src/features/studio-world/icons/studio-world-icon-system-bridge.ts` |
| React provider | `src/features/studio-world/icons/StudioWorldIconProvider.tsx` |
| Manifest output | `public/studio-os/icon-system/icon-manifest.json` |

## Core services

- `StudioWorldIconRegistry` — `registerIcon()`, `getIcon()`, favorites, recently used
- `StudioWorldIconSearch` — name, keyword, alias, department, category, tag
- `StudioWorldIconThemeResolver` — Studio Dark, Light, Luxury Gold, Monochrome, Presentation, Accessibility
- `StudioWorldIconStateResolver` — Default, Hover, Active, … Future (architecture only)
- `StudioWorldIconLoader` — swappable backends (local SVG/PNG, sprite, CDN, asset package, AI)
- `StudioWorldIconManifest` — auto-generated manifest with checksums
- `StudioWorldIconVersionManager` — certified > v3 > v2 > v1 resolution
- `StudioWorldIconDiagnostics` — registry health analysis

## Integration APIs (architecture)

```typescript
resolveRuntimeIcon({ iconId, state, theme, device, sizePx })
resolveWorkbenchIcon({ toolId, departmentId, state, device, sizePx })
resolveCommandDockIcon({ slotId, state, device, sizePx })
resolveDepartmentIcons(departmentId)
```

Workbench and Command Dock must **never** import image files directly — they call registry resolvers.

## Categories (18 canonical)

Navigation · Workspace · AI · Production · Review · Assets · Marketplace · Collaboration · Devices · System · Analytics · Automation · Cloud · Security · Media · Brand · Studio World Exclusive · Future

## Non-goals (V1)

- No Experience Lab redesign
- No icon artwork regeneration
- No runtime visual changes
- No calibration changes
- Existing `ExperienceLabIcon` component unchanged

## Bridge

Existing Experience Lab v6 grid icons are **bridged** into the canonical registry as certified objects. Runtime continues using `resolveProductionExperienceLabIconAsset` via loader backend.

## Routes (foundation)

- Diagnostics: `/admin/studio/studio-world-icon-system`
- Builder placeholder: `/admin/studio/studio-world-icon-builder`

## Manifest generation

```bash
node scripts/generate-studio-world-icon-manifest.mjs
```

## Tests

- `src/studio-os-core/studio-world-icon-system/studio-world-icon-system.test.ts`
- `src/features/studio-world/icons/studio-world-icon-system-bridge.test.ts`

## Device support (architecture)

Same registry serves mobile, tablet, desktop, TV, AR, VR with `deviceScales` design tokens — no duplicated asset model.
