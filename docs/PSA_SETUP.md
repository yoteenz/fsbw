# PSA — Personal Slay Assistant setup

PSA is the **premium members-only** holographic chat assistant (lower-right FAB + chat panel).  
**v1 scope:** FAQ, product catalog, and in-app navigation — no cart/booking/priority-message **actions** yet (PSA guides members to the right page).

### ChatGPT-style concierge spec vs PSA v1 (current)

| Capability | ChatGPT prompt intent | PSA today |
|------------|----------------------|-----------|
| Personality / brand voice | Warm luxury concierge; personal but bounded (pet names rare) | **Yes** — `buildPsaInstructions()` in `api/_lib/psaInstructions.ts` |
| Session context (page, cart, orders, tier) | Know where member is | **Yes** — client `buildPsaClientSessionContext()` → `POST /api/psa/chat` `context` → injected in instructions |
| Persistent chat history | Cross-device threads | **Yes** — Supabase threads; auto-title from first question; **ARCHIVE** / **DELETE** in HISTORY; **CONTINUE CHAT** on FAB |
| Rich cards + quick replies | Premium chat UI | **Yes** — product/nav/order cards from tool trace; `>>QUICK:` suffix chips |
| Proactive FAB nudges | Unsigned forms, expiring consults, stock | **Yes** — `computePsaProactiveNudge()` + badge/chip on FAB |
| Build-a-Wig deep links / pre-fill | Advice → action | **Yes** — `open_build_a_wig` tool + `prefill_baw` client action |
| Build-a-Wig draft saving | Resume later | **Yes** — `save_build_a_wig_draft` tool + local `psaBawDraft_*` + server `bawDraft` in member context |
| Founder notes | Founder opinions, not AI recs | **Yes** — `api/_lib/psaFounderNotes.ts` injected in knowledge |
| Concierge memory cards | Tiny preference snippets | **Yes** — `remember_member_preference` → `psa_member_context` JSON |
| Hair Slayer profiles | Style archetypes | **Yes** — `set_hair_slayer_profile` (EFFORTLESS, CEO, SOFT GLAM, etc.) |
| Talk Me Out Of It / honesty | Trust over sales | **Yes** — session `mode: talk_me_out_of_it` + instructions |
| Event Ready roadmap | Transformation plan | **Yes** — session `mode: event_ready` + instructions |
| What Would You Pick | Founder conviction | **Yes** — session `mode: what_would_you_pick` + founder notes |
| Smart order celebrations | Placed / shipped / delivered | **Yes** — `computePsaProactiveNudge()` order_celebration + one-time localStorage |
| Lounge content matching | Deep-link lessons | **Yes** — `api/_lib/psaLoungeLessons.ts` in knowledge |
| Slay Readiness Score | Finish checkout funnel | **Yes** — `computePsaSlayReadiness()` in session context |
| Proactive BAW nudge | Abandoned customization | **Yes** — draft + incomplete session detection |
| Starter quick-reply chips | Mobile UX | **Yes** — `PSA_STARTER_QUICK_REPLIES` in welcome thread |
| Tier voice differentiation | 3mo / 6mo / 12mo feel | **Yes** — `buildPsaTierVoiceBlock()` in instructions |
| Typing delay (300–700ms) | Human pause | **Yes** — client `usePsaChat` before clearing `isSending` |
| Product catalog | Raw hair / units | **Yes** — `search_products` + 6 units in `psaKnowledge.ts`; **starting base USD prices** via `api/_lib/psaCatalogPricing.ts` (synced with `resolveQuote.ts`) |
| Length, texture, density advice | Recommend | **Yes** — FAQ + Build-a-Wig context; directs to `/build-a-wig`; PSA can quote **starting base prices** and compare units (e.g. NOIR vs BLANCO) |
| FAQs, shipping, policies | Answer | **Yes** — `search_faq` (synced from `brandFaqCopy.ts` themes) |
| Loyalty + referrals + affiliate | Explain | **Yes** — FAQ entries + nav to `/account/rewards`, `/referrals`, `/affiliate` |
| Hair care + installation | Answer | **Yes** — FAQ (maintenance, bundles, cap size, beginner-friendly, etc.) |
| Book appointments | Book | **Navigate only** → `/booking/*` (Phase 2: in-chat booking tool) |
| Track orders | Live status | **Navigate only** → `/orders` (Phase 2: order lookup tool) |
| Add to cart / checkout | Act | **No (Phase 2)** |

