# Style Analysis — Consult add-on & PSA selfie picks

Two related surfaces; **live try-on in Build-a-Wig is unchanged**.

## Wig consult add-on (all consult bookers)

**Where:** `/booking/consultation` → **STYLE ANALYSIS ADD-ON (OPTIONAL)** — choose **NO STYLE ANALYSIS** ($40 deposit only), **1 COMPARISON** (+$20), or **4 COMPARISONS** (+$60). When a paid tier is selected, **CHOOSE SELFIE** appears **inside that panel** (PSA-style upload). **Hair inspo** (above) is required for generation when the add-on is purchased; generation combines selfie + first inspo photo.

**Pricing (non-refundable add-on only):**

| Comparison options | Price | Output |
|-------------------|-------|--------|
| 1 | $20 | **1 pick** hairstyle analysis template (`IMG_2554`) — inspo vision suggests BAW catalog specs (unit, color, styling, length) on the client selfie |
| 4 | $60 | **4 pick** premium template (`IMG_2549`) — TOP MATCH = inspo hairstyle on client at suggested color; **MATCH 02–04** = same inspo hairstyle in **3** alternate catalog colors |

The **$40 consult deposit** is creditable toward the unit/install when the client claims their consult offer. Checkout total = **$40 deposit + add-on**. **Only the $40 deposit** returns as credit on the consult order — the style analysis fee is **non-refundable**.

**Generation pipeline (consult-only):** `POST /api/consult-style-analysis-generate` (signed in). Preferred fulfillment path: pass **manual specs** (`manualSpecs` / `inspoSpecs`) selected for the submitted hair inspo image; this skips OpenAI spec detection so Fal can focus on recreating the hairstyle while the chosen unit/color/length/style nudges the right model. If manual specs are omitted, OpenAI vision still maps inspo → BAW catalog specs (`consultStyleAnalysisInspoSpecs.ts`) as fallback. Consult fallback mapping uses the full BAW style set (bangs, flat iron, crimps, layers/define, wand curls, and bangs combos), high-detail color reads, and conservative 16"–30" even-length rounding so the template does not over-extend hair. Manual specs preserve the selected BAW length range (16"–40"). Fal **GPT Image 2** then populates the same templates as template hairstyle analysis (`generateHairstyleAnalysisWithFal`):

1. **Hair-only step:** Selfie + inspo → client wearing exact inspo hairstyle (geometry from inspo, identity from selfie), aligned to manual/manifest specs but with the photo as the visual source of truth.
2. **Template pass:** `six_month` → free 1-pick card; `twelve_month` → premium 4-pick card with color-only MATCH 02–04 thumbs. Both consult templates use the consult inspo lock; BAW styling refs are secondary and must not replace the photographed length, bangs/fringe, curl/crimp pattern, part, or silhouette.

**Admin debug:** `/tools/hairstyle-analysis` → **hair consult 1 pick / hair consult 4 pick** now requires selfie + hair inspo + **Manual specs for this hair inspo**. The TOP MATCH manual spec picker is sent as `manualSpecs`; 4-pick still keeps the same hairstyle and changes catalog color only for MATCH 02–04.

**Code:** `api/_lib/consultStyleAnalysisFal.ts`, `api/_lib/buildConsultHairstyleAnalysis.ts`, `api/_lib/consultStyleAnalysisInspoSpecs.ts`, `api/consult-style-analysis-generate.ts`, `src/utils/consultStyleAnalysisAddon.ts`, `src/utils/consultStyleAnalysisGenerate.ts`, `src/utils/consultStyleAnalysisInputs.ts`, `src/components/booking/ConsultStyleAnalysisAddonPicker.tsx`.

---

## PSA selfie analysis (premium members only)

**Where:** PSA chat → **MORE OPTIONS** → **FIND MY BEST LOOKS** (or chip match).

**Delivery:** Results return **within 24 hours** of selfie submission — not immediately in chat.

**Pick limits by subscription term:**

| Term | Max ranked picks |
|------|------------------|
| 3 months | 4 |
| 6 months | 6 |
| 12 months | 10 |

All **six units** are eligible. Output is **upsell-oriented** BAW configs (unit, length, density, color, styling, parting) with product cards + **OPEN … IN BAW** chips.

**API:** `POST /api/psa/selfie-style-analysis` — Bearer + premium gate; OpenAI vision JSON.

**Code:** `src/utils/psaSelfieStyleAnalysis.ts`, `api/_lib/psaSelfieStyleAnalysis.ts`, `src/components/psa/PsaSelfieStyleAnalysisPanel.tsx`.

---

## Live try-on

No change. NOIR (and existing) BAW live preview paths stay as documented in `motherboard/CORE.md`.

---

## Template hairstyle analysis cards (demo / Fal preview)

**Where:** `/tools/hairstyle-analysis` — Kateena sample data, **Generate template preview** (signed in).

**Allowance:** **3 / 6 / 12 month** premium subscribers get **1 free hairstyle analysis per UTC calendar month** (card tier matches subscription). API: `GET /api/hairstyle-analysis-usage`, enforced on `POST /api/hairstyle-analysis-generate` (refunds slot if Fal fails). Admins bypass the cap for testing. **Member-facing delivery:** results within **24 hours** of submission (PSA copy).

**After the monthly free is used:** members purchase another through checkout at the **same prices as the wig consult style analysis add-on** (not the $40 consult deposit): **1 comparison $20**, **4 comparisons $60**. Cart line type `hairstyle-analysis`; Stripe webhook grants paid credits. PSA tools: `get_hairstyle_analysis_status`, `purchase_hairstyle_analysis`.

