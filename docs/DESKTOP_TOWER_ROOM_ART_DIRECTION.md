# Desktop Tower — Room Art-Direction Brief

**Status:** Living spec. Read before generating, replacing, or approving any desktop room background.
**Applies to:** The desktop "Frontal Slayer Tower" — every floor/zone hero environment.
**Goal:** Keep all rooms feeling like **one building** while making each room feel like a **distinct place**, render them so live UI/type can sit cleanly on top, and ship them light enough to preserve the "arrival" feeling.

---

## 0. Why this exists

The room renders today are beautiful and impressively **consistent** — they read as one luxury world. The risks are now the opposite of what you'd expect:

1. **Sameness.** Twelve rooms share near-identical architecture, composition, lighting and palette. The only thing separating most of them is the text on the wall. Walking the tower can feel like one room with different signage.
2. **Baked-in text.** Titles/taglines are rendered *into* the image (e.g. `BUILD-A-WiG ATELIER` — note the broken lowercase `i`). That locks typography to AI output, blocks renaming/translation, and risks colliding with live UI.
3. **File weight.** Hero PNGs run ~8MB each (export settings are inconsistent — some are ~2.3MB). On first load that undermines the cinematic entrance.
4. **Category drift.** Several rooms read as a generic luxury penthouse, not a **hair house**. (The Atelier and Penthouse rooms are the exception — they're unmistakably hair.)

This brief fixes all four with rules a human or an image model can follow.

---

## 1. How rooms are wired (where assets plug in)

| Concern | File |
|---|---|
| Floor + zone registry (ids, labels, order) | `src/constants/desktopFloors.ts` |
| Penthouse rooms | `src/constants/desktopPenthouseRooms.ts` |
| Zone → background URL map | `src/constants/desktopFloorZoneBackgrounds.ts` |
| Scene render + 880ms crossfade | `src/components/desktop-lobby/DesktopZoneRoomScene.tsx` |
| Background preload/cache | `src/utils/desktopRoomBackgroundCache.ts` |
| Glass UI material language | `src/components/desktop-lobby/ui/GlassPanel.tsx` |
| Storage bucket | Supabase `live-preview/Desktop/…` (public) |

A room is just a full-bleed background image plus overlaid React UI. **The image carries architecture, light and mood. Everything readable (titles, taglines, product, CTAs) should be live UI — not painted into the image.**

---

## 2. The shared DNA — non-negotiables (this is what makes it ONE building)

Every room **must** keep all of these. This is the brand's spatial signature; do not let a room drift from it.

1. **Material:** white/ivory **crystal-marble** (book-matched veining), polished to a soft mirror floor.
2. **Light fixtures:** cascading **crystal-bead chandeliers / strand curtains** as the recurring vertical motif.
3. **Seating:** white **tufted/quilted couture** upholstery (no other furniture style).
4. **Signature accent:** **red roses + scattered rose petals** on the floor — the only saturated red in the architecture. Brand red `#EB1C24` appears as roses/petals (and, in UI, type) — never as painted walls or large surfaces.
5. **Architecture:** **symmetrical** composition around a central focal feature; LED cove/strip lighting outlining structure.
6. **View:** floor-to-ceiling glass with a **city skyline** beyond (mood/time-of-day varies per floor — see §3).
7. **Metals:** brushed **champagne-gold / chrome** hardware only.
8. **Palette discipline:** white + crystal + marble + gold, red strictly as accent, sky as the only large color field.
9. **Cleanliness:** uncluttered, gallery-quiet; negative space is a feature, not a gap.
10. **Camera:** eye-level, one-point-ish perspective, centered. Same "lens" feel across all rooms (see §5).

> If you removed the wall text, a viewer should still say "same building." That test must pass — **and** the next test (§3) must also pass.

---

## 3. The vertical mood gradient — how rooms stop feeling identical

Differentiate by **light, time-of-day, density, and warmth**, not by changing the DNA. Tie the variation to **height in the tower**, so the mood *itself* tells you where you are and reinforces the "ascend to exclusivity" fantasy.

| Floor | Level | Mood register | Light temp | Time-of-day (skyline) | Density / energy |
|---|---|---|---|---|---|
| **Concierge** | L1 | Warm welcome, human, trust | Warm 3000K, golden | Golden hour / soft dawn | Intimate, calm, fewer fixtures |
| **Gallery** | L2 | Celebratory showcase, jewel-lit | Neutral 4000K + accent spots | Bright blue-hour / clear day | Display-forward, gallery-bright |
| **Lobby** | L3 | Grand daytime arrival, the "hero" | Bright 4500K, airy | Full daylight, luminous | Spacious, grand, balanced |
| **Penthouse** | L4 | Apex, exclusive, cinematic | Cool/dramatic 3500K + contrast | Night / dusk, city lights on | Moody, theatrical, high-contrast |

Rules:
- **Lower = warmer, softer, more welcoming. Higher = moodier, darker, more exclusive.** The skyline goes dawn → day → dusk → night as you climb.
- Within a floor, the **three zones** share that floor's register but vary the **focal feature** and **secondary lighting** (e.g. Lobby's Atelier is task-lit at the sample walls; the Lounge is screen-lit; the Grand Lobby is chandelier-lit).
- Keep contrast and exposure consistent *within* a floor so the 880ms crossfade between zones doesn't flash brightness.

