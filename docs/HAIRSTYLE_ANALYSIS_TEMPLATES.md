# Hairstyle analysis — static templates + population map

## Architecture

1. **Code-built card chrome** (`api/_lib/hairstyleAnalysisCardBlueprint.ts`) — marble, panels, static labels, rose markers; rendered by `hairstyleAnalysisBuiltTemplate.ts`. **Do not** use Supabase `IMG_*` PNGs as the composite base.
2. **Fal GPT Image 2 hair** — client selfie + match thumbnails (`hairstyleAnalysisHairGenerate.ts`).
3. **Sharp composite** — hair photos + Futura/CBYG values + stars on the built template (`hairstyleAnalysisCompositeCard.ts`).
4. **React composer** (`HairstyleAnalysisCard`) — dev overlay uses `src/data/hairstyleAnalysisCardBlueprint.json` (same slot map as server).

Demo: `/tools/hairstyle-analysis` (sign in → **Generate template preview**)

## Templates

| Tier | Asset |
|------|--------|
| Free | `IMG_2438.png` |
| 3 month | `IMG_2447.png` |
| 6 month | `IMG_2450.png` |
| 12 month / black | `IMG_2451.png` |

## Tier field maps (code)

| Tier | Overlay fields |
|------|----------------|
| **free** | `clientName`, `clientImage`, `topScore`, `rating`, `specTexture…specStyle`, `whyLine-0…4` |
| **three_month** | `clientName`, `clientImage`, `topScore`, `rating`, `spec*`, `match2…4-{texture,color,length,score}`, thumbs |
| **six_month** | `clientName`, `clientImage`, `topScore`, `rating`, `spec*`, `portfolio-0…4-{texture,color,length,score}`, thumbs |
| **twelve_month** | `clientName`, `clientImage`, `topScore`, `rating`, `spec*`, `alt-0…8-{color,length,score}`, thumbs, `whyLine-0…9` |

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
