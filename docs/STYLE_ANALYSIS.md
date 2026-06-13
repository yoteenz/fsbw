# Style Analysis — Consult add-on & PSA selfie picks

Two related surfaces; **live try-on in Build-a-Wig is unchanged**.

## Wig consult add-on (all consult bookers)

**Where:** `/booking/consultation` → **STYLE ANALYSIS ADD-ON** (optional, below hair inspo).

**Pricing (non-refundable add-on only):**

| Comparison options | Price |
|-------------------|-------|
| 1 | $20 |
| 4 | $60 |

The **$40 consult deposit** remains separate and creditable per existing consult policy. Checkout total = **$40 + add-on** when selected.

**Fulfillment (v1 spec):** When admin sends the consult quote (~72h), attach a **style analysis chart** derived from the client’s **hair inspo** photos:

1. **Hero:** Client selfie composited in the inspo look (e.g. jet black layered curls).
2. **Comparisons:** Same silhouette/styling with alternate **colors & lengths** (count = tier).

Cart fields: `consultStyleAnalysisComparisonCount`, `consultStyleAnalysisNonRefundable`, `consultDepositUsd`.

Server quote: `api/_lib/pricing/resolveQuote.ts` adds add-on to `booking-consult` lines.

**Code:** `src/utils/consultStyleAnalysisAddon.ts`, `src/components/booking/ConsultStyleAnalysisAddonPicker.tsx`.

---

## PSA selfie analysis (premium members only)

**Where:** PSA chat → **MORE OPTIONS** → **FIND MY BEST LOOKS** (or chip match).

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

**Allowance:** **3 / 6 / 12 month** premium subscribers get **1 free hairstyle analysis per UTC calendar month** (card tier matches subscription). API: `GET /api/hairstyle-analysis-usage`, enforced on `POST /api/hairstyle-analysis-generate` (refunds slot if Fal fails). Admins bypass the cap for testing.

**After the monthly free is used:** members purchase another through checkout at the **same prices as the wig consult style analysis add-on** (not the $40 consult deposit): **1 comparison $20**, **4 comparisons $60**. Cart line type `hairstyle-analysis`; Stripe webhook grants paid credits. PSA tools: `get_hairstyle_analysis_status`, `purchase_hairstyle_analysis`.

**Model:** Fal **GPT Image 2** (`openai/gpt-image-2/edit`) populates the static Supabase template (`live-preview/Analysis/IMG_2554.png` free · `IMG_2549.png` premium) using the tier population prompt + client preview photo. Output **4:5** at **2048×2560**, `quality: medium` (~2K). API: `POST /api/hairstyle-analysis-generate`.

**In-image generation:** Fal fills TOP MATCH specs, **MATCH 02–04 row values** (texture, color, length, gray match score % `#808080` in each row's MATCH SCORE slot — always Fal in-image), photos, and every-detail-matters rows. **Server-composited after Fal:** **overall score %** (**Covered By Your Grace** red script + Futura **%** suffix, **petite** — ~22% of value-box height, max ~36px; restores template blank slot then overlays), **match-rating stars** (Noir **filled-star** / **star-symbol** at ~17% of value-box height per star, max ~26px; **≥95% overall score = 5 filled**, **&lt;95% = 4 filled** with rightmost empty). Fal must leave OVERALL SCORE and MATCH RATING value areas **blank** (erase template placeholders). Font picker affects dev overlay preview only. **Client preview photo:** Fal **removes IMAGE 2 background**, centers the subject on a **9:16** portrait, **anchors near the bottom** of the left panel, and paints a **symmetrical even bottom fade** into template marble (hair edits only). **Server always composites** a **very low-opacity mirror reflection** below the fade to fill empty lower panel space (`hairstyleAnalysisClientPhotoReflection.ts`). Optional server post-process (`HAIRSTYLE_ANALYSIS_CLIENT_PHOTO_POST_PROCESS=true`) can refine fade via chroma key — **off by default** so Fal output is not double-processed. **Fal image refs (default):** template + client selfie + **BAW styling refs** (LAYERS / CRIMPS / FLAT IRON shape). Unit mannequin fronts are **opt-in** (`HAIRSTYLE_ANALYSIS_FAL_MANNEQUIN_REFS=true`) — default off to avoid mannequin neck/shoulder bleed; one-shoulder drape is prompt-led. Set `HAIRSTYLE_ANALYSIS_FAL_MINIMAL_REFS=true` to skip styling refs (template + client only). Part values are **MIDDLE / LEFT / RIGHT** only; style values use Build-a-Wig ids (**LAYERS**, **FLAT IRON**, **CRIMPS**, etc.). **COLOR** value fields show the catalog color name only (no hex or parentheses). Hair edits use **strand-level recolor** with **uniform BAW catalog tone root to tip** on custom colors (no dark roots on CHERRY, etc.). Each **TEXTURE** unit (NOIR silky straight, BLANCO silky straight — never kinky, SOFT WAVE, etc.) must match catalog pattern. **Every detail matters:** Fixed rose-icon rows — print **EVERY DETAIL MATTERS LINE** sentences verbatim (one facial feature + one spec per row; not motivational “why it works” copy). Fal prompt prioritizes preserving acrylic frost, **brand-red panel glow**, and marble texture from the static template.

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
- Fal/GPT compositing pipeline for consult chart cells (`StyleAnalysisChart` in `src/types/styleAnalysis.ts`).
- Admin **Send offer** attaches generated chart to `consultOfferSnapshot`.
- Persist PSA analysis runs in Supabase for rate limits / history.
