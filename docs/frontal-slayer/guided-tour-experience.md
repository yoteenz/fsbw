# Frontal Slayer Guided Tour Experience

Permanent **presentation layer** for designers, collaborators, investors, agencies, and partners — not a redesign of customer UX.

## Activate

- **Launcher:** bottom-right when preview env or `VITE_GUIDED_TOUR_TOKEN` is configured
- **URL:** `?guidedTour=<VITE_GUIDED_TOUR_TOKEN>` or `?guidedTour=1` on preview
- **Record mode:** `?guidedTour=record` or launcher **🎥 Record**

## Modes

| Mode | Purpose |
|------|---------|
| ✨ Guided Tour | Cinematic auto-walkthrough · 6–8s per stop |
| 🎨 Creative Partner | Collapsible presenter panel with voiceover & talking points |
| 🎥 Record | Partner + slow timing + max quality flags for screen capture |
| 🎵 Luxury Audio | Optional ambient pad (muted by default) |

## Presentation behavior (when active)

- Hides mansion debug, panel debug, editor panels, tutorial overlays
- Nav shield during auto tour (prevents accidental clicks)
- Cinematic opening (fade from black · logo) and ending (**LUXURY WITHOUT LIMITS.**)
- Elevator transitions between desktop floors via tower nav
- Hotspot pulses on key interactive areas

## Core module

`src/workspaces/frontal-slayer/guided-tour/`

- `tourScript.ts` — full stop list with presenter notes
- `GuidedTourContext.tsx` — auto-advance engine
- `guided-tour.css` — presentation-only styles (`html[data-guided-tour="active"]`)

## Tour path (summary)

Opening → Homepage → Mansion intro → Concierge → Gallery → Lobby → Penthouse rooms → Build-A-Wig atelier flow → PSA & Founder suites → TV Lounge → Members → Rewards → Mobile mansion → Finale

Does **not** modify existing page components — overlay only.
