# PSA avatar — expression variants (NBP edit from base)

**Model:** `fal-ai/nano-banana-pro/edit` (NBP)  
**Input:** Base PSA avatar PNG (after Ideogram bg removal, or before — then Ideogram again per expression).  
**After each export:** Run **Ideogram** background removal — see `psa-avatar-background-removal-ideogram.md`.

---

## Shared STYLE LOCK (prepend to every expression prompt)

```
STYLE LOCK — PSA AVATAR (do not drift):
- Treat the input as a photograph to preserve: same identity, face, skin tone, hair, outfit, jewelry, holographic rim glow, lighting, framing, and scale as the reference.
- Change ONLY the expression/pose described below. Do not change wardrobe, crop, or add UI.
- Bust or 3/4 portrait, centered, circular-FAB friendly.
- No text, logos, watermarks, phones, or chat bubbles.

Do not change anything else beyond the stated expression/pose edit.
```

**Negative (Fal):** `different person, wrong likeness, plastic skin, cartoon, extra fingers, new outfit, text, logo, full body tiny figure`

---

## Expressions → filenames

| Expression | File |
|------------|------|
| Neutral | `psa-avatar-neutral.png` |
| Neutral smiling | `psa-avatar-neutral-smiling.png` |
| Waving | `psa-avatar-waving.png` |
| Listening | `psa-avatar-listening.png` |
| Thinking while smiling | `psa-avatar-thinking-smiling.png` |
| Thinking | `psa-avatar-thinking.png` |
| Delighted | `psa-avatar-delighted.png` |
| Sorry | `psa-avatar-sorry.png` |
| Pointing | `psa-avatar-pointing.png` |
| Talking | `psa-avatar-talking.png` |
| Presenting | `psa-avatar-presenting.png` |

Expression-specific prompt lines match the PSA chat (2026-06) — neutral idle, thinking (eyes down), waving one hand, listening attentive, pointing off-side, presenting palm-up, etc. Regenerate from base with STYLE LOCK + one line per expression.

**UI mapping:** `src/components/psa/resolvePsaAvatarExpression.ts`
