# Studio World Icon State Engine (Sprint 04)

**Status:** Production architecture — procedural multi-state rendering  
**Scope:** One certified icon → every runtime state via GPU-friendly CSS

## Principle

There is only **one canonical artwork**. Every other appearance is a **runtime interpretation** — no duplicate PNGs, no AI regeneration, no manual Photoshop variants.

## Module layout

| Layer | Path |
|-------|------|
| State engine core | `src/studio-os-core/icon-state-engine/` |
| React component | `src/features/studio-world/icons/icon-state-engine/StudioIcon.tsx` |
| QA — Live State Tester | `/admin/studio/icon-state-tester` |
| QA — State Matrix | `/admin/studio/icon-state-matrix` |

## Core services

- `StudioWorldIconStateEngine` — orchestrates procedural rendering
- `StudioWorldIconRenderer` — CSS variables, classes, filters
- `StudioWorldIconAnimationController` — motion presets (none, fade, pulse, breathe, energy-flow, edge-trace, sparkle, illuminate, material-shift, soft-scale, magnetic-snap)
- `StudioWorldIconInteractionResolver` — pointer/keyboard → state
- `StudioWorldIconGlowEngine` — edge lighting and bloom
- `StudioWorldIconMaterialSystem` — chrome, glass, glow, reflection, bloom, shadow, edge
- `StudioWorldIconLightingEngine` — top-left highlight, bottom-right reflection
- `StudioWorldIconThemeModifier` — dark, light, luxury gold, presentation, accessibility
- `StudioWorldIconAccessibilityRenderer` — reduced motion, focus, touch targets
- `StudioWorldIconPerformanceManager` — GPU transforms, filter, opacity

## Procedural states (27)

`default` · `hover` · `active` · `focused` · `pressed` · `selected` · `disabled` · `locked` · `generating` · `loading` · `success` · `warning` · `error` · `approved` · `rejected` · `premium` · `new` · `favorite` · `pinned` · `ai` · `live` · `syncing` · `offline` · `archived` · `beta` · `experimental` · `future`

## Component API

```tsx
<StudioIcon
  id="search"
  state="active"
  theme="dark"
  size={32}
  device="desktop"
  animated
/>
```

Icons resolve through `resolveRuntimeIcon` + `renderIconState` — never import image files directly.

## Runtime tokens (CSS variables)

`--swi-glow` · `--swi-bloom` · `--swi-reflection` · `--swi-highlight` · `--swi-opacity` · `--swi-transition` · `--swi-duration` · `--swi-gold-edge` · `--swi-focus-ring` · `--swi-generating-energy` · `--swi-loading-speed` · etc.

## State highlights

| State | Rendering rule |
|-------|----------------|
| Default | Certified chrome — white glow, glass depth |
| Hover | Increased edge light, tiny bloom, ≤150ms |
| Active | Gold edge illumination only — chrome preserved |
| Focused | Outline + pulse, keyboard friendly |
| Selected | Persistent gold halo |
| Disabled | Smoked glass, reduced opacity |
| Locked | Frosted glass + tiny lock indicator |
| Generating | Energy flow on chrome outline — no spinner |
| Loading | Subtle breathe on glow |
| AI | White → electric blue → white shift |

## Device optimization

`desktop` (highest fidelity) · `tablet` · `mobile` (reduced glow) · `tv` (higher contrast) · `visionos` (prepared)

## Non-goals (Sprint 04)

- No Experience Lab redesign
- No Command Dock / Workbench layout changes
- No runtime icon replacement in production surfaces
- No duplicate artwork generation

## Tests

- `src/studio-os-core/icon-state-engine/icon-state-engine.test.ts`

## Relationship to Icon System V1

Sprint 01 registry + resolvers remain the asset authority. Sprint 04 adds the **state interpretation layer** on top — parallel to `ExperienceLabIcon` until certified libraries are promoted.
