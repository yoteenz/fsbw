import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import { resolveClientPhotoFadeSlotOrDefault } from './hairstyleAnalysisCompositeLayout.js';
import { applyClientPhotoBottomFade } from './hairstyleAnalysisClientPhotoFade.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { premiumMatchRowValueSlots } from './hairstyleAnalysisLayoutSlots.js';
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

/** Post-process: client photo bottom fade + MATCH 02–04 row values only (score/stars stay Fal in-image). */
export async function compositeHairstyleAnalysisMatchRows(
  falImageUrl: string,
  templateImageUrl: string,
  analysis: FalHairstyleAnalysis,
  _siteOrigin: string,
  layoutOverrides?: CompositeLayoutOverrides
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const [falBuf, templateBuf] = await Promise.all([
    fetchBuffer(falImageUrl),
    fetchBuffer(templateImageUrl),
  ]);

  const fadeRect = resolveClientPhotoFadeSlotOrDefault(layoutOverrides);
  let base = await applyClientPhotoBottomFade(falBuf, templateBuf, fadeRect);

  const matchRowOverlay = buildMatchRowOverlaySvg(analysis);
  if (matchRowOverlay) {
    const matchRowPng = await sharp(matchRowOverlay).png().toBuffer();
    base = await sharp(base)
      .composite([{ input: matchRowPng, left: 0, top: 0 }])
      .png()
      .toBuffer();
  }

  return base;
}