---

## 4. Per-room identity matrix (all 12 rooms)

Each room keeps the DNA (§2) + its floor's mood (§3), and adds a **unique focal feature** and **hair-specific props** (§6). Titles/taglines listed here are **overlay text (HTML), not baked into the image** (§5).

### L1 — Concierge (warm, golden, intimate)
| Zone id | Room | Unique focal feature | Hair-specific cue | Overlay title / tagline |
|---|---|---|---|---|
| `reception` | Reception | Grand double staircase + reception desks + diamond logo wall | Lookbooks, a styled mannequin flanking the desk | RECEPTION · *Welcome to the House* |
| `founder-suite` | Founder Suite | Executive desk, awards/press shelving, portrait wall | Framed campaign imagery, signature unit on a stand | FOUNDER SUITE · *Lead. Build. Inspire. Repeat.* |
| `psa-suite` | PSA Suite | Glowing portal/console (the founder-AI presence) + advisory lounge | Color rings / texture swatches styled as art | PSA SUITE · *Plan. Strategize. Accelerate.* |

### L2 — Gallery (jewel-lit, celebratory)
| Zone id | Room | Unique focal feature | Hair-specific cue | Overlay title / tagline |
|---|---|---|---|---|
| `slay-cam-gallery` | Slay Cam Gallery | Row of **lit picture frames** (empty → filled with real client looks) | Frames = client transformation portraits | SLAY CAM GALLERY · *You Slay. We Celebrate.* |
| `members-lounge` | Members Only Lounge | Velvet-rope intimacy, central crystal table | Exclusive drop teasers on plinths | MEMBERS ONLY LOUNGE · *Exclusive Access. Exclusive Rewards.* |
| `rewards-gallery` | Rewards Gallery | Grid of **glowing display niches** (reward vitrines) | Vouchers/perks shown as collectible objects | REWARDS GALLERY · *Collect. Unlock. Slay.* |

### L3 — Lobby (grand daylight)
| Zone id | Room | Unique focal feature | Hair-specific cue | Overlay title / tagline |
|---|---|---|---|---|
| `build-a-wig-atelier` | Build-A-Wig Atelier | **Texture / length / color sample walls** + central design island | Already hair-perfect — keep + add wig pedestals | BUILD-A-WIG ATELIER · *Design. Customize. Slay.* |
| `grand-lobby` | Grand Lobby | Sweeping double staircase, central marble plinth | Hero unit on a lit pedestal as the arrival statement | GRAND LOBBY · *Step Inside* |
| `lounge` | Lounge | Large cinema screen wall (lounge TV) | Tutorial/lookbook content stills on screen | THE LOUNGE · *Watch. Learn. Get Inspired.* |

### L4 — Penthouse (night, cinematic, apex)
| Zone id | Room | Unique focal feature | Hair-specific cue | Overlay title / tagline |
|---|---|---|---|---|
| `analysis-lab` | Hair Analysis Lab | Backlit diagnostic console / scanning bay | Strand analysis displays, density/texture readouts | HAIR ANALYSIS LAB · *Know Your Hair* |
| `showroom` | Hair Showroom | Pedestal ring of illuminated **wig busts** | Full unit lineup on lit mannequins | HAIR SHOWROOM · *The Collection* |
| `boutique` | Extensions Boutique | Backlit shelving of bundles/extensions as luxury retail | Bundles styled like fine goods, not stock | EXTENSIONS BOUTIQUE · *Curated Lengths* |

