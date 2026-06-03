# PSA avatar — background removal (Ideogram on Fal)

**Model:** Ideogram (via Fal) — see `motherboard/golden-models/ideogram.md`  
**Task:** Remove background from PSA avatar exports; produce **true transparent PNG** for `public/assets/psa-avatar-*.png`.

**Why this model:** Best results so far in this stack for background removal (vs NBP fake gray/checkerboard transparency). User confirmed for all 11 PSA expressions (2026-06).

---

## Workflow

1. Start from NBP-generated avatar PNG (or any character export).
2. Open **Ideogram background removal** on Fal (attach source image).
3. Export **PNG with transparency**.
4. Rename to match `PSA_AVATAR_SRC` in `src/constants/psaConfig.ts`:
   - `psa-avatar-neutral.png`
   - `psa-avatar-neutral-smiling.png`
   - `psa-avatar-waving.png`
   - `psa-avatar-listening.png`
   - `psa-avatar-thinking-smiling.png`
   - `psa-avatar-thinking.png`
   - `psa-avatar-delighted.png`
   - `psa-avatar-sorry.png`
   - `psa-avatar-pointing.png`
   - `psa-avatar-talking.png`
   - `psa-avatar-presenting.png`
5. **Do not** run `scripts/psa-flatten-avatar-backgrounds.mjs` (that script is only for fake-transparent Fal gray/checkerboard exports).
6. Bump `PSA_AVATAR_ASSET_VERSION` in `psaConfig.ts` after upload.

---

## QA

- Corners of PNG should be **fully transparent** (alpha = 0), not gray or checkerboard.
- FAB uses holographic CSS in `src/components/psa/psaAssistant.css` — frame/img backgrounds stay **transparent** so alpha shows the ring.