**Model:** Fal **GPT Image 2** (`openai/gpt-image-2/edit`) populates the static Supabase template (`live-preview/Analysis/IMG_2554.png` free · `IMG_2549.png` premium) using the tier population prompt + client preview photo. Output **4:5** at **2048×2560**, `quality: medium` (~2K). API: `POST /api/hairstyle-analysis-generate`.

**In-image generation:** Fal fills TOP MATCH specs, **overall score %** (**Covered By Your Grace** red script, **petite** — ~22% of value-box height, max ~36px; erase large template placeholder % first), **match-rating stars** (embossed gradient red glyphs, ~17% of value-box height per star, max ~26px; erase ~118px premium template star outlines before drawing; **≥95% overall score = 5 filled**, **&lt;95% = 4 filled** with rightmost empty), **MATCH 02–04 row values** (texture, color, length, gray match score % `#808080` in each row's MATCH SCORE slot), photos, and every-detail-matters rows. **Server post-process after Fal:** **mirror reflection** below client photo fade only (`hairstyleAnalysisClientPhotoReflection.ts`). Optional photo fade refine (`HAIRSTYLE_ANALYSIS_CLIENT_PHOTO_POST_PROCESS=true`) — off by default for generic template analysis; **Hair consult templates force the bottom fade pass, clip generated portrait overflow below the intended photo/fade window before mirror reflection, and restore thin template chrome strips around the left photo panel** so the generated photo cannot erase the fade or glitch the main panel border. **No React text overlay** for overall score or match-rating stars on the client-facing card. **Client preview photo:** Fal **removes IMAGE 2 background**, centers the subject on a **9:16** portrait, **anchors near the bottom** of the left panel, and paints a **symmetrical even bottom fade** into template marble (hair edits only). **Server always composites** a **very low-opacity mirror reflection** below the fade to fill empty lower panel space. **Fal image refs (default):** template + client selfie + **BAW 2D hairline mannequin fronts** (`/assets/peak front.png`, `/assets/lagos front.png` — same as BAW hairline sub-page) when manifest HAIRLINE is **PEAK**, **LAGOS**, or **LAGOS + PEAK** (combo uses peak front); **forehead lace-edge shape only**, retinted to catalog color — not attached for NATURAL. Plus **BAW styling refs** (LAYERS / CRIMPS / FLAT IRON shape). Unit mannequin fronts are **opt-in** (`HAIRSTYLE_ANALYSIS_FAL_MANNEQUIN_REFS=true`) — default off to avoid mannequin neck/shoulder bleed; one-shoulder drape is prompt-led. Set `HAIRSTYLE_ANALYSIS_FAL_MINIMAL_REFS=true` to skip styling refs (template + client only). Part values are **MIDDLE / LEFT / RIGHT** only; style values use Build-a-Wig ids (**LAYERS**, **FLAT IRON**, **CRIMPS**, etc.). **COLOR** value fields show the catalog color name only (no hex or parentheses). Hair edits use **strand-level recolor** with **uniform BAW catalog tone root to tip** on custom colors (no dark roots on CHERRY, etc.). Each **TEXTURE** unit (NOIR silky straight, BLANCO silky straight — never kinky, SOFT WAVE, etc.) must match catalog pattern. **Every detail matters:** Fixed rose-icon rows — print **EVERY DETAIL MATTERS LINE** sentences verbatim (one facial feature + one spec per row; not motivational “why it works” copy). Fal prompt prioritizes preserving acrylic frost, **brand-red panel glow**, and marble texture from the static template.

**Dev fallback:** React overlay composer (collapsed under Advanced) for coordinate experiments only — not the client-facing path.

**Tier pick counts (card system):**

| Tier | Template | Output |
|------|----------|--------|
| Free | `IMG_2554.png` | 1 (top match only) |
| 3 / 6 / 12 month / black | `IMG_2549.png` | Top + 3 additional |

Paid tiers share one premium template (fewer rows, higher quality). Monthly free allowance still applies per subscription tier.

**Code:** `src/types/hairstyleAnalysis.ts`, `src/data/hairstyleCatalog.ts`, `src/utils/hairstyleAnalysisRules.ts`, `src/utils/hairstyleAnalysisTemplateLayouts.ts`, `src/utils/hairstyleAnalysisOverlayContent.ts`, `src/utils/hairstyleAnalysisPrompts.ts`, `src/components/hairstyle-analysis/*`, `src/pages/HairstyleAnalysisDemo.tsx`. Field map: `docs/HAIRSTYLE_ANALYSIS_TEMPLATES.md`.

**PSA API note:** Live PSA selfie endpoint still uses chat pick caps (3mo→4, 6mo→6, 12mo→10) until wired to this card composer via `buildHairstyleAnalysisFromPsaPicks()`.

---

## Phase 2 (not in v1 UI)

- Wire PSA selfie results → `HairstyleAnalysisCard` + template PNG export.
- Admin **Send offer** attaches generated `StyleAnalysisChart` to `consultOfferSnapshot` (inputs: order `consultStyleAnalysisSelfieUrl` + first `bookingInspoPhotoUrls` + `consultStyleAnalysisComparisonCount`; call `postConsultStyleAnalysisGenerate`).
- Persist PSA analysis runs in Supabase for rate limits / history.