---

## 5. Text-free renders + HTML overlay spec (mandatory)

**Generate every room with NO text in the image.** Walls stay clean (blank marble where the wordmark would go). All titles, taglines, prices, CTAs are real DOM elements.

Why: perfect/locked typography, instant rename + localization, no AI letterform errors (e.g. the broken `Wi` in `BUILD-A-WiG`), no collisions with live UI, one consistent type system across all rooms.

Overlay typography (matches brand system):
- **Room title:** Futura PT Medium/Demi, uppercase, tracked. Color `#1A1A1A` on bright floors, `#FFFFFF` on dark (Penthouse).
- **Tagline:** "Covered By Your Grace" or Futura PT Book, sentence/title case, smaller, brand red `#EB1C24` permitted here as the accent.
- **Placement:** centered over the room's hero wall, within the **center-safe band** (§6) so it never lands on cropped edges.
- **Legibility:** if a wall is busy behind the title, use a subtle radial scrim (`rgba(0,0,0,0.0→0.18)`) behind the text only — never a hard box. (The scene already applies a global vignette in `DesktopFloorZonePage`.)
- Build the title block as a small reusable component so every room renders identical type treatment.

When replacing the current baked-text assets, regenerate clean and move the wordmark to the overlay in the same PR so no room briefly shows two titles.

---

## 6. Composition & responsive safe-area rules

- **Master aspect ratio:** **21:9** (the rooms are already wide-panoramic). Provide one master per room.
- **Center-safe band:** keep the **hero wall + focal feature + any signage anchor within the central 60% width and central 75% height.** Sides and top/bottom may be cropped on other ratios.
- **Crop targets that must still look intentional:** 16:9 (standard desktop), 4:3 / 3:2 (small laptops), and up to 32:9 (ultrawide → reveals more side architecture, never empties the center).
- **Focal point:** dead-center, eye-level. The 880ms crossfade between zones looks best when focal points align — keep cameras consistent so transitions feel like *moving through* a building, not cutting between unrelated photos.
- **No critical content in the outer 12%** on any edge.
- Provide a 1px-safe **left/right symmetry** so mirrored crystal columns stay balanced when cropped.

---

## 7. Hair-house prop library (kill the "generic penthouse" read)

Every room must contain **at least two** unmistakably-hair cues so an outsider knows this is a hair brand within 1 second. Use from this library (styled as fine objects, lit like art):

- Illuminated **wig busts / faceless couture mannequins** wearing units.
- **Texture sample panels** (straight/wavy/curly), **length rulers**, **color swatch grids**.
- **Bundles/extensions** displayed like luxury leather goods on backlit shelves.
- **Frontal/closure** lace pieces framed as gallery art.
- Styling tools (shears, combs) rendered as sculptural brass objects — sparingly.

**Reduce/avoid:** liquor-bottle bar styling, generic objet d'art, anything that says "rich apartment" instead of "hair maison." Roses stay (brand signature); bottles go.

---

## 8. Export & performance specs

Current PNGs (~8MB) are too heavy and inconsistent. Target a cinematic entrance, not a loading spinner.

- **Format:** **AVIF** primary, **WebP** fallback. No production PNG/JPG heroes.
- **Sizes (width):** ship `2560`, `1920`, `1280` variants; serve via `srcset`/responsive picking.
- **Weight budget:** **≤ 600 KB** at 1920px AVIF (≤ 900 KB WebP). Hard ceiling **1 MB**.
- **Color:** sRGB, 8-bit, no embedded oversized ICC.
- **No baked text** (see §5).
- **Naming (replace opaque IDs):** `floor-zone--state.ext`, e.g. `lobby-atelier--master.avif`, `concierge-reception--master.avif`. Update `desktopFloorZoneBackgrounds.ts` + `desktopPenthouseRooms.ts` to the new names in the same PR.
- **Preload:** keep using `desktopRoomBackgroundCache.ts`; preload the **elevator-adjacent** floors' default zones so travel feels instant.

---

## 9. Master generation prompt template

Fill the `{{variables}}` per room (values from §3–§7). Always end with the **negative prompt**.

