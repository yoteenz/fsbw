# GPT Image 2 — `openai/gpt-image-2/edit`

**Label:** GPT2 (GPT Image 2 on Fal)

**Best for (this stack):**
- Recreating **detailed scenes** — complex relight, environment sync, multi-element composition
- Passes where NBP struggles with heavy scene preservation + fill (lobby/lounge wall color sync experiments)

**Used in repo (historical / selective):**
- Briefly tested for NOIR **UI-R** salon styling triples (`api/live-wig-after-color-styling.ts`); reverted to NBP for production (MEMORY 2026-04-22) due to timeout/cost—still valid for **offline scene** work.

**Fal input pattern (when used):**
- `prompt`, `image_urls`, `image_size: 'auto'`, `quality: 'medium'`, `output_format: 'webp'`

**Env:** `FAL_KEY`

**When not to use:**
- Default wig mannequin / color-tier edits (use **NBP**).
- PSA avatar cutouts (use **Ideogram** for background removal).

**Golden prompts:** Scene-heavy multi-pass prompts — see lobby/lounge Fal docs in `docs/` and MEMORY 2026-05-* lobby/lounge entries.
