# PSA proactive nudge — 3D holographic thought bubble

**Use case:** Replace the CSS-built proactive nudge over the PSA FAB (e.g. “finish your customization” / “beach wave”).  
**Reference attachment:** Classic **comic cloud thought-bubble silhouette** — puffy scalloped cloud body + **three** descending tail orbs (app uses 3; reference sketch may show 2 — prefer **3** for parity).  
**Match:** PSA avatar holographic language (Frontal Slayer premium mobile UI).

**Suggested models / tools:**
- **Still hero:** `fal-ai/nano-banana-pro/edit` (NBP) or `openai/gpt-image-2/edit` — attach cloud silhouette as shape reference.
- **Transparent export:** Ideogram background removal — see `psa-avatar-background-removal-ideogram.md`.
- **Optional motion / 3D:** Spline, Rive, Lottie, or short WebM loop (slow pulse only — **no fast spin**).

**Export specs:** PNG with **alpha**, ~480–720px wide @2x, tail pointing **down-center** (toward circular avatar below). No baked-in text unless generating a marketing mock.

---

## Primary prompt

```
TASK: Design a 3D holographic thought bubble UI element for a luxury hair brand mobile assistant (PSA — Personal Slay Assistant).

SHAPE (follow attached reference exactly):
- Main body: classic comic “thought cloud” — soft puffy scalloped perimeter made of overlapping rounded lobes, NOT a rounded rectangle or pill.
- Tail: three small circular orbs trailing diagonally down from bottom-center toward the viewer (smallest orb farthest down) — like a speech thought trail.
- Silhouette must match the reference cloud outline; no square canvas edges, no hard bounding box visible in the art.

MATERIAL & HOLO STYLE (match PSA avatar FAB):
- Frosted glass interior: semi-transparent white (60–80% opacity feel), subtle backdrop blur, luxury tech glassmorphism.
- Iridescent holographic rim light cycling Frontal Slayer palette:
  • brand red #EB1C24
  • violet holo ~#A05AFF
  • cyan holo ~#78DCFF
- Soft inner shine highlight upper-left (screen blend feel), very subtle horizontal scanline texture (4–8% opacity max).
- Outer glow: feathered purple/cyan/red aura that fades smoothly to FULL TRANparency — no rectangular glow, no clipped corners, no visible square matte background.
- Slow “breathing” holo energy (implied in still: gentle luminosity variation) — calm premium, NOT aggressive spinning ring, NOT strobe, NOT cyberpunk HUD.

MOOD & BRAND:
- Frontal Slayer: luxury concierge, futuristic hair expert, holographic founder embodiment.
- Clean, editorial, mobile UI asset floating on white marble texture page.
- Feels lightweight, floating, ethereal — like a live thought appearing above a circular avatar.

COMPOSITION:
- Single thought bubble, centered in frame with generous transparent padding around the cloud silhouette (minimum 15% margin on all sides).
- Tail orbs point downward (6 o’clock direction).
- No character, no face, no PSA text, no logos, no watermarks, no phone mockup.

LIGHTING:
- Soft studio + rim light from upper left.
- Gentle shadow under cloud (very soft, does not create a square drop shadow card).

OUTPUT:
- Photoreal 3D render OR high-end 3D illustration suitable for game/UI overlay.
- Alpha-friendly: transparent outside cloud silhouette only.
```

---

## Negative prompt / AVOID

```
AVOID: rounded rectangle chat bubble, pill shape, square container, sharp 90° corners, visible bounding box, cropped halo, spinning motion blur, fast rotation, heavy neon cyberpunk, Matrix code rain, cartoon flat outline only, thick black stroke comic book, drop shadow rectangle, white or gray solid background fill, baked UI text, busy marble texture inside bubble, low-res jagged edges, duplicate bubbles, speech pointer triangle (use round tail orbs only).
```

---

## Color reference (PSA system)

| Role | Value |
|------|--------|
| Brand red | `#EB1C24` / `rgb(235, 28, 36)` |
| Holo violet | `rgb(160, 90, 255)` |
| Holo cyan | `rgb(120, 220, 255)` |
| Glass fill | `rgba(255, 255, 255, 0.6–0.8)` + frosted blur |
| Secondary UI gray (for future text overlay) | `#808080` |

---

## Integration notes (dev)

- Overlay **Bohemy lowercase** headline + Futura gray subline in CSS/HTML — do not rely on baked text in the PNG unless generating marketing stills.
- Prefer **slow pulse** animation (4–5s ease-in-out opacity/scale on glow) over rotating conic gradients (causes square clipping in CSS).
- Asset path suggestion: `public/assets/psa-nudge-thought-bubble-holo.png` (or WebP + `@2x`).
- Bump `PSA_NUDGE_ASSET_VERSION` (or similar) if adding a cache-bust constant when wired in.

---

## Short prompt (quick regen)

```
3D holographic frosted-glass thought cloud bubble, exact puffy comic cloud silhouette from reference, three small tail orbs descending below, iridescent rim red #EB1C24 violet cyan holo, soft feathered transparent glow no square box, luxury mobile UI PSA assistant, floating ethereal, transparent background, no text, no spin, slow pulse energy, Frontal Slayer premium hair brand
```