```
Ultra-photoreal architectural interior render, 21:9 panoramic, eye-level one-point
perspective, perfectly symmetrical composition centered on {{FOCAL_FEATURE}}.

A luxury HAIR MAISON room: white crystal-marble walls and mirror-polished marble floor,
cascading crystal-bead chandeliers and strand curtains, white tufted couture seating,
champagne-gold and chrome hardware, floor-to-ceiling glass revealing a {{SKYLINE_TIME}}
city skyline. Scattered red rose petals and red rose arrangements as the only saturated
accent.

Lighting: {{LIGHT_TEMP}}, {{MOOD}}. LED cove lighting outlining the architecture.

Hair-brand details (clearly visible, styled as fine art): {{HAIR_PROPS}}.

The center hero wall is CLEAN BLANK MARBLE with NO text and NO logo (title added later).
Gallery-quiet, uncluttered, generous negative space, high-end editorial finish, 8k detail,
realistic reflections and soft global illumination.

Negative prompt: any text, letters, words, typography, watermark, signage, logos;
people / faces; clutter; liquor bottles or bar styling; warm wood or non-marble walls;
asymmetry; fisheye distortion; low-res, plastic or CGI-game look; oversaturated colors.
```

**Worked example — `concierge-reception`:**
- `{{FOCAL_FEATURE}}` = a grand sweeping double staircase framing twin reception desks with a backlit diamond emblem on the rear wall
- `{{SKYLINE_TIME}}` = soft golden-hour dawn
- `{{LIGHT_TEMP}}` = warm 3000K golden glow
- `{{MOOD}}` = intimate, welcoming, calm
- `{{HAIR_PROPS}}` = a styled faceless mannequin wearing a signature unit beside each desk; a framed lookbook display

---

## 10. Acceptance checklist (a room can't ship until all pass)

- [ ] **One-building test:** with text hidden, reads as the same maison as the other rooms (§2).
- [ ] **Distinct-place test:** mood/light/focal clearly differ from its neighbors and match its floor's register (§3).
- [ ] **Hair test:** ≥ 2 unmistakable hair cues; no bar/penthouse-generic styling (§7).
- [ ] **No baked text** anywhere in the image; hero wall is clean for the overlay (§5).
- [ ] **Overlay** title/tagline renders in brand type, centered, legible, in the center-safe band (§5, §6).
- [ ] **Crop test:** focal point survives 16:9, 4:3, and 32:9 with nothing important in the outer 12% (§6).
- [ ] **Transition test:** brightness/exposure matches sibling zones so the 880ms crossfade doesn't flash.
- [ ] **Weight:** ≤ 600 KB AVIF @1920; 2560/1920/1280 variants exported (§8).
- [ ] **Wiring:** filename follows convention and the registry constant points to it (§1, §8).

---

## 11. Current asset inventory (replace these)

| Floor | Zone id | Current file (Supabase `live-preview/Desktop/`) | Has baked text? |
|---|---|---|---|
| Lobby | `build-a-wig-atelier` | `IMG_4011.png` | Yes — "BUILD-A-WiG ATELIER" (broken `i`) |
| Lobby | `grand-lobby` | `IMG_4013.png` | No |
| Lobby | `lounge` | `140E544B-…CE.png` | Yes — "THE LOUNGE" |
| Gallery | `slay-cam-gallery` | `IMG_4025.png` | Yes — "SLAY CAM GALLERY" |
| Gallery | `members-lounge` | `IMG_4034.png` | Yes — "MEMBERS ONLY LOUNGE" |
| Gallery | `rewards-gallery` | `IMG_4026.png` | Yes — "REWARDS GALLERY" |
| Concierge | `reception` | `IMG_4014.png` | Yes — "DESIGN. CUSTOMIZE. SLAY." |
| Concierge | `founder-suite` | `80957FCA-…39A.png` | Yes — "FOUNDER SUITE" |
| Concierge | `psa-suite` | `8D5E0E87-…72B.png` | Yes — "PSA SUITE" |
| Penthouse | `analysis-lab` | `A6B0A7CB-…F9.png` | (verify) |
| Penthouse | `showroom` | `7F16AAFA-…D3.png` | (verify) |
| Penthouse | `boutique` | `8358D320-…84.png` | (verify) |

**Priority order for re-gen:** (1) the broken-type assets (`build-a-wig-atelier`), (2) all baked-text rooms → clean + overlay, (3) weight pass on everything, (4) mood-gradient differentiation pass per floor.

---

### One-line summary
**Keep the shared DNA, vary mood by height, strip the baked text to overlays, make every room obviously *hair*, and ship them under 600KB.** Do that and the tower goes from "beautiful but same-y" to "a world you want to walk through."
