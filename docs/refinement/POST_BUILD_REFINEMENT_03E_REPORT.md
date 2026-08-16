# Post-Build Refinement 03E — Report

**All In One Enterprises Inc.** · Custom service icon pack integration  
**Date:** 2026-08-16  
**Status:** Complete

---

## Master icon sheet received

| Field | Value |
|-------|--------|
| Source URL | Supabase live-preview upload |
| Stored copy | `public/brand/icons/services/_source-master-icon-sheet.png` |
| Dimensions | 1536 × 1024 px (RGBA) |
| Layout | 3 × 2 grid with labels (labels excluded from exports) |

The master sheet is **not** displayed in the UI — used only as extraction source.

---

## Icons extracted

Six individual transparent PNGs via automated crop (`scripts/extract-service-icons.py`):

1. White/near-white pixels → transparent  
2. Label band (bottom ~32% of each cell) excluded  
3. Artwork bounding box + 8 px margin  
4. Normalized to **256 × 256** canvas at **72% max fill** (optical padding ~14%)

---

## Individual asset paths

| File | Size |
|------|------|
| `public/brand/icons/services/aio-icon-start-business.png` | ~10 KB |
| `public/brand/icons/services/aio-icon-permits-compliance.png` | ~12 KB |
| `public/brand/icons/services/aio-icon-trucking-insurance.png` | ~16 KB |
| `public/brand/icons/services/aio-icon-dispatch.png` | ~14 KB |
| `public/brand/icons/services/aio-icon-move-freight.png` | ~15 KB |
| `public/brand/icons/services/aio-icon-get-paid-faster.png` | ~9 KB |

Canonical config mirror: `appConfig.assets.serviceIcons`

---

## Service → icon mapping

| Card | Icon artwork | Asset |
|------|--------------|-------|
| START MY BUSINESS | Building + tree | `aio-icon-start-business.png` |
| PERMITS & COMPLIANCE | Checklist document | `aio-icon-permits-compliance.png` |
| TRUCKING INSURANCE | Shield + truck + checkmark (standalone override 03E.1) | `aio-icon-trucking-insurance.png` |
| DISPATCH MY TRUCKS | Location pin + truck | `aio-icon-dispatch.png` |
| MOVE FREIGHT | Truck + speed lines | `aio-icon-move-freight.png` |
| GET PAID FASTER | Bills + coins | `aio-icon-get-paid-faster.png` |

---

## Final dimensions

| Layer | Size |
|-------|------|
| Source canvas | 256 × 256 px @ 72% artwork fill |
| UI render (mobile) | 48 × 48 px (`3rem`) |
| UI render (desktop) | 52 × 52 px (`3.25rem`) |
| Display | `object-fit: contain`, no stretch |

---

## Transparency verification

All six exports verified:

- RGBA with alpha channel  
- No white/black square backgrounds  
- No master-sheet labels or grid remnants  
- Black artwork only on transparent canvas  

---

## Optical sizing adjustments

Normalization uses **max-dimension scaling** to ~72% of 256 px canvas so wide (truck) and tall (document) icons appear visually balanced. Rendered at consistent container size with `object-fit: contain`.

Opaque fill ranges after normalization: ~69–70% width, ~41–69% height (geometry-dependent).

---

## Components updated

| File | Change |
|------|--------|
| `src/components/AIOServicePathwayCard.tsx` | Replaced inline SVGs with `<img src={pathway.iconSrc} alt="">` |
| `src/data/homePathways.ts` | Added `iconSrc` per pathway |
| `src/config/appConfig.ts` | Added `assets.serviceIcons` registry |
| `src/styles/aio.css` | Icon container 48–52 px, `object-fit: contain`, tighter icon→title gap |
| `scripts/extract-service-icons.py` | Reproducible extraction from master sheet |

**Preserved:** gold titles, gold EXPLORE, neutral body/status, white cards, routing, availability logic, Refinement 03C primary buttons.

---

## Mobile QA

**390 × 844** — PASS: custom icons visible, black on white, no background tiles, 2-column grid intact.

## Desktop QA

**1366+** — PASS: 3-column grid, crisp Retina-ready PNGs, consistent optical scale.

---

## Extraction issues

None. All six icons extracted cleanly without substitution or generic fallbacks.

---

## Known issues

None blocking success criteria.

---

## Re-extraction

If the master sheet is replaced, update `_source-master-icon-sheet.png` and run:

```bash
cd all-in-one-enterprises && python3 scripts/extract-service-icons.py
```

Requires `Pillow` and `numpy`.

**Trucking Insurance (03E.1):** use `_source-trucking-insurance-standalone.png` and `scripts/normalize-standalone-service-icon.py` — not the master sheet cell.

---

## 03E.1 — Trucking Insurance Icon Override

**Date:** 2026-08-16  
**Status:** Complete

### Original icon rejected

The master-sheet Trucking Insurance icon (shield + truck side profile) was too generic and did not clearly communicate commercial trucking insurance / protection.

### New standalone asset received

| Field | Value |
|-------|--------|
| Source URL | Supabase live-preview upload |
| Archived source | `public/brand/icons/services/_source-trucking-insurance-standalone.png` |
| Original dimensions | 1312 × 1199 px (RGBA) |
| Artwork | Semi-truck (front) + protective shield + checkmark |

### New asset path

`public/brand/icons/services/aio-icon-trucking-insurance.png` (same filename — replaces master-sheet extraction)

### Old asset replaced

Previous master-sheet extraction overwritten. Master sheet and other five icons unchanged. `extract-service-icons.py` updated to **skip** Trucking Insurance on re-extraction.

### Final dimensions

256 × 256 transparent canvas @ 72% max fill (61% × 70% opaque footprint — optically aligned with sibling icons).

### Transparency verification

PASS — white/near-white pixels removed; no background tile, halo, or crop boundary; black artwork only.

### Optical sizing adjustment

Standalone normalization via `scripts/normalize-standalone-service-icon.py` with same 72% fill target as 03E pack. Detail-heavy shield/truck/checkmark remains legible at 48–52 px UI render.

### Mobile QA

390 × 844 — PASS: truck, shield, and checkmark recognizable; aligned with neighboring cards; gold title + EXPLORE preserved.

### Desktop QA

1366+ — PASS: crisp at 52 px; optically consistent with five sibling icons.

### Cache verification

Same asset path retained (`/brand/icons/services/aio-icon-trucking-insurance.png`). File bytes replaced in repo; Vite/dev serves updated PNG immediately. Production cache clears on next deploy (`deploy now`).

### Issues

None.
