# GPT Image 2 — `openai/gpt-image-2/edit`

**Label:** GPT2 (GPT Image 2 on Fal)

**Best for (this stack):**
- Recreating **detailed scenes** — complex relight, environment sync, multi-element composition
- Passes where NBP struggles with heavy scene preservation + fill (lobby/lounge wall color sync experiments)

**Used in repo (production — NOIR live previews):**
- `api/wig-preview/live-noir-color.ts` — color-tier L/M/R WebPs
- `api/live-wig-after-color-styling.ts` — after-color salon / bangs styling
- Shared input helper: `api/_lib/bawGptImage2FalInput.ts`

**Fal input pattern (NOIR live):**
- `prompt`, `image_urls`, `image_size: { width: 1536, height: 2048 }` (3:4 portrait, ~2K), `quality: 'medium'`, `output_format: 'webp'`

**Env:** `FAL_KEY`

**When not to use:**
- PSA avatar cutouts (use **Ideogram** for background removal).
- Lobby/lounge scene passes where **NBP** text accuracy is the default (unless explicitly testing GPT2).

**Golden prompts:** Scene-heavy multi-pass prompts — see lobby/lounge Fal docs in `docs/` and MEMORY 2026-05-* lobby/lounge entries.
