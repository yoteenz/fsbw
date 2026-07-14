# Experience Lab Icon Presentation System

## Purpose

The extraction pipeline is **frozen**. PNG assets under `icons/generated/` are source art.

Runtime quality is controlled exclusively by the **Icon Presentation System**:

```
PNG Asset → ExperienceLabIconPresentation → ExperienceLabIcon → Button
```

## Canonical registry

**`StudioWorldIconPresentationRegistry`** in `experience-lab-icon-presentation.ts` is the single source of truth for all Studio World departments and Industry Packs.

Per-icon fields:

- `scale`, `offsetX`, `offsetY`
- `strokeWeight`, `opticalWeight`, `padding`
- `minimumSize`, `maximumSize`, `baselineAdjust`
- `scores` (presentation, centering, scale, padding, visualWeight, consistency, overall)

## Founder Optical Mode

Enable on `/admin/studio/experience-lab-icon-qa`:

1. Toggle **Founder Optical Mode**
2. Tap any icon to select
3. Nudge scale / offset / padding / optical weight with live sliders
4. **Copy export fragment** — Composer merges into registry via:

```bash
# Save fragment as patch.json then:
node scripts/apply-founder-icon-presentation-patch.mjs patch.json
node scripts/generate-icon-presentation-registry.mjs  # optional full regen from optical cert
```

Overrides persist in `localStorage` (`studio-world:icon-presentation-founder-overrides`) until exported.

## Comparison mode

Split overlay: **Current** vs **Canonical** registry with opacity slider.

## Regenerate registry baseline

```bash
node scripts/generate-icon-presentation-registry.mjs
```

Does **not** touch PNG assets or extraction scripts.

## Version

`studio-world-icon-presentation-v1`
