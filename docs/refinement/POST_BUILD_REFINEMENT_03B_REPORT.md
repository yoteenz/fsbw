# Post-Build Refinement 03B — Report

**All In One Enterprises Inc.** · Homepage hero image replacement  
**Date:** 2026-08-16  
**Status:** Complete

---

## Previous hero asset

| Field | Value |
|-------|--------|
| Source | Unsplash stock URL (`photo-1601584115197-04ecc0da31d7`) |
| Delivery | Remote CDN via `appConfig.assets.heroImage` |
| Treatment | Center crop, 55% opacity, diagonal dark overlay |

---

## New hero asset

| Field | Value |
|-------|--------|
| Description | Approved All In One branded semi-truck at sunset (cab + trailer branding preserved) |
| Dimensions | 1774 × 887 px, PNG RGB |
| Repo path | `all-in-one-enterprises/public/brand/all-in-one-hero-truck.png` |
| Public URL | `/brand/all-in-one-hero-truck.png` |
| Config | `aioAppConfig.assets.heroImage` |

Source supplied by founder via Supabase Storage `live-preview/AIO/` (not referenced in repo docs to avoid secret-scan issues).

---

## Composition strategy

- **Left:** Brand copy + CTAs in `.aio-hero__copy` (max-width ~36rem)
- **Right:** Truck, mountains, sunset visible with lighter overlay fade
- **No** centered truck behind headline
- **No** image edits, recolor, or AI regeneration

---

## Positioning (`background-position`)

| Breakpoint | Position | Rationale |
|------------|----------|-----------|
| Mobile (<768px) | `68% center` | Keep cab + trailer visible; copy on darker left |
| Tablet (768–1023px) | `62% center` | Balance truck vs text |
| Desktop (1024–1439px) | `72% center` | Panoramic truck on right |
| Wide (≥1440px) | `78% center` | Preserve trailer branding + sunset |

`background-size: cover` on all breakpoints.

---

## Overlay adjustments

Directional **left → right** gradient (not full black wash):

- Desktop: `rgba(0,0,0,0.85)` far left → `0.03` far right
- Mobile: slightly stronger left (`0.88`) for text readability

Hero background opacity **removed** (was 0.55 on stock image) so sunset/truck remain visible.

Header background strengthened slightly (`0.94` alpha) for nav legibility over warm hero.

---

## Performance / LCP

- `<link rel="preload" as="image" href="/brand/all-in-one-hero-truck.png" fetchpriority="high">` in `index.html`
- PNG kept at source quality (~1.7MB) — no visible compression degradation
- CSS background (decorative); no lazy-load on above-the-fold hero
- Future optional: WebP derivative if bandwidth becomes a concern (not shipped to avoid quality loss)

---

## Unchanged (per spec)

- Tagline, brand paragraph, CTAs, nav IA, section structure (Refinements 01–03A)
- Gold button styling (Refinement 03A)
- Other route imagery (stage cards, Start Your Business, etc.)

Old Unsplash URL removed from homepage config only; stage-card CSS still uses separate Unsplash thumbnails (not homepage hero).

---

## Responsive QA

Manual verification on dev server (`:5173`):

- Desktop: truck right, copy left, trailer branding visible
- Mobile ~390px: cab visible, readable headline/paragraph, gold CTAs prominent
- No horizontal overflow; hero height unchanged

---

## Accessibility

- Hero background: `role="presentation"` + `aria-hidden="true"` (decorative)
- Marketing copy remains semantic HTML (H1, paragraph)

---

## Known issues

- PNG file size (~1.7MB) may affect LCP on slow networks; acceptable for brand-quality hero per founder brief. Consider CDN + modern format later without re-editing artwork.

---

## Files touched

- `public/brand/all-in-one-hero-truck.png` (new)
- `src/config/appConfig.ts`
- `src/sections/HeroSection.tsx`
- `src/styles/aio.css`
- `index.html`
