# Post-Build Refinement 03C — Report

**All In One Enterprises Inc.** · Persistent gold CTA default + mobile touch fix  
**Date:** 2026-08-16  
**Status:** Complete

---

## Root cause

**CSS specificity cascade bug.**

The global reset:

```css
.aio-app button { background: none; border: none; }
```

has specificity **(0, 1, 1)** — one class + one element.

The primary variant:

```css
.aio-btn--gold { background: var(--aio-gold); }
```

has specificity **(0, 1, 0)** — one class only.

**Result:** In the default (non-interaction) state, the reset **won** and stripped the gold fill. Buttons appeared transparent / near-black against the dark hero and header.

The hover rule:

```css
.aio-btn--gold:hover { background: var(--aio-gold-dark); }
```

has specificity **(0, 2, 0)** — two classes (variant + pseudo) — which **beats** the reset. Gold only appeared while `:hover` was active (desktop mouse, or **mobile Safari sticky touch-hover** after tap).

After scroll/drag, sticky hover cleared → button reverted to invisible default. This matches the attached iPhone screenshots (STATE A gold while touched, STATE B near-black after scroll).

**Secondary issue:** Invalid `<Link><button>` nesting on public CTAs. React Router `Link` wrapping `AIOButton` `<button>` is not valid interactive HTML and contributed to awkward touch/focus behavior on mobile.

---

## Affected button component(s)

| Component | Role |
|-----------|------|
| `AIOButton.tsx` | Shared public button; now supports `to` (React Router `Link`) |
| Direct `Link` + `className="aio-btn aio-btn--gold"` | Portal/office CTAs (unchanged pattern, benefits from CSS fix) |

---

## Affected CSS / variant rules

| File | Change |
|------|--------|
| `src/styles/aio.css` | Scoped reset to `button:not(.aio-btn)` |
| `src/styles/aio.css` | Raised variant specificity: `.aio-app .aio-btn.aio-btn--gold` (+ `a` / `button` selectors) |
| `src/styles/aio.css` | Added tokens: `--aio-gold-hover`, `--aio-gold-active`, `--aio-focus-ring` |
| `src/styles/aio.css` | Added `:active`, `:focus-visible`, `:disabled` gold states |
| `src/styles/aio.css` | Desktop-only `:hover` under `@media (hover: hover) and (pointer: fine)` |
| `src/styles/aio.css` | `.aio-cta-row__link.aio-btn { width: 100%; }` for link-as-button rows |

---

## Previous default state

- Primary `<button class="aio-btn aio-btn--gold">`: **transparent / none background** (reset won)
- Gold visible only during `:hover` / sticky mobile touch-hover
- Client Login and hero CTAs nearly disappeared on dark surfaces after interaction

## New default state

- **Persistent gold fill** `#D4A017` (`--aio-gold`)
- **Black / near-black text** (`--aio-black`)
- **Subtle darker-gold border** (`--aio-gold-dark`)
- Visible on load, before tap, after scroll, after focus loss

---

## Interaction states

| State | Primary (`aio-btn--gold`) |
|-------|---------------------------|
| **Default** | `--aio-gold` fill, black text, `--aio-gold-dark` border |
| **Hover** (fine pointer only) | `--aio-gold-hover` (slightly brighter) |
| **Active / pressed** | `--aio-gold-active`, `translateY(1px)` |
| **Focus-visible** | Gold fill retained + black outline + gold focus ring |
| **Disabled** | Muted gold at 55% opacity, `not-allowed` |
| **Loading** | N/A dedicated state; gold family retained on existing buttons |

Secondary variants (`outline`, `outline-gold`, `outline-dark`) received the same specificity/scoping fix so outlines remain visible without hover.

---

## Mobile touch state

- Gold default **does not depend on `:hover`**
- `-webkit-tap-highlight-color: rgba(212, 160, 23, 0.25)` on `.aio-btn`
- Public CTAs converted from `<Link><button>` to `<Link class="aio-btn …">` via `AIOButton to=…`
- Verified: load → scroll → tap → release → scroll → gold persists

---

## Client Login fix

- Header: `AIOButton to={clientLogin} variant="gold" size="sm"` (single link control)
- Same persistent gold CSS as hero primary
- Mobile nav retains text link (unchanged IA)

---

## Routes / surfaces audited

| Surface | CTAs fixed |
|---------|------------|
| Homepage hero | START MY BUSINESS, SEE HOW IT WORKS |
| Homepage sections | Get My Roadmap, Start My Business, Explore Client Portal, final CTA row |
| Navigation | Client Login |
| `/start-your-business` | Hero CTA row |
| `/road-ready` | Hero + inline CTAs |
| `/client-portal` | Client Login hero + footer CTAs |
| `/about` | Road Ready™, Start Your Business |

Office/portal pages using raw `Link className="aio-btn aio-btn--gold"` benefit from the CSS fix without markup changes.

---

## iPhone Safari QA

**Environment:** Chrome DevTools mobile emulation 390×844 + local Vite (5173) / preview tunnel.

| Step | Result |
|------|--------|
| Load page, no touch | Hero + Client Login **gold** |
| Scroll down / back | **Gold persists** |
| Tap / hold primary CTA | Stays gold family (active shade) |
| Release + scroll | **Gold default returns** |
| No interaction → black/invisible | **Not observed** |

---

## Desktop QA

| Step | Result |
|------|--------|
| Default load | Gold primary + gold-outline secondary visible |
| Mouse hover | Slightly brighter gold (fine pointer) |
| Keyboard Tab focus | Gold fill + focus ring |
| Client Login header | Gold sm button visible on dark bar |

---

## Accessibility QA

- Black on gold contrast maintained for primary CTAs
- `:focus-visible` double ring (black outline + gold glow) on gold buttons
- Single interactive element per CTA (`Link` or `button`, not nested)
- Disabled state visually distinct (opacity), not confused with enabled

---

## Known issues

- None blocking 03C success criteria.
- Pre-existing `vite.config.ts` `fastRefresh` TypeScript warning unrelated to this refinement.

---

## Files changed

- `all-in-one-enterprises/src/styles/aio.css`
- `all-in-one-enterprises/src/components/AIOButton.tsx`
- `all-in-one-enterprises/src/components/AIONav.tsx`
- `all-in-one-enterprises/src/sections/HeroSection.tsx`
- `all-in-one-enterprises/src/sections/FinalCtaSection.tsx`
- `all-in-one-enterprises/src/sections/CustomerStageSection.tsx`
- `all-in-one-enterprises/src/sections/RoadReadyTeaserSection.tsx`
- `all-in-one-enterprises/src/sections/CommandCenterTeaserSection.tsx`
- `all-in-one-enterprises/src/pages/ClientPortalInfoPage.tsx`
- `all-in-one-enterprises/src/pages/StartYourBusinessPage.tsx`
- `all-in-one-enterprises/src/pages/RoadReadyPublicPage.tsx`
- `all-in-one-enterprises/src/pages/AboutPage.tsx`

**No** homepage structure, hero copy, imagery, routing, or backend changes.
