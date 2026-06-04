# PSA nudge + FAB — floating holographic glow background plate

**Use case:** Soft holo aura **behind** the 3D thought bubble and/or PSA avatar FAB — same energy as the PSA spinning ring + purple drop-shadow, but as a **single feathered glow plate** (no square crop, no spin in the asset).  
**Reference attachment:** Approved **3D holographic thought bubble** PNG — match its iridescent rim colors, glass luminosity, and floating feel.  
**Pair with:** `public/assets/psa-nudge-thought-bubble.png`, PSA avatar holo ring in `psaAssistant.css` (conic red → violet → cyan).

**Suggested models / tools:** NBP edit or GPT Image 2 edit — attach thought bubble + optional PSA avatar screenshot for color lock. Ideogram only if you need alpha cleanup (prefer native transparent PNG export).

**Export specs:** PNG **RGBA**, ~512–800px wide, **transparent center** (donut/soft ellipse) so bubble + avatar sit on top; glow strongest at bottom-center (stack anchor above FAB).

---

## Primary prompt

```
TASK: Create a floating holographic glow background plate for a luxury mobile UI assistant (PSA — Personal Slay Assistant, Frontal Slayer hair brand).

REFERENCE (attach approved 3D thought bubble image):
- Match the EXACT iridescent edge colors and glass luminosity from the reference thought bubble — pink/magenta left, violet/purple bottom, cyan/blue right, soft white highlight upper-left.
- Same premium 3D glass hologram mood as the reference — NOT a flat gradient PNG, NOT a UI rectangle.

WHAT TO GENERATE:
- A soft, feathered holographic aura / light bloom ONLY — no thought bubble shape, no text, no character, no avatar, no UI chrome.
- Form: vertical elliptical glow or gentle “column of light” anchored bottom-center, as if illuminating the circular PSA avatar below and the thought bubble above.
- Center ~60–75% transparent (hollow soft donut or very low-opacity core) so foreground PNG assets layer cleanly on top.
- Outer falloff: smooth radial fade to FULL TRANSPARENCY — no square matte, no hard bounding box, no visible canvas edge, no cropped halo corners.

PSA PALETTE (must align with avatar FAB ring):
- Brand red #EB1C24 / rgb(235, 28, 36)
- Holo violet rgb(160, 90, 255)
- Holo cyan rgb(120, 220, 255)
- Optional soft white core highlight ~30% opacity at upper-left of glow

MATERIAL / LIGHT:
- Ethereal volumetric light, subtle glass refraction feel, faint specular streaks.
- Very subtle horizontal scanline texture (≤5% opacity) optional — barely visible.
- Implied slow breathing luminosity in still frame (calm pulse, NOT motion blur, NOT spinning ring, NOT strobe).

COMPOSITION:
- Glow centered in frame with generous transparent margin (≥20% padding).
- Strongest intensity bottom-center (where FAB sits); lighter wash upward behind thought bubble zone.
- Isolated on transparent background for mobile overlay on white marble page.

OUTPUT:
- High-end 3D render or VFX-style light plate, production UI asset.
- Alpha channel: transparent outside soft glow only.
```

---

## Negative prompt / AVOID

```
AVOID: thought bubble silhouette, cloud shape, circle avatar, face, text, logos, square gradient card, rounded rectangle panel, solid black or white background fill, hard circular ring stroke, spinning motion blur, fast rotation, neon cyberpunk HUD, Matrix rain, lens dirt, starburst flare, duplicate glow layers, sharp 90° corners on glow, opaque center blob blocking foreground assets, drop shadow rectangle under glow.
```

---

## Match checklist (PSA CSS)

| PSA avatar FAB | Glow plate should echo |
|----------------|-------------------------|
| Conic ring red → violet → cyan | Same hues in soft bloom, no hard ring |
| `drop-shadow(0 0 14px rgba(160,90,255,0.45))` | Purple outer halo ~45% peak opacity |
| Scanlines overlay (subtle) | Optional ≤5% scanlines in glow |
| Slow idle float / breathe | Still asset implies gentle pulse only |

---

## Integration notes (dev)

- Suggested path: `public/assets/psa-nudge-holo-glow.png` behind `.psa-nudge-chip-art` and/or `.psa-avatar-frame` (z-index below bubble, above page).
- Bump a `PSA_NUDGE_GLOW_ASSET_VERSION` constant when replacing.
- Animate in CSS: 4–5s `opacity` + `scale(0.98–1.02)` pulse — **do not rotate** the PNG.
- Nudge vertical offset: `.psa-nudge-chip { bottom: calc(100% - 18px); }` (~10px closer to FAB vs prior `-8px`).

---

## Short prompt (quick regen)

```
Floating holographic glow background plate only, no bubble shape, match attached 3D thought bubble iridescent rim colors pink violet cyan, soft elliptical light bloom bottom-center transparent core, feathered fade full alpha outside, PSA Frontal Slayer luxury mobile UI, same glow as circular avatar holo ring red #EB1C24 purple cyan, volumetric ethereal glass light, transparent PNG, no square box no spin no text
```