Knowledge lives in **`api/_lib/psaKnowledge.ts`** (not a separate upload — append FAQ there; keep aligned with `src/constants/brandFaqCopy.ts`).

---

## What is already wired in the repo

| Piece | Path |
|-------|------|
| Chat API | `api/psa/chat.ts` → `POST /api/psa/chat` |
| Thread history API | `api/psa/thread.ts` (GET/PATCH/DELETE), `api/psa/threads.ts` |
| Usage API | `api/psa/usage.ts` → `GET /api/psa/usage` |
| Premium gate (server) | `api/_lib/psaPremiumCheck.ts` |
| Engagement limits | `api/_lib/psaEngagementLimits.ts` + `api/_lib/psaUsageLimit.ts` |
| FAQ / products / nav knowledge | `api/_lib/psaKnowledge.ts` |
| Floating widget | `src/components/psa/PsaAssistantWidget.tsx` |
| Global mount | `src/App.tsx` (`<PsaAssistantWidget />`) |
| Client API | `src/utils/psaApi.ts` |
| Avatar config | `src/constants/psaConfig.ts` |
| Marketing copy + limits | `src/constants/psaMembershipCopy.ts` |

### Tier-based chat limits (cost control)

| Plan | Messages / month | Messages / day |
|------|------------------|----------------|
| 3 month premium | 45 | 10 |
| 6 month premium | 90 | 18 |
| 12 month premium / BLACK | 180 | 30 |

Run migration **`20260606120000_psa_chat_threads.sql`** in Supabase. Limits reset on UTC calendar day / month. Founder test email bypasses caps (PSA-only).

Run migration **`20260607120000_psa_threads_context.sql`** for thread archive/summary + **`psa_member_context`** snapshot table.

---

## Step-by-step: wire everything after your avatar is ready

### Step 1 — Generate the avatar with Fal (reference photo)

**Likeness / character:** **`fal-ai/nano-banana-pro/edit`** (NBP) — prompt in **`motherboard/golden-prompts/psa-avatar-likeness-nbp.md`**.

**Background removal (after generation):** **Ideogram on Fal** — best results in this stack; see **`motherboard/golden-models/ideogram.md`** and **`motherboard/golden-prompts/psa-avatar-background-removal-ideogram.md`**. Do **not** use NBP alone for final transparent cutouts.

Golden model index: **`motherboard/golden-models/README.md`**.

**You need 20 PNG files** (transparent background) — 11 original + **9 PSA v5** expressions. See **Avatar expression filenames** below.

