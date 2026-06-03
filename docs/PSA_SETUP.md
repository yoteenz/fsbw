# PSA — Personal Slay Assistant setup

PSA is the **premium members-only** holographic chat assistant (lower-right FAB + chat panel).  
**v1 scope:** FAQ, product catalog, and in-app navigation — no cart/booking/priority-message tools yet.

---

## What is already wired in the repo

| Piece | Path |
|-------|------|
| Chat API | `api/psa/chat.ts` → `POST /api/psa/chat` |
| Premium gate (server) | `api/_lib/psaPremiumCheck.ts` |
| FAQ / products / nav knowledge | `api/_lib/psaKnowledge.ts` |
| Floating widget | `src/components/psa/PsaAssistantWidget.tsx` |
| Global mount | `src/App.tsx` (`<PsaAssistantWidget />`) |
| Client API | `src/utils/psaApi.ts` |
| Avatar config | `src/constants/psaConfig.ts` |

---

## Step-by-step: wire everything after your avatar is ready

### Step 1 — Generate the avatar with Fal (reference photo)

Use **`fal-ai/nano-banana-pro/edit`** (same family as your NOIR live previews) or **`fal-ai/flux-pro`** for a crisp transparent character.

**You need 11 PNG/WebP files** (transparent background) — see **Avatar expression filenames** below.

| File | Expression | When the app shows it |
|------|------------|------------------------|
| `psa-avatar-neutral.png` | neutral | FAB default (chat closed) |
| `psa-avatar-neutral-smiling.jpg` | neutral-smiling | Chat open, idle |
| `psa-avatar-waving.png` | waving | ~2.2s when chat opens |
| `psa-avatar-listening.png` | listening | Input focused, empty |
| `psa-avatar-thinking-smiling.png` | thinking-smiling | Input focused, user typing |
| `psa-avatar-thinking.png` | thinking | Waiting on PSA reply |
| `psa-avatar-delighted.png` | delighted | Reply with positive keywords |
| `psa-avatar-sorry.jpg` | sorry | Error / system message |
| `psa-avatar-pointing.png` | pointing | Reply includes `/path` links |
| `psa-avatar-talking.jpg` | talking | ~2.8s after assistant reply |
| `psa-avatar-presenting.png` | presenting | Reply mentions units / products |

All paths are defined in `src/constants/psaConfig.ts` as `PSA_AVATAR_SRC`.

**Legacy names (no longer used):** `psa-avatar-idle.png` → use **`psa-avatar-neutral.png`** instead.

**Recommended Fal settings**

- **Model:** `fal-ai/nano-banana-pro/edit` (image + reference) or `fal-ai/flux-pro/kontext`
- **Aspect ratio:** `1:1` (square, cropped bust or 3/4 body)
- **Output:** PNG with **transparent background**
- **Reference:** Upload your photo as the identity reference (`image_url` / `image_urls` input per Fal model docs)

**Prompt (paste into Fal — attach your reference photo):**

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

HOLOGRAM-READY ART (important):
- Subject should feel slightly luminous / ethereal but NOT fully opaque CGI.
- Soft rim light: subtle cyan + magenta holographic edge glow (very light — CSS will add more on the site).
- Transparent background ONLY — no floor shadow, no backdrop, no gradient background.
- Avoid busy details at the outer edges (they get clipped in a circle).

NEGATIVE / AVOID:
- Purple cyberpunk UI panels, chat bubbles, screens, or device mockups in the image.
- Cartoon/anime distortion, plastic skin, wrong likeness, extra fingers, blurry face.
- Full-body tiny figure (too small for mobile FAB), text labels, “PSA” lettering in the art.

