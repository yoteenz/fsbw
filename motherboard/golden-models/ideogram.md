# Ideogram (on Fal) — background removal

**Label:** Ideogram

**Best for (this stack):**
- **Removing backgrounds** — clean transparent PNG cutouts (best results so far vs NBP gray/checkerboard fake transparency)

**Confirmed use (2026-06):**
- **PSA (Personal Slay Assistant) avatar** — all 11 expression PNGs: user removed background with **Ideogram on Fal** before dropping assets in `public/assets/psa-avatar-*.png`.
- Do **not** run `scripts/psa-flatten-avatar-backgrounds.mjs` on these — they already have real alpha.

**When not to use:**
- Mannequin/wig product edits (use **NBP**).
- Full scene relight (use **GPT Image 2** or NBP multi-pass).

**Workflow:**
1. Generate character on Fal (often NBP for likeness — see `golden-prompts/psa-avatar-likeness-nbp.md`).
2. Run **Ideogram background removal** on Fal for final transparent export.
3. Save to `public/assets/` with names in `src/constants/psaConfig.ts` → `PSA_AVATAR_SRC`.
4. Bump `PSA_AVATAR_ASSET_VERSION` after replacing files.

**Note:** Exact Ideogram Fal endpoint slug may vary in Fal UI — record the slug you used in `golden-prompts/psa-avatar-background-removal-ideogram.md` when stable.