| File | Expression | When the app shows it |
|------|------------|------------------------|
| `psa-avatar-neutral.png` | neutral | FAB default (chat closed) |
| `psa-avatar-neutral-smiling.png` | neutral-smiling | Chat open, idle |
| `psa-avatar-waving.png` | waving | ~3.2s when chat opens |
| `psa-avatar-listening.png` | listening | Input focused, empty |
| `psa-avatar-thinking-smiling.png` | thinking-smiling | Input focused, user typing |
| `psa-avatar-thinking.png` | thinking | Waiting on PSA reply |
| `psa-avatar-delighted.png` | delighted | Reply with positive keywords |
| `psa-avatar-sorry.png` | sorry | Error / system message |
| `psa-avatar-pointing.png` | pointing | Reply includes `/path` links |
| `psa-avatar-talking.png` | talking | ~2.8s after assistant reply |
| `psa-avatar-presenting.png` | presenting | Reply mentions units / products |
| `psa-avatar-remembering.png` | remembering | Welcome memory hint, purchase-memory nudge, recall replies |
| `psa-avatar-remembering-ask.png` | remembering-ask | Occasion capture ask (“what was this unit for?”) |
| `psa-avatar-memory-locked.png` | memory-locked | Occasion saved (“LOCKED IN. I WILL REMEMBER…”) |
| `psa-avatar-curator.png` | curator | BLACK / Lounge / founder-pick curator energy |
| `psa-avatar-honest-pushback.png` | honest-pushback | Talk Me Out Of It, regret-prevention, honesty modes |
| `psa-avatar-archetype-quiz.png` | archetype-quiz | During Slay Archetype quiz questions |
| `psa-avatar-archetype-reveal.png` | archetype-reveal | After Slay Archetype quiz reveal |
| `psa-avatar-red-carpet.png` | red-carpet | Red Carpet Mode session |
| `psa-avatar-blueprint.png` | blueprint | Build My Entire Look / Event Ready blueprint replies |
| `psa-avatar-slay-forecast.png` | slay-forecast | Slay Forecast / climate maintenance (Miami, Vegas, humidity) |
| `psa-avatar-celebrating.png` | celebrating | Order celebration, milestones, proud/excited mood |
| `psa-avatar-reassuring.png` | reassuring | Calm reassurance replies |
| `psa-avatar-spotlight.png` | spotlight | What Would You Pick? / founder conviction |

All paths are defined in `src/constants/psaConfig.ts` as `PSA_AVATAR_SRC`.

**Generate v5 batch (NBP):** `npm run psa:avatar-expressions` — see `scripts/generate-psa-avatar-expressions.mjs`. Use `SKIP_IDEOGRAM=1` when you remove backgrounds manually; full prompts in `motherboard/golden-prompts/psa-avatar-expressions-nbp.md`.

**Before PNGs land:** Resolver is pre-wired; missing files fall back to neutral via image `onError`. Bump `PSA_AVATAR_ASSET_VERSION` after you add files.

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
4. **If your PNGs already have a real transparent background** (Ideogram / Fal / Photoshop), **stop here** — do **not** run `psa-solidify-avatar-alpha.mjs` or `psa-flatten-avatar-backgrounds.mjs`. Those scripts degrade quality and punch holes in the cutout.
5. Bump `PSA_AVATAR_ASSET_VERSION` in `src/constants/psaConfig.ts` whenever you replace PNGs so browsers/CDN fetch fresh files.
6. Redeploy or hard-refresh — no code change needed unless you use different filenames (then edit `src/constants/psaConfig.ts`).

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
| 401 | Not signed in or expired JWT |
| 403 `PREMIUM_REQUIRED` | Supabase profile not premium (founder: use Rewards toggle sync or bypass after deploy) |
| 500 + `OPENAI_API_KEY is not configured` | Key missing **on the Vercel deployment that served the request** — see troubleshooting below |
| 502 empty response | OpenAI returned no text |

---

### OPENAI_API_KEY troubleshooting (key “already added” but PSA still fails)

**Important:** PSA chat runs on **Vercel serverless**, not in your browser. **`OPENAI_API_KEY` in `.env.local` does not affect `https://fsbw.vercel.app`** when you use the live site or `npm run dev` (Vite proxies `/api` to Vercel by default).

1. **Verify the deployment** — after this doc was added, open:
   ```
   https://fsbw.vercel.app/api/psa/health
   ```
   Expect: `{ "openaiConfigured": true, ... }`. If `false`, Vercel still has no key on that deploy.

2. **Variable name must be exact:** `OPENAI_API_KEY` (no `VITE_` prefix — Vite-prefixed vars are frontend-only and are **not** sent to API routes).

3. **Environment scope in Vercel:** check **Production** and **Preview** (preview/mobile branch deploys use Preview). “Development” alone does **not** update live/preview URLs.

4. **Redeploy required:** adding/changing env vars does not update already-running functions until you **Redeploy** (Deployments → … → Redeploy).

5. **Local API with `.env.local`:** only works with **`npx vercel dev`** (loads server env). Plain **`npm run dev`** still proxies `/api/psa/chat` to Vercel unless you change proxy settings.

