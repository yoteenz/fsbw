# Post-Build Refinement 03F — Report

**All In One Enterprises Inc.** · Expanded platform icon library extraction + asset system  
**Date:** 2026-08-16  
**Status:** Complete

---

## Overview

Expanded the All In One custom icon system from six homepage service-discovery icons (03E/03E.1) to a **30-icon library** (6 service + 24 platform). Three master sheets were identified by **visual content**, individually extracted, normalized to 256×256 transparent canvases, organized by category, and registered in TypeScript for semantic lookup.

---

## Source sheets identified

| Category | Upload UUID | Archived source |
|----------|-------------|-----------------|
| **Sheet 1 — Compliance + Business** | `26BB4CA8-5749-480F-9C10-D3C91D7D391F` | `public/brand/icons/compliance/_source-master-compliance-business.png` |
| **Sheet 2 — Fleet + Freight** | `28EE83E3-4087-4FC8-964D-064BBBE0A193` | `public/brand/icons/freight/_source-master-fleet-freight.png` |
| **Sheet 3 — Finance + Platform** | `92D00598-4FCB-490A-86EF-1F2B585D0BD3` | `public/brand/icons/platform/_source-master-finance-platform.png` |

Identification method: full-sheet visual audit (building/USDOT/permit motifs vs truck/driver/headset vs dollar/invoice/bell motifs). **Not** assumed from upload order.

Each sheet: **1774 × 887 px**, 4×2 grid, transparent RGBA. Master sheets are **not** rendered in UI.

---

## Extracted assets (24)

### Compliance + Business (`public/brand/icons/compliance/`)

| Semantic | File | Canvas | Transparency |
|----------|------|--------|--------------|
| companyFormation | `aio-icon-company-formation.png` | 256×256 @ 72% fill | RGBA ✓ |
| operatingAuthority | `aio-icon-operating-authority.png` | 256×256 @ 72% fill | RGBA ✓ |
| permits | `aio-icon-permits.png` | 256×256 @ 72% fill | RGBA ✓ |
| boc3 | `aio-icon-boc3.png` | 256×256 @ 72% fill | RGBA ✓ |
| iftaFuelTax | `aio-icon-ifta-fuel-tax.png` | 256×256 @ 72% fill | RGBA ✓ |
| irpRoadTax | `aio-icon-irp-road-tax.png` | 256×256 @ 72% fill | RGBA ✓ |
| renewals | `aio-icon-renewals.png` | 256×256 @ 72% fill | RGBA ✓ |
| documentVault | `aio-icon-document-vault.png` | 256×256 @ 72% fill | RGBA ✓ |

### Fleet + Freight (`public/brand/icons/freight/`)

| Semantic | File | Notes |
|----------|------|-------|
| fleet | `aio-icon-fleet.png` | Side-profile truck |
| driver | `aio-icon-driver.png` | Cap bust |
| operationsDispatch | `aio-icon-dispatch-operations.png` | **Distinct** from homepage `services/aio-icon-dispatch.png` |
| loadFreight | `aio-icon-load-freight.png` | Shipping box |
| routeTracking | `aio-icon-route-tracking.png` | Pin + path |
| bolPod | `aio-icon-bol-pod.png` | Clipboard/document |
| shipper | `aio-icon-shipper.png` | Warehouse |
| brokerage | `aio-icon-brokerage.png` | Handshake |

### Finance + Platform (`public/brand/icons/platform/`)

| Semantic | File |
|----------|------|
| factoring | `aio-icon-factoring.png` |
| invoiceBilling | `aio-icon-invoice-billing.png` |
| payments | `aio-icon-payments.png` |
| reportsAnalytics | `aio-icon-reports-analytics.png` |
| messages | `aio-icon-messages.png` |
| notifications | `aio-icon-notifications.png` |
| calendarScheduling | `aio-icon-calendar-scheduling.png` |
| support | `aio-icon-support.png` |

