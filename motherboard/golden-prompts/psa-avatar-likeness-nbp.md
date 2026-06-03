# PSA avatar — base character (NBP + reference photo)

**Model:** `fal-ai/nano-banana-pro/edit` (NBP) — see `motherboard/golden-models/nbp-nano-banana-pro.md`  
**Task:** Generate PSA “Personal Slay Assistant” character from **reference photo** (likeness).  
**After generation:** Background removal with **Ideogram** — see `psa-avatar-background-removal-ideogram.md`.

**Settings:** 1:1, 2K, PNG. Attach reference photo as identity input.

---

## Prompt

```
TASK: Create a premium holographic personal assistant avatar for a luxury hair brand mobile app.

IDENTITY (from reference photo):
- Preserve the reference subject's facial features, skin tone, bone structure, and overall likeness.
- Do NOT change ethnicity, age, or identity. This avatar should clearly look like the reference person.

CHARACTER DESIGN:
- Futuristic hair concierge / “Personal Slay Assistant” for Frontal Slayer.
- Confident, warm, luxury salon energy — approachable expert, not robotic.
- Wardrobe: sleek modern stylist look — black or deep charcoal base with subtle red accent (#EB1C24) (lapel trim, pin, or light glow).
- Hair: polished, editorial, salon-ready (can match or elevate reference hair).

COMPOSITION:
- Bust or 3/4 portrait, centered, facing camera slightly 3/4.
- Clean silhouette suitable for a circular FAB crop (88px on mobile).
- No text, no logos, no watermarks, no UI chrome.

HOLOGRAM-READY ART:
- Subject slightly luminous / ethereal; soft rim light (cyan + magenta edge glow, very light).
- Prefer solid neutral backdrop OR export flat for Ideogram bg removal next — avoid busy edges.
- Avoid busy details at outer edges (circular crop).

NEGATIVE / AVOID:
- Purple cyberpunk UI, chat bubbles, screens, device mockups.
- Cartoon/anime distortion, plastic skin, wrong likeness, extra fingers.
- Full-body tiny figure, “PSA” text in the art.

OUTPUT: High resolution (1024×1024), crisp edges.
```

---

## Also documented in

`docs/PSA_SETUP.md` (setup + wiring).
