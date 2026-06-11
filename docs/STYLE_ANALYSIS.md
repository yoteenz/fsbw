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

## Template hairstyle analysis cards (demo / composition layer)

**Where:** `/tools/hairstyle-analysis` — tier picker, Kateena sample data, PNG download.

**Model:** Fixed static templates (Supabase `live-preview/Analysis/IMG_2438|2447|2450|2451.png`) with **percentage-positioned overlays** — no AI-generated layout. AI upstream may only supply the **client hairstyle preview** image; React composes text + thumbs into the template.

**Tier pick counts (card system):**

| Tier | Output |
|------|--------|
| Free | 1 (top match only) |
| 3 month | Top + 3 additional |
| 6 month | Top + 6 additional |
| 12 month / black | Top + 9 additional |

**Code:** `src/types/hairstyleAnalysis.ts`, `src/data/hairstyleCatalog.ts`, `src/utils/hairstyleAnalysisRules.ts`, `src/components/hairstyle-analysis/*`, `src/pages/HairstyleAnalysisDemo.tsx`.

**PSA API note:** Live PSA selfie endpoint still uses chat pick caps (3mo→4, 6mo→6, 12mo→10) until wired to this card composer via `buildHairstyleAnalysisFromPsaPicks()`.

---

## Phase 2 (not in v1 UI)

- Wire PSA selfie results → `HairstyleAnalysisCard` + template PNG export.
- Fal/GPT compositing pipeline for consult chart cells (`StyleAnalysisChart` in `src/types/styleAnalysis.ts`).
- Admin **Send offer** attaches generated chart to `consultOfferSnapshot`.
- Persist PSA analysis runs in Supabase for rate limits / history.