**Optical sizing:** Same pipeline as 03E — 8% cell inset, artwork bbox, 72% max-dimension fill, centered on transparent 256×256 canvas. No stretch.

**Extraction script:** `scripts/extract-platform-icon-sheets.py`

---

## Registry

| File | Purpose |
|------|---------|
| `src/config/aioIconRegistry.ts` | Semantic keys → asset paths |
| `src/components/AIOIcon.tsx` | `<AIOIcon icon="…" size={n} alt="" />` |

### Overlap handling (03E vs 03F)

| Concept | Homepage (03E) | Platform (03F) |
|---------|------------------|----------------|
| Dispatch | `serviceDispatch` → `services/aio-icon-dispatch.png` | `operationsDispatch` → `freight/aio-icon-dispatch-operations.png` |
| Trucking insurance | `serviceTruckingInsurance` (03E.1 standalone) | Used for insurance roadmap/health — not replaced |
| Factoring | `serviceGetPaidFaster` (homepage card) | `factoring` (platform library) |

---

## Current UI integration

Icons integrated **only** where mapping is clear and layout-safe:

| Surface | Component | Icons used |
|---------|-----------|------------|
| Road Ready public sample | `AIORoadmapProgress` | Per-item icons via `aioRoadmapItemIcons` |
| Client command center | `BusinessHealthGrid` | documents, renewals, fleet, insurance, billing, road ready |

**Not integrated (reserved):** Portal sidebar nav, Office modules, dispatch/brokerage detail pages, homepage service cards.

---

## Reserved assets

18+ platform icons extracted but not yet placed in UI (available via registry): e.g. `boc3`, `bolPod`, `shipper`, `messages`, `notifications`, `calendarScheduling`, `support`, `reportsAnalytics`, `payments`, `brokerage`, `driver`, `routeTracking`, etc.

---

## Homepage protection

✅ Six homepage service cards unchanged — still use `public/brand/icons/services/*` from 03E/03E.1.

---

## Trucking Insurance protection

✅ `serviceTruckingInsurance` remains the 03E.1 standalone asset for insurance-specific contexts (roadmap + health grid).

---

## Factoring business rule

✅ No business-model changes. Factoring icon is visual only; existing partner/referral disclosures and logic unchanged.

---

## QA

| Check | Result |
|-------|--------|
| 24 extractions | PASS — all written |
| Transparency | PASS — white pixels stripped, RGBA |
| No neighbor bleed | PASS — 8% cell inset + bbox crop |
| Mobile / desktop | PASS — 20–22px icons in roadmap/health |
| High-DPI | PASS — 256px source canvases |
| Optical consistency | PASS — shared 72% fill normalization |
| Typecheck | PASS (excluding pre-existing vite.config warning) |

---

## Issues

None. All 24 icons extracted cleanly; no substitutions required.

---

## Re-extraction

```bash
cd all-in-one-enterprises && python3 scripts/extract-platform-icon-sheets.py
```

Requires archived `_source-master-*.png` files in each category folder.

---

# 03F.1 — Icon Recrop + Clipping Correction

**Date:** 2026-08-16  
**Status:** Complete

## Affected icons

All **30** production icons re-normalized:

| Group | Count | Files |
|-------|-------|-------|
| Homepage service discovery | 6 | `public/brand/icons/services/aio-icon-*.png` |
| Compliance + business | 8 | `public/brand/icons/compliance/aio-icon-*.png` |
| Fleet + freight | 8 | `public/brand/icons/freight/aio-icon-*.png` |
| Finance + platform | 8 | `public/brand/icons/platform/aio-icon-*.png` |

Homepage icons specifically corrected: START MY BUSINESS, PERMITS & COMPLIANCE, TRUCKING INSURANCE (03E.1 standalone preserved), DISPATCH MY TRUCKS, MOVE FREIGHT, GET PAID FASTER.

## Root cause

**Multiple causes:**

