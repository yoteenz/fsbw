import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import { resolveTopScoreSlot } from './hairstyleAnalysisCompositeLayout.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import {
  premiumMatchRowValueSlots,
} from './hairstyleAnalysisLayoutSlots.js';
import {
  buildTextPathsSvg,
  matchRowValueFontSize,
  overallScorePathItems,
  textPathData,
} from './hairstyleAnalysisTextPaths.js';
import { displayLength, formatScorePercent } from './hairstyleAnalysisDisplay.js';

const BRAND_RED = '#EB1C24';

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function normalizeTier(tier: FalHairstyleAnalysis['tier']): Exclude<FalHairstyleAnalysis['tier'], 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

function buildOverallScoreOverlaySvg(score: number, layoutOverrides?: CompositeLayoutOverrides): Buffer {
  const slot = resolveTopScoreSlot(layoutOverrides);
  return buildTextPathsSvg(overallScorePathItems(score, slot, BRAND_RED));
}

function buildMatchRowOverlaySvg(analysis: FalHairstyleAnalysis): Buffer | null {
  if (normalizeTier(analysis.tier) === 'free') return null;

  const slotById = new Map(premiumMatchRowValueSlots().map((slot) => [slot.id, slot]));
  const pathItems: Array<{ pathData: string; fill: string }> = [];

  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    const prefix = `match${i + 2}`;
    const values: Record<string, string> = {
      texture: look.unit.trim().toUpperCase(),
      color: look.color.trim().toUpperCase(),
      length: displayLength(look.length),
      score: formatScorePercent(look.score),
    };

    for (const key of ['texture', 'color', 'length', 'score'] as const) {
      const slot = slotById.get(`${prefix}-${key}`);
      if (!slot) continue;
      pathItems.push({
        pathData: textPathData(values[key], slot.rect, {
          fontFile: 'FuturaPTMedium.ttf',
          fontSize: matchRowValueFontSize(slot.rect),
          fill: slot.fill,
          align: 'left',
        }),
        fill: slot.fill,
      });
    }
  });

  if (pathItems.length === 0) return null;
  return buildTextPathsSvg(pathItems);
}

/** Overlay overall score % + MATCH 02–04 row values (Fal leaves those slots blank). */
export async function compositeHairstyleAnalysisMatchRows(
  falImageUrl: string,
  analysis: FalHairstyleAnalysis,
  layoutOverrides?: CompositeLayoutOverrides
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const baseBuf = await fetchBuffer(falImageUrl);
  const overlays: Buffer[] = [
    buildOverallScoreOverlaySvg(analysis.topMatch.score, layoutOverrides),
  ];
  const matchRowOverlay = buildMatchRowOverlaySvg(analysis);
  if (matchRowOverlay) overlays.push(matchRowOverlay);

  const compositeInputs = await Promise.all(
    overlays.map((overlay) => sharp(overlay).png().toBuffer())
  );

  return sharp(baseBuf)
    .composite(compositeInputs.map((input) => ({ input, left: 0, top: 0 })))
    .png()
    .toBuffer();
}
