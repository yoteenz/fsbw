# Current Landing / World-Entry Implementation

**Test 01 target screen** = SCENE 01 **Arrival** / world entry.

---

## Route

| Mode | URL |
|------|-----|
| Experience | `/projects/astral-world/experience/home` |
| Fast Track | `/projects/astral-world/debug/world/home` |

Router index redirects to `home` (`AstralWorldExperienceRouter.tsx`).

---

## Component chain

```
AstralWorldHomePage
  └─ ImmersiveRouteFrame
       └─ MobileArrivalScene
            ├─ (desktop) AwD01WorldEntryScreen + overlays
            └─ (mobile)  AwM01WorldEntryScreen + overlays
```

Overlays: `WhosHereWorldOverlay`, `TakeMeSomewhereWorldOverlay`.

---

## Desktop (AW_D_01_WORLD_ENTRY)

- **Stage:** 1536×1024 canonical (`awD01LayeredAssets.ts`); background **V2** authority
- **Layout:** Full-bleed environment + **percent-anchored** DOM overlays (hero, Astréa block, 3 destination rows, right rail actions)
- **Hero copy:** "Welcome to Astral World" / living world subtitle
- **Astréa block:** "You are entering" → linked title **Astréa** + district tagline
- **Destinations:** Tarot Suite, Coffee Shop, Astral Mall (order in DOM: suite, coffee, mall)
- **Right rail actions:** Who's Here (button), Take Me Somewhere (button), Find My Reader (link)
- **Nav:** D01 bottom nav component (desktop shell nav — see component file)
- **State:** `useAstralWorld()` — demo session avatar in header zones where anchored

---

## Mobile (AW_M_01_WORLD_ENTRY)

- **Stage:** 854×1842 canonical; background **V2** (`AW_M_01_WORLD_ENTRY_BACKGROUND_V2.png`)
- **Layout:** Layered stack — same narrative as desktop; avatar shell center; quick actions row
- **Quick actions:** Who's Here | Take Me Somewhere | Find My Reader
- **Bottom nav:** HOME · WORLD · JOURNAL · FRIENDS · PROFILE (`M01BottomNav`)
- **Note:** M01 hides duplicate shell mobile nav via CSS `:has(.aw-m01-layered)` (MEMORY)

---

## CTA system summary

| CTA | Desktop D01 | Mobile M01 |
|-----|-------------|------------|
| Destination enter | 3 anchored `Link` rows | 3 anchored `Link` rows |
| Enter Astréa | Title link + sr-only link | Title link + sr-only link |
| Who's Here | Right rail | Quick hit |
| Take Me Somewhere | Right rail | Quick hit |
| Find My Reader | Right rail link | Quick hit link |
| Meet My Friends | Via Who's Here overlay / nav | Bottom nav Friends |

---

## Visual assets (runtime)

- Background: `resolveAwD01BackgroundPath()` / `resolveAwM01BackgroundPath()` → `/astral-world/screen-masters/.../AW_*_BACKGROUND_V2.png`
- Legacy cinematic crops: `/astral-world/bg-desktop-cinematic.png`, `bg-mobile-cinematic.png`
- Icons: `AstralDestIcons.tsx` (SVG medallions)

---

## State connections

`AstralWorldProvider` wraps shell — presence, fixtures, path helper, overlays use same context.

---

## Legacy alternate (not current home)

`DesktopHomeReferenceLayout.tsx` / `MobileHomeReferenceLayout.tsx` — P0.E.2 **reference convergence** layouts (nav 248px + rail 328px, hero + cards mid-band). Retained for tests/history; **current home is layered D01/M01** (FT5.2).

---

## Screenshots

Not captured in this sprint (SITE00 dev server not running on audit VM). Founder should use live preview tunnel or run SITE00 locally for `/projects/astral-world/experience/home`. Reference PNGs in `references/` supersede stale screenshots for visual authority.
