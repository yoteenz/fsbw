# PSA avatar — expression variants (NBP edit from base)

**Model:** `fal-ai/nano-banana-pro/edit` (NBP)  
**Input:** Base PSA avatar PNG (after Ideogram bg removal, or before — then Ideogram again per expression).  
**After each export:** Run **Ideogram** background removal — see `psa-avatar-background-removal-ideogram.md`.

**Batch script:** `npm run psa:avatar-expressions` → `scripts/generate-psa-avatar-expressions.mjs` (manifest in `scripts/psa-avatar-expression-manifest.mjs`). Default batch = **9 v5 expressions only**. Use `SKIP_IDEOGRAM=1` when you cut backgrounds manually.

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

**Recommended base for edits:** `public/assets/psa-avatar-neutral-smiling.png` (likeness-locked, already Ideogram-cut).

---

## Original expressions (v1) → filenames

| Slug | File | NBP expression line |
|------|------|---------------------|
| `neutral` | `psa-avatar-neutral.png` | Neutral relaxed expression, soft closed-mouth smile, eyes at camera, hands relaxed — default idle FAB. |
| `neutral-smiling` | `psa-avatar-neutral-smiling.png` | Warm open smile, eyes bright, approachable concierge idle in chat. |
| `waving` | `psa-avatar-waving.png` | Friendly wave with one hand raised near shoulder, welcoming smile. |
| `listening` | `psa-avatar-listening.png` | Attentive listening — slight head tilt, soft smile, eyes focused as if reading the member. |
| `thinking-smiling` | `psa-avatar-thinking-smiling.png` | Soft smile while thinking — eyes slightly down as if composing a reply while member types. |
| `thinking` | `psa-avatar-thinking.png` | Focused thinking — eyes slightly down, lips gently pressed, waiting on a reply. |
| `delighted` | `psa-avatar-delighted.png` | Genuinely delighted smile — bright eyes, subtle happy energy after good news. |
| `sorry` | `psa-avatar-sorry.png` | Apologetic but warm — soft concerned eyes, slight sympathetic frown, hands open. |
| `pointing` | `psa-avatar-pointing.png` | Helpful point off to the side with one hand — guiding member to a page or next step. |
| `talking` | `psa-avatar-talking.png` | Mid-sentence talking — mouth slightly open, engaged conversational energy. |
| `presenting` | `psa-avatar-presenting.png` | Palm-up presenting gesture — showcasing a product or recommendation with confident smile. |

---

## PSA v5 expressions (new) → filenames

| Slug | File | When the app shows it | NBP expression line |
|------|------|----------------------|---------------------|
| `remembering` | `psa-avatar-remembering.png` | Welcome memory hint, purchase-memory nudge, “I remember you chose…” replies | Soft warm smile, gentle knowing eyes as if recalling something personal — one hand lightly at chest, "I remember you" energy. |
| `remembering-ask` | `psa-avatar-remembering-ask.png` | Occasion capture ask (`SAVE WHY I BOUGHT THIS` → “in a few words, what was this for?”) | Gentle inviting expression, open hand toward member — occasion ask energy. |
| `memory-locked` | `psa-avatar-memory-locked.png` | Occasion saved (“LOCKED IN. I WILL REMEMBER…”) | Small satisfied close — lips together smile, subtle nod, locked-in confirmation. |
| `curator` | `psa-avatar-curator.png` | BLACK / private-client mood, Lounge or founder-pick replies | Composed half-smile, one eyebrow slightly raised — boutique curator energy, subtle hand gesture as if offering a private selection. |
| `honest-pushback` | `psa-avatar-honest-pushback.png` | Talk Me Out Of It, Should I Really Buy, What Might I Regret, Why This | Thoughtful serious expression, slight head tilt, one palm up in respectful "let me be real with you" gesture — honest pushback, not angry. |
| `archetype-quiz` | `psa-avatar-archetype-quiz.png` | During Slay Archetype quiz (3 lifestyle questions) | Attentive diagnostic lean-in, pen-or-tablet gesture, interviewer energy. |
| `archetype-reveal` | `psa-avatar-archetype-reveal.png` | ~2.8s after archetype quiz reveal (“YOUR SLAY ARCHETYPE IS…”) | Bright confident smile, both hands slightly raised in a small reveal — proud unveiling energy. |
| `red-carpet` | `psa-avatar-red-carpet.png` | Red Carpet Mode session (I HAVE AN EVENT) | Glamorous confident smile, shoulders back, elegant poised gesture — red carpet event concierge. |
| `blueprint` | `psa-avatar-blueprint.png` | Build My Entire Look, Event Ready replies | Focused expert smile, one hand tracing an invisible plan — architect of a full event look blueprint. |
| `slay-forecast` | `psa-avatar-slay-forecast.png` | Slay Forecast / Miami–Vegas climate maintenance replies | Concerned expert, slight furrow, finger raised — honest climate advice, not fear. |
| `celebrating` | `psa-avatar-celebrating.png` | Order celebration, Hall of Slay, proud/excited/celebratory mood | Joyful restrained celebration — open smile, subtle clap or small fist pump kept luxury-toned. |
| `reassuring` | `psa-avatar-reassuring.png` | Replies with calm reassurance (“don’t worry”, “you’re covered”) | Calm warm smile, soft eyes, both palms slightly forward in gentle reassurance. |
| `spotlight` | `psa-avatar-spotlight.png` | What Would You Pick? / founder conviction mode | Confident direct gaze, knowing smile, decisive chin-up — “this is what I would pick” energy. |

---

**UI mapping:** `src/components/psa/resolvePsaAvatarExpression.ts`  
**Server mood hint (optional):** `api/_lib/psaMood.ts` → `resolvePsaAvatarExpressionHint()`  
**Config / cache bust:** `src/constants/psaConfig.ts` → `PSA_AVATAR_SRC`, `PSA_AVATAR_ASSET_VERSION`

**Workflow when PNGs are not in repo yet:** Code is pre-wired; missing files fall back to `neutral` via `PsaAvatarImageCrossfade` `onError`. Drop Ideogram-cut PNGs into `public/assets/`, bump `PSA_AVATAR_ASSET_VERSION`, deploy.
