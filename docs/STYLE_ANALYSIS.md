# Style Analysis — Consult add-on & PSA selfie picks

Two related surfaces; **live try-on in Build-a-Wig is unchanged**.

## Wig consult add-on (all consult bookers)

**Where:** `/booking/consultation` → **STYLE ANALYSIS ADD-ON** (optional, below hair inspo).

**Pricing (non-refundable add-on only):**

| Comparison options | Price |
|-------------------|-------|
| 1 | $20 |
| 3 | $40 |
| 6 | $60 |

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

**After the monthly free is used:** members purchase another through checkout at the **same prices as the wig consult style analysis add-on** (not the $40 consult deposit): **1 comparison $20**, **3 comparisons $40**, **6 comparisons $60**. Cart line type `hairstyle-analysis`; Stripe webhook grants paid credits. PSA tools: `get_hairstyle_analysis_status`, `purchase_hairstyle_analysis`.

**Model:** Fal **GPT Image 2** (`openai/gpt-image-2/edit`) populates the static Supabase template (`live-preview/Analysis/IMG_2438|2447|2450|2451.png`) using the tier population prompt + client preview photo. Output **4:5** at **2048×2560**, `quality: medium` (~2K). API: `POST /api/hairstyle-analysis-generate`.

**Dev fallback:** React overlay composer (collapsed under Advanced) for coordinate experiments only — not the client-facing path.

**Tier pick counts (card system):**

| Tier | Output |
|------|--------|
| Free | 1 (top match only) |
| 3 month | Top + 3 additional |
| 6 month | Top + 6 additional |
| 12 month / black | Top + 9 additional |

**Code:** `src/types/hairstyleAnalysis.ts`, `src/data/hairstyleCatalog.ts`, `src/utils/hairstyleAnalysisRules.ts`, `src/utils/hairstyleAnalysisTemplateLayouts.ts`, `src/utils/hairstyleAnalysisOverlayContent.ts`, `src/utils/hairstyleAnalysisPrompts.ts`, `src/components/hairstyle-analysis/*`, `src/pages/HairstyleAnalysisDemo.tsx`. Field map: `docs/HAIRSTYLE_ANALYSIS_TEMPLATES.md`.

**PSA API note:** Live PSA selfie endpoint still uses chat pick caps (3mo→4, 6mo→6, 12mo→10) until wired to this card composer via `buildHairstyleAnalysisFromPsaPicks()`.

---

## Phase 2 (not in v1 UI)

- Wire PSA selfie results → `HairstyleAnalysisCard` + template PNG export.
- Fal/GPT compositing pipeline for consult chart cells (`StyleAnalysisChart` in `src/types/styleAnalysis.ts`).
- Admin **Send offer** attaches generated chart to `consultOfferSnapshot`.
- Persist PSA analysis runs in Supabase for rate limits / history.
