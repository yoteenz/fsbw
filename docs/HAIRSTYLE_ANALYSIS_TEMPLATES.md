# Hairstyle analysis — static templates + population map

## Architecture

1. **Static template PNG** (Supabase `live-preview/Analysis/`) — layout, icons, panels, typography, footer.
2. **Client preview image** — selfie with top-match hair (`buildClientHairstylePreviewPrompt()` upstream).
3. **Fal GPT Image 2** — `POST /api/hairstyle-analysis-generate` sends **template + client photo** with tier population prompt; returns finished **4:5 · 2K** card (`api/_lib/hairstyleAnalysisFal.ts`).
4. **React composer** (`HairstyleAnalysisCard`) — dev-only overlay preview under Advanced on the demo page.

Demo: `/tools/hairstyle-analysis` (sign in → **Generate template preview**)

## Templates (two physical assets)

| Tier | Asset | Matches |
|------|--------|---------|
| Free | `IMG_2554.png` | Top match only |
| 3 / 6 / 12 month (premium) | `IMG_2549.png` | Top + 3 additional |

Premium subscribers (3, 6, or 12 month) share one template so match rows are not overcrowded. Each paid tier still gets **1 free analysis per UTC calendar month** (entitlement tier follows subscription for API/usage).

## Tier field maps (code)

| Tier | Overlay fields |
|------|----------------|
| **free** | `clientName` (pill: TOP MATCH), `clientHeaderName`, `clientImage`, `topScore`, `rating`, `specTexture…specStyle`, `whyLine-0…4` |
| **three_month / six_month / twelve_month** | `clientName` (pill: TOP MATCH), `clientHeaderName`, `clientImage`, `topScore`, `rating`, `spec*`, `match2…4-{texture,color,length,score}`, thumbs |

Templates are **2048×2560 (4:5)**. Slot `%` positions in `hairstyleAnalysisTemplateLayouts.ts` are calibrated to those assets — enable **Debug** on the demo page to fine-tune.

Slot coordinates: `src/utils/hairstyleAnalysisTemplateLayouts.ts`  
Value builders: `src/utils/hairstyleAnalysisOverlayContent.ts`

## ChatGPT template prompts (reference)

Full verbatim prompts live in `src/utils/hairstyleAnalysisPrompts.ts`. They describe **what to fill**, not how to draw the card — the website mirrors that split.

## PSA wiring (phase 2)

1. Selfie analysis API returns ranked `PsaSelfieStylePick[]`.
2. `buildHairstyleAnalysisFromPsaPicks()` → `HairstyleAnalysis`.
3. Generate client preview with `buildClientHairstylePreviewPrompt(topMatch)`.
4. Render card + PNG download.