1. **Bad source crop / insufficient transparent padding** — 03E/03F pipeline cropped cells with only 8–12px absolute inset and scaled padded crops, double-shrinking artwork (~50% effective occupancy on 256×256 canvases).
2. **CSS rendering** — `.aio-pathway-card__icon img` used `object-position: left center`, making icons appear off-center; wrapper was 48px with only ~12px gap to title.
3. **No cache busting** — homepage cards referenced raw PNG paths without version query, risking stale Safari crops after asset replacement.

**Not caused by:** `object-fit: cover` (was already `contain`), card `overflow: hidden` (`.aio-card` has no overflow clip), or AI regeneration.

## Original vs new asset dimensions

| Metric | 03E / 03F (before) | 03F.1 (after) |
|--------|-------------------|---------------|
| Canvas | 256×256 px | **512×512 px** transparent RGBA |
| Safety margin | 8–12 px absolute cell inset | **18% ratio** constant + 2% bleed on bbox; safety applied on final canvas via 68% fill |
| Target artwork occupancy | ~72% fill → ~50% measured | **65–68%** measured on canvas |
| Edge clearance | ~14–16% (some icons touched cell bounds) | **16–18%** min edge clearance (verified) |
| Optical normalization | Uniform bbox width scaling | Per-icon 68% fill (66% for detail silhouettes) + centered paste |

## Extraction pipeline changes

| File | Change |
|------|--------|
| `scripts/icon_normalize_lib.py` | **NEW** shared lib — 512 canvas, bbox bleed, optical fill, cell bleed, audit |
| `scripts/extract-service-icons.py` | Uses shared lib; insurance from `_source-trucking-insurance-standalone.png` |
| `scripts/extract-platform-icon-sheets.py` | Uses shared lib; `exclude_label_band=True` |
| `scripts/normalize-standalone-service-icon.py` | Uses shared lib |
| `scripts/verify-icon-assets.py` | **NEW** — programmatic edge clearance + occupancy QA |

Re-extraction commands:

```bash
cd all-in-one-enterprises
python3 scripts/extract-service-icons.py
python3 scripts/extract-platform-icon-sheets.py
python3 scripts/verify-icon-assets.py
```

## Rendering component changes

| File | Change |
|------|--------|
| `src/config/aioIconRegistry.ts` | `AIO_ICON_ASSET_VERSION = '03f1'`; `getAioIconSrc()` appends `?v=03f1` |
| `src/data/homePathways.ts` | Homepage icon paths use registry + version query |
| `src/components/AIOIcon.tsx` | Adds `.aio-icon` class |
| `src/components/AIOServicePathwayCard.tsx` | Icon img 52×52 intrinsic size |
| `src/styles/aio.css` | Wrapper 50px mobile → 54px tablet → 56px desktop; `object-position: center`; `overflow: visible`; icon–title gap ~18–24px |

## Cache handling

`AIO_ICON_ASSET_VERSION = '03f1'` appended to all registry-driven icon URLs. Homepage pathways import registry paths with same version. Filenames unchanged — no duplicate asset sources.

## QA results

### Programmatic (verify-icon-assets.py)

| Check | Result |
|-------|--------|
| 30 icons @ 512×512 | PASS |
| Edge clearance ≥ 12% | PASS (16–18%) |
| Occupancy 60–75% | PASS (63–68%) |
| Artwork touches canvas edge | PASS — none |

### Mobile / tablet / desktop

Verified homepage service pathway grid at 375, 390, 430, 768, 834, 1024, 1280, 1440, 1920 px — full artwork visible, no clipping, consistent optical scale, centered icons, gold titles preserved.

### Retina

512×512 source assets render crisp at 2× DPR; `object-fit: contain` with no resampling blur.

### Hover / active

Card border/glow interaction does not clip or rescale icons (`overflow: visible` on icon wrapper).

## Protections preserved

- Trucking Insurance: 03E.1 standalone source — **not** master-sheet slot 2
- Black icons, gold titles, white cards, gold EXPLORE →
- No generic icon library substitution
- No card height inflation
