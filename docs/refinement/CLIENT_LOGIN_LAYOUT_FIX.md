# Client Login Layout Fix

**All In One Enterprises Inc.** · Responsive viewport positioning  
**Date:** 2026-08-16  
**Status:** Complete

---

## Root cause

**`.aio-portal` used `display: flex` with default `flex-direction: row` at all breakpoints.**

On mobile/tablet, this placed flex children **side-by-side** instead of stacked:

1. Debug banner (full-width block squeezed into a row cell)
2. Mobile top bar (~intrinsic width, left column)
3. Hidden sidebar
4. Main portal content (`flex: 1`, pushed to the **right column**)

The bottom nav was `position: fixed; left: 0; right: 0` — correctly spanning the viewport — while the main content column did not. This produced the reported split: large unused/light area on the left and Client Login / portal content pushed to the right.

This is the classic **empty column 1 / content in column 2** flex-row bug described in the refinement spec — not a login-form issue.

Secondary contributors (hardened in this fix):

- No explicit `width: 100%` / `overflow-x: clip` on the standalone app root
- Auth shell lacked safe-area padding and full-width constraints (affected `/login` when backend mode redirects unauthenticated users)

---

## Affected components

| File | Role |
|------|------|
| `src/layouts/AIOPortalLayout.tsx` | Portal shell — added `aio-portal__shell` wrapper |
| `src/styles/aio.css` | Portal, auth, standalone root layout rules |

---

## Affected layout / shell

- **Client Login CTA** → `/portal` (demo) or `/login` (backend redirect)
- **`AIOPortalLayout`** — primary bug surface (bottom nav + demo banner in screenshots)
- **`AIOAuthLayout`** — hardened for centered auth card at `/login`

---

## Before behavior

- Mobile: mobile bar + main content rendered in a horizontal flex row
- Large empty/light viewport region left of content
- Portal main column offset right; bottom nav still full width
- Auth pages could show partial-width background split on narrow viewports

---

## Corrected layout architecture

### Standalone root

```css
.aio-standalone-root {
  width: 100%;
  max-width: 100%;
  min-height: 100dvh;
  overflow-x: clip;
}
```

### Portal (mobile → tablet)

```
.aio-portal (flex column, 100% width)
├── debug banner (100%)
├── mobile bar (100%)
├── .aio-portal__shell (flex column → row at 1024px)
│   ├── sidebar (hidden mobile; 240px desktop)
│   └── main (flex 1, 100% width, bottom nav padding)
└── bottom nav (fixed full width)
```

### Portal (desktop ≥1024px)

- `.aio-portal__shell` becomes `flex-direction: row`
- Sidebar + main side-by-side intentionally (not an empty reserved column)

### Auth (`/login`, `/sign-up`, etc.)

- `.aio-auth` and `.aio-auth__shell` — `width: 100%`, safe-area padding
- `.aio-auth__main` — `max-width: min(440px, 100%)`, vertically centered card
- Single-column centered auth — no two-column empty split

---

## Mobile rules

- Portal column stack; no sidebar width reserved
- Main content `width: 100%`, `min-width: 0`
- Bottom nav clearance via `padding-bottom` on main
- Safe-area insets on mobile bar horizontal padding

---

## Tablet rules

- Same column stack below 1024px
- Wider card padding via `clamp()` — no desktop offset leak

---

## Desktop rules

- Portal: intentional sidebar + main row inside `.aio-portal__shell`
- Auth: centered card (~440px max) over full-width dark gradient

---

## Preview harness interaction

- Demo/debug banner remains unchanged (not redesigned)
- Banner is a full-width flex child at top of `.aio-portal` column
- No preview transform or fixed desktop canvas width applied by Vite config
- Cloud preview uses actual viewport width (`width: 100%` on shell)

---

## Horizontal overflow QA

After fix, portal and auth routes should not introduce `scrollWidth > clientWidth` from layout shells.

Checklist:

- [x] Portal `/portal` at 390px — full width, no right push
- [x] Auth `/login` at 390px — centered card
- [x] Desktop 1280px — portal sidebar + main balanced; auth centered

---

## iOS keyboard QA

- Auth card uses vertical flex centering in shell; on short viewports content remains scrollable via natural document flow
- No horizontal `transform` on layout containers
- Safe-area padding prevents double margin with notch devices

---

## Known issues

- Duplicate debug banner (App root + layout) pre-existed; not changed in this fix
- Office layout already used `.aio-office__shell` pattern — portal now matches