6. **No quotes in Vercel value:** paste `sk-...` only, not `"sk-..."`.

7. **Quota error but you have credits — wrong org/key:** OpenAI credits are **per organization**. API keys belong to whichever org was selected when the key was created.
   - Open [platform.openai.com/api-keys](https://platform.openai.com/api-keys) — use the **org switcher** (top-left) and pick the org that has billing/credits.
   - Create a **new secret key** while that org is selected.
   - Match keys: open `https://fsbw.vercel.app/api/psa/health?probe=1` and compare **`keyFingerprint`** (first 8 + last 4 chars) with the key in OpenAI (or reveal `OPENAI_API_KEY` in Vercel and compare prefix/suffix).
   - After PSA chat, check [platform.openai.com/usage](https://platform.openai.com/usage) — if **no requests** appear under the credited org, Vercel is still using a key from another org.
   - Paste the new key into Vercel `OPENAI_API_KEY` → **Redeploy**.

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

**Founder admin testing:** Rewards **STANDARD / 3 / 6 / 12 MONTH** toggles now **`PATCH /api/profile`** (Supabase). PSA chat also allows **`kateenaarmstrong@gmail.com`** via server bypass if profile is stale (`api/_lib/psaPremiumCheck.ts`).

**Guest:** PSA hidden until signed in.

---

### Step 5 — Tune copy and knowledge (optional)

| What | Where |
|------|--------|
| Welcome message, avatar paths | `src/constants/psaConfig.ts` |
| FAQ / product / nav data | `api/_lib/psaKnowledge.ts` (keep aligned with `src/constants/brandFaqCopy.ts`) |
| PSA personality + rules | `api/_lib/psaInstructions.ts` (founder voice — not help desk); welcome copy `psaConfig.ts` |
| Hide widget on routes | `PSA_HIDDEN_PATH_PREFIXES` in `psaConfig.ts` |

---

## Phase 2 checklist

- [x] **Order lookup tools** — `get_member_orders`, `get_order_status` (`api/_lib/psaTools.ts`)
- [x] **Cart tools** — `get_member_cart`, `add_to_cart` (+ `clientActions: sync_cart`)
- [x] **Booking handoff** — `prepare_booking_handoff` + `add_to_cart` booking lines → `/checkout/bookings`
- [x] **Priority message tool** — `send_priority_message` (needs Supabase migration `20260603180000_priority_messages.sql`)
- [x] **Supabase threads** — `psa_threads` / `psa_messages` for history across devices (`20260606120000_psa_chat_threads.sql`)
- [x] **Thread context** — archive/delete, rolling summary for long chats, `psa_member_context` snapshot (`20260607120000_psa_threads_context.sql`)
- [ ] **Concierge page** — POST priority message to API (not localStorage-only)
- [ ] **Admin inbox** — read `priority_messages` in admin hub
- [ ] **Voice** — `gpt-realtime-2` via WebRTC
- [ ] **3D avatar** — React Three Fiber + `.glb` only if 2D + CSS isn’t enough

Full wiring guide: **`docs/PSA_TOOLS.md`**

---

## Architecture reminder

```
Mobile browser
  └─ PsaAssistantWidget (premium gate client-side)
       └─ POST /api/psa/chat (Bearer JWT)
            ├─ getPsaPremiumProfile (server gate)
            ├─ OpenAI Responses API (gpt-5.4-mini)
            └─ Tools: search_faq, search_products, suggest_navigation
            └─ Action tools: get_member_orders, get_order_status, get_member_cart, add_to_cart, prepare_booking_handoff, send_priority_message
            └─ clientActions: sync_cart, navigate (see docs/PSA_TOOLS.md)
```

**Never** call OpenAI from the browser with your secret key.

---

## Brand one-liner (for marketing)

> **PSA is your members-only Personal Slay Assistant** — your holographic hair concierge for product matching, install guidance, appointment help, priority support, and personalized slay recommendations.
