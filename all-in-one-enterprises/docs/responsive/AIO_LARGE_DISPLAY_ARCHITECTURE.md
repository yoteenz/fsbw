# AIO Large-Display Responsive Architecture

**Project:** All In One Enterprises Inc.  
**Layer:** Additive CSS (`src/styles/aio-large-display.css`)  
**Date:** 2026-08-17

---

## Purpose

Extend AIO’s existing mobile-first responsive system with a **large-display composition layer** so ultrawide and 4K monitors feel intentional—not like a stretched desktop page.

**Core rule:** Backgrounds may bleed full viewport; primary content must not expand forever.

---

## Existing breakpoint system (unchanged below 1600px)

| Tier | Width | Primary files |
|------|-------|----------------|
| Mobile | ≤767px | `aio-mobile.css`, `aio-homepage-mobile.css` |
| Tablet | 768–1023px | `aio-mobile.css` (desktop blocks forced) |
| Standard desktop | 1024–1599px | `aio.css` |

### Existing containers (pre–large-display)

| Token / class | Default |
|---------------|---------|
| `.aio-container` | `max-width: 1280px` |
| `.aio-container--wide` | `max-width: 1440px` |
| `.aio-header__inner` | `max-width: 1440px` |
| `.aio-hero__content` | `max-width: 1440px` |
| `.aio-hero__copy` | capped at 580px @ 1440px |
| `.aio-footer__grid` | `max-width: 1280px` |

### Hero art direction (standard desktop)

- Truck focal point via `background-position` stepping 68% → 74% → 78% (768 / 1024 / 1440)
- Headline hard cap `4.75rem` @ 1440px
- Copy block capped; gradient preserves left text zone

---

## New large-display tiers

| Tier | Query | Intent |
|------|-------|--------|
| **Large desktop** | `min-width: 1600px` | Modest container growth, hero height clamp, nav gap cap |
| **Ultrawide** | `min-width: 2200px` | Cinematic hero (more environment), typography hard caps, grid column caps |
| **Ultrawide 21:9** | `2200px + min-aspect-ratio: 21/9` | Extra environment reveal, lighter right gradient |
| **Super ultrawide** | `min-width: 3000px` | Freeze max content width (~1840px), stop gap growth |

---

## Design tokens (activated ≥1600px on `.aio-app`)

| Token | Large (1600) | Ultrawide (2200) | Super (3000) |
|-------|--------------|------------------|--------------|
| `--aio-content-max-wide` | 1440px | 1560px | — |
| `--aio-content-max-ultrawide` | 1560px | 1680px | 1840px |
| `--aio-hero-copy-max` | min(32vw, 680px) | min(26vw, 720px) | — |
| `--aio-nav-max` | 1560px | 1680px | 1840px |
| `--aio-nav-gap` | clamp … 2.25rem | clamp … 2.75rem | 2.75rem fixed |
| `--aio-page-gutter` | clamp … 4rem | clamp … 5rem | clamp … 5rem |
| `--aio-readable-width` | 65ch | 65ch | 65ch |
| `--aio-dashboard-max` | 1680px | 1800px | 1840px |

---

## Full-bleed vs content width

Pattern:

```html
<section class="aio-section aio-section--dark"> <!-- full bleed -->
  <div class="aio-container"> <!-- capped inner -->
    …
  </div>
</section>
```

Large-display layer **only increases** `.aio-container`, header inner, footer grid, and hero **content shell** max-widths—not section backgrounds.

---

## Hero rules (ultrawide)

1. **Copy block** stops growing (`--aio-hero-copy-max`).
2. **Headline** uses `clamp()` with **5.5rem** absolute max @ 3000px+.
3. **Height** uses `clamp(620px, 42vh, 860px)` — not viewport-height-only.
4. **Background position** shifts right (72–78%) to reveal sunset/road.
5. **Overlay** lightens on the right at 21:9 so environment reads cinematic.

Mobile hero (`AioHomepageHero`) is unchanged — hidden ≥768px.

---

## Navigation

- Black bar: full viewport width (unchanged).
- `.aio-header__inner`: centered, `--aio-nav-max`.
- Link gap: `--aio-nav-gap` with hard max on super ultrawide.

---

## Grids & auto-fill safety

At 2200px+, capped:

- `.aio-pathway-grid` → 3 columns, max ~380px/card, centered
- `.aio-office-metrics` → max 6 columns
- `.aio-int-grid`, `.aio-data-grid`, `.aio-sec-grid` → max 4 columns
- `.aio-mgmt-health-grid` → max 8 columns

---

## Auth

≥2200px:

- Form column: `max-width: 560px`, flex-basis capped
- Brand panel: flex-grow absorbs extra width
- Form fields do not stretch to full ultrawide

---

## Portal / Office / Document Vault

- `.aio-portal-dashboard`, `.aio-office-page`, `.aio-doc-vault-page` receive `--aio-dashboard-max` / `--aio-content-max-ultrawide` centering at 1600px+.

Future: vault three-pane layout (category | list | detail) can be added at 2200px+ only.

---

## Utilities (opt-in)

| Class | Role |
|-------|------|
| `.aio-readable` | `max-width: 65ch` |
| `.aio-content-shell` | Standard capped shell |
| `.aio-content-shell--wide` | Ultrawide cap |
| `.aio-content-shell--hero` | Hero content alignment |

---

## Test matrix

See `docs/refinement/ULTRAWIDE_RESPONSIVE_REPORT.md` and `scripts/validate-aio-viewports.mjs`.

---

## What we did NOT do

- No CSS `zoom` / root `transform: scale`
- No global single fixed width wrapper
- No changes below 1600px
- No typography unbounded `vw`-only scaling
- No homepage content/copy changes
