import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import {
  premiumMatchRowValueSlots,
  type PixelRect,
} from './hairstyleAnalysisLayoutSlots.js';
import {
  buildTextPathsSvg,
  matchRowValueFontSize,
  textPathData,
} from './hairstyleAnalysisTextPaths.js';
import { displayLength, formatScorePercent } from './hairstyleAnalysisDisplay.js';

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function normalizeTier(tier: FalHairstyleAnalysis['tier']): Exclude<FalHairstyleAnalysis['tier'], 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
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

/** Overlay MATCH 02–04 texture/color/length/score values (Fal leaves those slots blank). */
export async function compositeHairstyleAnalysisMatchRows(
  falImageUrl: string,
  analysis: FalHairstyleAnalysis,
  _layoutOverrides?: CompositeLayoutOverrides
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const baseBuf = await fetchBuffer(falImageUrl);
  const matchRowOverlay = buildMatchRowOverlaySvg(analysis);
  if (!matchRowOverlay) return baseBuf;

  const overlayBuf = await sharp(matchRowOverlay).png().toBuffer();
  return sharp(baseBuf)
    .composite([{ input: overlayBuf, left: 0, top: 0 }])
    .png()
    .toBuffer();
}