OUTPUT: One character on transparent PNG, high resolution (1024×1024 or 768×768), crisp edges for web.
```

**Optional second run (thinking pose):** Same prompt + ` "Expression: soft focused smile, eyes slightly down as if reading a message. Same outfit and likeness." `

**After Fal export:**

1. Download PNG(s).
2. Optional: run through [remove.bg](https://www.remove.bg) or Photoshop if edges aren’t clean.
3. Save to `public/assets/` using the filenames in the table above (e.g. `psa-avatar-neutral.png`).
4. Redeploy or refresh dev — no code change needed unless you use different filenames (then edit `src/constants/psaConfig.ts`).

---

### Step 2 — Add OpenAI API key (brain)

1. Create an API key at [OpenAI Platform](https://platform.openai.com/api-keys).
2. **Local:** add to `.env.local` (never commit):
   ```
   OPENAI_API_KEY=sk-...
   ```
3. **Vercel:** Project → Settings → Environment Variables → add `OPENAI_API_KEY` for Production + Preview.
4. Optional model override:
   ```
   PSA_OPENAI_MODEL=gpt-5.4-mini
   ```
   Use `gpt-5.5` only if you want heavier reasoning (higher cost/latency).

Restart dev server after changing local env.

---

### Step 3 — Deploy the API route

1. Commit and push to `master` (and sync `preview/mobile`).
2. Confirm route exists: `POST https://YOUR-DEPLOYMENT/api/psa/chat`
3. Test with curl (replace token with a **premium** user’s Supabase JWT):
   ```bash
   curl -s -X POST "https://YOUR-DEPLOYMENT/api/psa/chat" \
     -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message":"What units do you sell?"}'
   ```
   Expected: `{ "reply": "...", "responseId": "...", "model": "gpt-5.4-mini" }`

**Common errors**

| Status | Meaning |
|--------|---------|
| 401 | Not signed in / bad token |
| 403 | Not premium (`PREMIUM_REQUIRED`) |
| 500 + `OPENAI_API_KEY is not configured` | Key missing on Vercel |

---

### Step 4 — Test on mobile (premium account)

1. Sign in as a user with **active premium subscription** or **BLACK** spend tier.
2. Open any non-admin page (e.g. `/home/shop`).
3. Lower-right: holographic **PSA** FAB should appear.
4. Tap → marble chat panel opens.
5. Try:
   - “How long does processing take?”
   - “Which unit is best for beach waves?”
   - “Where is my concierge page?”
6. Tap red **GO TO /path** links — should navigate in-app.

**Non-premium signed-in user:** tapping PSA shows **UPGRADE YOUR SUBSCRIPTION** modal → Rewards.

**Guest:** PSA hidden until signed in.

---

### Step 5 — Tune copy and knowledge (optional)

| What | Where |
|------|--------|
| Welcome message, avatar paths | `src/constants/psaConfig.ts` |
| FAQ / product / nav data | `api/_lib/psaKnowledge.ts` (keep aligned with `src/constants/brandFaqCopy.ts`) |
| PSA personality + rules | `buildPsaInstructions()` in `api/psa/chat.ts` |
| Hide widget on routes | `PSA_HIDDEN_PATH_PREFIXES` in `psaConfig.ts` |

---

## Phase 2 checklist (not in v1 — do later)

- [ ] **Cart tool** — add to bag from chat (`localStorage` + cloud sync)
- [ ] **Booking tool** — deep link + availability copy
- [ ] **Priority message tool** — 6mo+ → Concierge pipeline
- [ ] **Supabase threads** — `psa_threads` / `psa_messages` for history across devices
- [ ] **Voice** — `gpt-realtime-2` via WebRTC (separate from text chat)
- [ ] **3D avatar** — React Three Fiber + `.glb` only if 2D + CSS isn’t enough

---

## Architecture reminder

```
Mobile browser
  └─ PsaAssistantWidget (premium gate client-side)
       └─ POST /api/psa/chat (Bearer JWT)
            ├─ getPsaPremiumProfile (server gate)
            ├─ OpenAI Responses API (gpt-5.4-mini)
            └─ Tools: search_faq, search_products, suggest_navigation
```

**Never** call OpenAI from the browser with your secret key.

---

## Brand one-liner (for marketing)

> **PSA is your members-only Personal Slay Assistant** — your holographic hair concierge for product matching, install guidance, appointment help, priority support, and personalized slay recommendations.
