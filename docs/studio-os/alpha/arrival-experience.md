# Arrival Experience — Creative Direction Studio™ Alpha

**Discipline owners:** Cinematics · UX · Audio · Motion design  
**Duration:** 5s standard · 7s first visit ever  
**Entry object:** `portal-entry-cds`

---

## Design Intent

Arrival is not a loading screen. It is **stepping across a threshold into a creative headquarters**.

The founder must feel:

- The room was **waiting for them**
- The space is **expensive and intentional**
- Creative work **already lives here** (not an empty template)
- They are **welcomed**, not instructed

---

## Spawn Point

| Property | Value |
|----------|-------|
| Position | Entry Portal center — rear-left of room envelope |
| Orientation | Facing +X into room (toward Mood Wall) |
| Foot surface | Stone floor — reflection visible immediately |
| Collision | Walk enabled after settle (5s) — no movement during arrival |
| UI | **None** — no progress bar chrome · no "Loading department" text |

---

## Arrival Sequence — Standard (5 seconds)

| Phase | Time | Camera | Environment | Audio | Orb |
|-------|------|--------|-------------|-------|-----|
| **Materialize** | 0.0s | Static at portal | Floor reflection fades in · ambient 0% | Silence → room tone begins | Idle |
| **Reveal** | 0.5–2.0s | Dolly forward + slight rise · `arrival` → `hero` | Ceiling bloom · Mood Wall fills frame | Ambient rises to 8% | — |
| **Identity** | 2.0–3.0s | Hold hero | Mood Wall crossfade neutral → Project/Genome mood · Brief pins illuminate sequential | 12% | — |
| **Greeting** | 3.0–4.0s | Begin descend toward primary | Orb pedestal pulse · 15° rotate toward founder | Orb sting + voice | Full greeting line |
| **Settle** | 4.0–5.0s | `hero` → `primary` · Timeline focus | Project hydrates on table (if bound) | Ambient 20% · ACTIVE | Pulse complete |

**State transition:** `ASSEMBLING` → `GENOME_INJECTING` → `ACTIVE` during phases 2–5.

---

## Arrival Sequence — First Visit Ever (7 seconds)

Extends phases 3–5:

| Addition | Timing |
|----------|--------|
| Orb extended introduction | +1.5s — names zones without modal |
| Ambient zone reveal | +0.5s stagger — Brief glow · Timeline illuminate · Library extend · Sandbox clear · Observatory pulse |
| No tutorial overlay | Discovery by looking only |

Orb line (example): *"This is Creative Direction — your brief lives on the left wall, inspiration on the hero wall, and decisions on the timeline. I'm here when you need me."*

---

## Return Visit Variations

| Condition | Arrival Modification |
|-----------|---------------------|
| Pending approval | Camera nudges toward Timeline · approval glow on table edge |
| New references since last visit | Mood Wall shimmer on new pins before crossfade |
| Project mood shift | Mood Wall palette crossfade during Identity phase |
| Active blocker | Orb notification tone · subtle amber on Timeline |
| Founder Journey: deep work mode | Shorter arrival (3.5s) · no zone reveal · ambient only |

---

## First Impression Checklist (Art Direction)

The first frame after Materialize must communicate:

- [ ] **Double height** — ceiling volume visible
- [ ] **Hero wall scale** — Mood Wall dominates horizon
- [ ] **Luxury material** — stone floor reflection · not flat gray
- [ ] **Living light** — not uniform office fluorescents
- [ ] **Depth** — glass exterior wall visible right flank
- [ ] **No UI chrome** — zero web affordances in frame
- [ ] **Human scale** — portal threshold feels like a door, not a page load

---

## Camera Specification

| Preset | Focal feel | Use |
|--------|------------|-----|
| `arrival` | 35mm · low · slow dolly | Entry |
| `hero` | 50mm · slight low · Mood Wall hero | Reveal · Identity |
| `primary` | 40mm · waist height · Timeline work | Settle · default work |
| `orb` | 85mm · Orb center-right | Conversation |
| `ceremony` | 28mm · elevated wide | Approval |

**Easing:** Editorial cubic-bezier — no snap cuts except approval stamp.

**Rule:** No hard cut from portal to table. One continuous travel.

---

## Audio Design

| Layer | Arrival behavior |
|-------|------------------|
| Room tone | Editorial atelier · piano stem + air · 0→20% over 5s |
| Floor | Subtle footfall ready at settle — not during dolly |
| Orb voice | Genome register · warm · never sales tone |
| Ceremony | Not during arrival — reserved for approval |
| Exterior | Muffled world beyond glass — depth cue |

`prefers-reduced-motion`: skip dolly · crossfade spawn to primary · audio only greeting.

---

## What the Founder Does NOT See

- Login reminder banners
- Feature tour modals
- Breadcrumb navigation (`CREATIVE > DIRECTION`)
- Card grids or empty states with CTA buttons
- Skeleton loaders
- "Welcome to Studio OS" generic copy

They see **a room that already knows their project**.

---

## Handoff to Active Work

At settle (5s):

1. Camera rests on Timeline Table — primary work position
2. Walk collision enabled
3. Orb returns to idle orbit
4. Inspiration drop zone subtly brightens (affordance — not arrow)
5. Brief Wall pins visible in left periphery

Founder may go anywhere. Arrival **suggests** Timeline — does not **force**.

---

## Engineering Notes (Non-Code)

- Arrival is a **scripted camera path** + **state machine** — not a video file
- All surfaces are live meshes — crossfade uses real Mood Wall shader
- Project hydration uses real data — not placeholder lorem
- Entry Portal remains traversable backward only before settle — then forward journey

---

## Golden Rule Test

> A visitor with no Studio OS context enters. Within 3 seconds they know they are in a **creative studio**, not an app.

Pass: Mood Wall scale + light bloom + absence of web UI.  
Fail: Any dashboard element visible in first frame.

---

_Arrival — the threshold between software and place._
