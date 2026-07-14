# Forensic Audit — Studio World Icon Grid Calibration (v6)

**Date:** 2026-07-14  
**Verdict:** Automatic sprite extraction and label-removal twin pipelines are **retired from production**. Founder-controlled grid calibration over the **unlabeled source pack** is now canonical.

## Confirmed corruption cause

Prior pipelines (v2–v5) repeatedly failed because they:

1. **Inferred glyph bounds automatically** inside equal 8×8 cells that did not match the physical icon grid on the master sheet.
2. **Removed printed labels** via twin derivation (`create-studio-world-unlabeled-source-twin.mjs`), risking protected-region drift and partial glyphs.
3. **Used confidence scores and parity PASS counts** as proof of visual correctness without founder grid alignment.
4. **Required per-icon crop rectangles** (v3 crop editor) — 64 tiny boxes instead of 8 row + 8 column boundaries.

Symptoms observed: clipped icons, neighboring-cell fragments, tiny glyphs, incorrect source regions, corrupted runtime PNGs.

## Source roles (v6)

| Asset | Path | Role |
|-------|------|------|
| **Unlabeled pack** | `src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png` | **Sole production extraction source** |
| **Labeled catalog** | `src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png` | Reference only — semantic identification |
| **Retired twin** | `src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png` | Rollback/debug only — not read by v6 generator |

## Retired from production path

- `scripts/create-studio-world-unlabeled-source-twin.mjs` (removed from `prebuild`)
- `scripts/generate-studio-world-icons-from-source-twin.mjs` (superseded)
- Automatic label detection / OCR / semantic guessing
- v3 per-glyph crop manifest as extraction authority
- v4 unlabeled equal-grid heuristic
- v2 auto-extract frozen pipeline as production source

Historical scripts remain in repo for forensic comparison.

## v6 architecture

```
UNLABELED SOURCE
      ↓
GRID CALIBRATION (founder-controlled row/column boundaries)
      ↓
64 SOURCE CELLS
      ↓
OPTIONAL PER-CELL OVERRIDES
      ↓
GLYPH-SAFE CROP (within cell only)
      ↓
TRANSPARENT 512×512 PNG
      ↓
SEMANTIC REGISTRY (row + column map)
      ↓
EXPERIENCE LAB V2 UI
```

## Key files

| Component | Path |
|-----------|------|
| Calibration model | `src/features/studio-world/icons/grid-calibration/StudioWorldIconGridCalibration.ts` |
| Canonical calibration JSON | `src/features/studio-world/icons/grid-calibration/studio-world-icon-grid-calibration-canonical.json` |
| Grid calibration editor | `/admin/studio/studio-world-icon-grid-calibration` |
| v6 generator | `scripts/generate-studio-world-icons-from-grid-calibration.mjs` |
| Generated assets | `src/assets/studio-world/experience-lab/icons/generated-v6/` |

## Founder approval gate

- Publishing requires explicit confirmation in the grid calibration editor.
- `EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED` remains `false` until founder visual sign-off.
- Automated validation does **not** prove visual correctness.

## Experience Lab layout

No changes to Command Dock, Workbench, viewport, anchors, Living Orb, or environment packages in this sprint.
