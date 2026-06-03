# NBP — `fal-ai/nano-banana-pro` / `fal-ai/nano-banana-pro/edit`

**Label:** NBP (nano-banana-pro)

**Best for (this stack):**
- Recreating **mannequins** (Build-a-Wig NOIR live color, wig previews, baw-base images)
- **People** / likeness edits with reference attachments
- **Text accuracy** (logos, labels on props — e.g. lounge TV, lobby case, SLAY TOOLS signage)

**Used in repo today:**
- `api/wig-preview/live-noir-color.ts`
- `api/live-wig-after-color-styling.ts` (default styling path)
- `scripts/pregenerate-wig-previews.mjs`, `scripts/generate-baw-base-images.mjs`
- Lobby/lounge scene passes (`sceneLobbyDisplayCaseFal.ts`, lounge TV prompts)

**Env:** `FAL_KEY` (server + scripts). Often paired with Supabase Storage public URLs as `image_urls`.

**When not to use:**
- Final **background removal** for character cutouts — prefer **Ideogram** (see `ideogram.md`).
- Some **UI-R salon** experiments used GPT Image 2; production styling paths were reverted to NBP for consistency (see MEMORY 2026-04-22).

**Golden prompts:** See `motherboard/golden-prompts/` — wig preview templates in `scripts/wig-preview/promptTemplate.mjs`, lobby/lounge in `src/components/lounge/` and `scripts/lobby-*`.
