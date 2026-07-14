# Studio World Navigation Master Icon Sheet — Sprint 02 Phase 1

**Status:** Production master artwork created  
**Category:** Navigation (first canonical master sheet)  
**Design family:** `studio-world-navigation-chrome-v1`

## Purpose

Permanent **master artwork** for all Studio World Navigation icons. This is **not** a runtime sprite and **not** wired into Experience Lab or production registry yet.

## Assets

| Asset | Path |
|-------|------|
| Master sheet (10240×10240) | `src/assets/studio-world/navigation/icons/source/studio-world-navigation-master-sheet.png` |
| Generation summary | `src/assets/studio-world/navigation/icons/source/_navigation-master-generation-summary.json` |
| Semantic registry | `src/features/studio-world/icons/navigation-master/navigation-master-icon-registry.ts` |
| Grid calibration (default 10×10) | `src/features/studio-world/icons/navigation-master/grid-calibration/navigation-master-grid-calibration-canonical.json` |
| Draft placeholders JSON | `src/features/studio-world/icons/navigation-master/navigation-master-icon-draft-placeholders.generated.json` |

## Grid

- **10 columns × 10 rows = 100 cells**
- **93 navigation icons** + **7 reserved blank cells** (row 9, columns 3–9)
- **1024px per cell** at 10240px sheet resolution
- Pure black background, no labels, no watermarks

## Design language

- Premium illuminated chrome outline
- White polished metal edges with subtle glow
- Outline-only — no fills, no internal gradients
- Uniform stroke weight and optical balance across all icons
- Luxury automotive instrument panel / Apple Vision Pro quality aesthetic

## Generation

```bash
node scripts/generate-studio-world-navigation-master-sheet.mjs
```

Regenerates master sheet PNG + draft placeholder JSON from registry + chrome path library (`scripts/lib/studio-world-chrome-nav-icon-paths.mjs`).

## Draft metadata (not production)

Draft placeholders are prepared via `navigation-master-icon-draft-bridge.ts`:

- `id`: `navigation.<camelCase>` (e.g. `navigation.home`)
- `category`: `navigation`
- `certification`: `draft`
- `version`: `v1`
- `stateSupport`: pending
- `themeSupport`: pending
- **Does NOT** call `registerIcon()` — production registry unchanged

## Next steps (founder workflow)

1. Review master sheet artwork in Calibration Editor (10×10 navigation grid)
2. Fine-tune `navigation-master-grid-calibration-canonical.json`
3. Slice to `navigation/icons/generated-v1/` (future generator script)
4. Certify icons through Icon Builder
5. Register certified icons into `StudioWorldIconRegistry`

## Non-goals (this sprint)

- No hover/active/disabled state artwork
- No SVG export
- No Experience Lab changes
- No runtime icon replacement
- No production registry registration

## Tests

`src/features/studio-world/icons/navigation-master/navigation-master-icon.test.ts`
